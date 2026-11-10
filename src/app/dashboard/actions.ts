"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  findUnenriched,
  findWithoutImage,
  saveEnrichments,
  saveImages,
  saveNewArticles,
} from "@/db/articles";
import { ensureDefaultCategories } from "@/db/categories";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { enrichArticles } from "@/lib/enrich";
import { fetchOgImage } from "@/lib/og-image";
import { fetchRecentFeedItems, type SourceFailure } from "@/lib/rss";

// 한 번에 처리할 최대 기사 수 (무료 한도·시간 상한). 남은 기사는 다음 가져오기 때 이어서 처리한다.
const ENRICH_LIMIT = 30;

// 이미지를 한 번에 찾을 최대 기사 수와 동시 요청 수 (원문 사이트에 부담을 주지 않도록 작게 유지).
const IMAGE_LIMIT = 30;
const IMAGE_CONCURRENCY = 5;

/**
 * 대표 이미지가 아직 없는 기사(이전에 가져온 것 포함)의 이미지를 기사 페이지에서 찾아 저장한다.
 * 이미지가 없는 기사는 ""로 기록해 다시 찾지 않고, 요청 자체가 실패한 기사는 다음에 다시 시도한다.
 */
async function fillImages(userId: string) {
  const pending = await findWithoutImage(userId, IMAGE_LIMIT);
  const found = new Map<number, string>();
  for (let i = 0; i < pending.length; i += IMAGE_CONCURRENCY) {
    await Promise.all(
      pending.slice(i, i + IMAGE_CONCURRENCY).map(async (a) => {
        const { image, ok } = await fetchOgImage(a.url);
        if (ok) found.set(a.id, image ?? "");
      }),
    );
  }
  await saveImages(userId, found);
}

export type FetchNewsState =
  | { status: "idle" }
  | {
      status: "done";
      saved: number;
      skipped: number;
      failures: SourceFailure[];
      enriched: number;
      /** 처리하지 못한 기사 수. -1이면 AI 단계 전체 실패 */
      enrichFailed: number;
    }
  | { status: "error"; message: string };

export async function fetchNewsAction(): Promise<FetchNewsState> {
  const { userId } = await auth();
  if (!userId) return { status: "error", message: "로그인이 필요해요." };

  try {
    const { items, failures } = await fetchRecentFeedItems();
    // 모든 소스가 실패한 경우만 전체 실패로 본다.
    if (items.length === 0 && failures.length > 0) {
      return {
        status: "error",
        message: `뉴스를 가져오지 못했어요 (${failures.map((f) => f.source).join(", ")}). 잠시 후 다시 시도해 주세요.`,
      };
    }
    const { saved, skipped } = await saveNewArticles(userId, items);

    // AI 처리 실패가 뉴스 가져오기 자체를 실패시키지 않도록 따로 처리한다.
    // 아직 번역하지 않은 기사(이전에 가져온 것 포함)만 보내므로 이미 처리된 기사는 다시 호출하지 않는다.
    let enriched = 0;
    let enrichFailed = 0;
    try {
      await ensureDefaultCategories(userId);
      const [userCategories, pending] = await Promise.all([
        db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(eq(categories.userId, userId))
          .orderBy(categories.id),
        findUnenriched(userId, ENRICH_LIMIT),
      ]);
      if (pending.length > 0) {
        const result = await enrichArticles(pending, userCategories);
        await saveEnrichments(userId, result.results);
        enriched = result.results.size;
        enrichFailed = result.failed;
      }
    } catch (e) {
      console.error("enrichment failed", e);
      enrichFailed = -1; // AI 단계 전체 실패
    }

    // 이미지는 부가 기능이라 실패해도 가져오기 결과에 영향을 주지 않는다.
    try {
      await fillImages(userId);
    } catch (e) {
      console.error("image fill failed", e);
    }

    revalidatePath("/dashboard");
    return { status: "done", saved, skipped, failures, enriched, enrichFailed };
  } catch (e) {
    console.error("fetchNewsAction failed", e);
    return {
      status: "error",
      message: "뉴스를 저장하는 중 문제가 생겼어요. 다시 시도해 주세요.",
    };
  }
}
