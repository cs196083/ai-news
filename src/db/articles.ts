import "server-only";
import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, notionSaves } from "./schema";
import type { FeedItem } from "@/lib/rss";

/** 아직 번역·요약·분류하지 않은 기사 (최신순). title_ko가 비어 있으면 처리 대상이다. */
export async function findUnenriched(userId: string, limit: number) {
  return db
    .select({
      id: articles.id,
      title: articles.originalTitle,
      excerpt: articles.excerpt,
    })
    .from(articles)
    .where(and(eq(articles.userId, userId), isNull(articles.titleKo)))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(limit);
}

/**
 * 번역·요약·분류 결과를 저장한다. 그 사이 다른 요청이 이미 처리한 기사는 덮어쓰지 않는다.
 */
export async function saveEnrichments(
  userId: string,
  enriched: Map<number, { titleKo: string; summaryKo: string; categoryId: number }>,
) {
  await Promise.all(
    [...enriched].map(([id, value]) =>
      db
        .update(articles)
        .set(value)
        .where(
          and(
            eq(articles.userId, userId),
            eq(articles.id, id),
            isNull(articles.titleKo),
          ),
        ),
    ),
  );
}

/** 아직 대표 이미지를 찾지 않은 기사 (최신순). image_url이 null이면 대상이다. */
export async function findWithoutImage(userId: string, limit: number) {
  return db
    .select({ id: articles.id, url: articles.originalUrl })
    .from(articles)
    .where(and(eq(articles.userId, userId), isNull(articles.imageUrl)))
    .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.id))
    .limit(limit);
}

/** 찾은 이미지 주소를 저장한다 (이미지가 없으면 ""). 이미 채워진 기사는 덮어쓰지 않는다. */
export async function saveImages(userId: string, images: Map<number, string>) {
  await Promise.all(
    [...images].map(([id, imageUrl]) =>
      db
        .update(articles)
        .set({ imageUrl })
        .where(
          and(
            eq(articles.userId, userId),
            eq(articles.id, id),
            isNull(articles.imageUrl),
          ),
        ),
    ),
  );
}

/** 이미 저장된 URL 집합. AI 호출 전에 중복을 걸러낼 때도 쓸 수 있다. */
export async function findExistingUrls(userId: string, urls: string[]) {
  if (urls.length === 0) return new Set<string>();
  const rows = await db
    .select({ url: articles.originalUrl })
    .from(articles)
    .where(and(eq(articles.userId, userId), inArray(articles.originalUrl, urls)));
  return new Set(rows.map((r) => r.url));
}

/**
 * 새 기사만 저장한다 (사용자별 원문 URL 중복은 무시). 번역·요약·카테고리는 비워 둔다.
 * 새로 저장된 개수를 돌려준다.
 */
export async function saveNewArticles(userId: string, items: FeedItem[]) {
  const existing = await findExistingUrls(
    userId,
    items.map((i) => i.url),
  );
  const fresh = items.filter((i) => !existing.has(i.url));
  if (fresh.length === 0) return { saved: 0, skipped: items.length };

  const inserted = await db
    .insert(articles)
    .values(
      fresh.map((i) => ({
        userId,
        originalTitle: i.title,
        originalUrl: i.url,
        source: i.source,
        publishedAt: i.publishedAt,
        excerpt: i.excerpt,
        imageUrl: i.imageUrl,
      })),
    )
    // 동시 클릭 등으로 사이에 저장된 건은 유니크 제약이 막는다.
    .onConflictDoNothing({ target: [articles.userId, articles.originalUrl] })
    .returning({ id: articles.id });

  return { saved: inserted.length, skipped: items.length - inserted.length };
}

/** 사용자가 수집한 기사 총 개수. */
export async function countArticles(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.userId, userId));
  return row?.value ?? 0;
}

/** 사용자의 기사 한 건 (다른 사용자의 기사는 찾을 수 없다). */
export async function findArticle(userId: string, id: number) {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), eq(articles.id, id)));
  return row;
}

/** 사용자의 기사 한 건을 삭제한다 (Notion 저장 기록은 cascade로 함께 지워진다). 지운 개수를 돌려준다. */
export async function deleteArticle(userId: string, id: number) {
  const deleted = await db
    .delete(articles)
    .where(and(eq(articles.userId, userId), eq(articles.id, id)))
    .returning({ id: articles.id });
  return deleted.length;
}

/** Notion에 저장된 기사의 페이지 주소. 저장 기록이 없으면 undefined. */
export async function findNotionUrl(articleId: number) {
  const [row] = await db
    .select({ url: notionSaves.notionPageUrl })
    .from(notionSaves)
    .where(eq(notionSaves.articleId, articleId));
  return row?.url;
}

/** 기사 id 목록 중 Notion에 저장된 것의 (기사 id → 페이지 주소). */
export async function findNotionUrls(articleIds: number[]) {
  if (articleIds.length === 0) return new Map<number, string>();
  const rows = await db
    .select({ id: notionSaves.articleId, url: notionSaves.notionPageUrl })
    .from(notionSaves)
    .where(inArray(notionSaves.articleId, articleIds));
  return new Map(rows.map((r) => [r.id, r.url]));
}

/**
 * Notion 저장 기록을 남긴다. 동시에 저장되어 이미 기록이 있으면 false (호출한 쪽이 중복 페이지를 정리한다).
 */
export async function recordNotionSave(articleId: number, url: string) {
  const inserted = await db
    .insert(notionSaves)
    .values({ articleId, notionPageUrl: url })
    .onConflictDoNothing({ target: notionSaves.articleId })
    .returning({ id: notionSaves.id });
  return inserted.length > 0;
}
