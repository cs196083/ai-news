"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { saveNewArticles } from "@/db/articles";
import { fetchRecentFeedItems, type SourceFailure } from "@/lib/rss";

export type FetchNewsState =
  | { status: "idle" }
  | {
      status: "done";
      saved: number;
      skipped: number;
      failures: SourceFailure[];
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
    revalidatePath("/dashboard");
    return { status: "done", saved, skipped, failures };
  } catch (e) {
    console.error("fetchNewsAction failed", e);
    return {
      status: "error",
      message: "뉴스를 저장하는 중 문제가 생겼어요. 다시 시도해 주세요.",
    };
  }
}
