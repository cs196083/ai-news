import { auth } from "@clerk/nextjs/server";
import { countArticles } from "@/db/articles";

const badgeClass =
  "inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300";

/** 대시보드 제목 옆에 수집된 뉴스 총 개수를 보여 주는 배지 (서버 컴포넌트). */
export async function ArticleCountBadge() {
  const { userId } = await auth();
  if (!userId) return null;

  const total = await countArticles(userId);
  return <span className={badgeClass}>총 {total.toLocaleString("ko-KR")}개의 뉴스</span>;
}

export function ArticleCountBadgeSkeleton() {
  return (
    <span
      aria-hidden
      className="inline-block h-7 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800"
    />
  );
}
