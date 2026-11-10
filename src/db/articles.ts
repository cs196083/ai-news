import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { articles } from "./schema";
import type { FeedItem } from "@/lib/rss";

/** 이미 저장된 URL 집합. 나중에 Claude 호출 전에 중복을 걸러낼 때 재사용한다. */
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
      })),
    )
    // 동시 클릭 등으로 사이에 저장된 건은 유니크 제약이 막는다.
    .onConflictDoNothing({ target: [articles.userId, articles.originalUrl] })
    .returning({ id: articles.id });

  return { saved: inserted.length, skipped: items.length - inserted.length };
}
