import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CategoryBar, type CategoryChip } from "@/components/CategoryBar";
import { NewsCard } from "@/components/NewsCard";
import { ensureDefaultCategories } from "@/db/categories";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const metadata = { title: "대시보드 · AI 뉴스 수집기" };

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-50">
          AI 뉴스 수집기
        </h1>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { category } = await searchParams;
  const selected = typeof category === "string" ? category : "all";

  await ensureDefaultCategories(userId);

  // 모든 조회는 로그인한 사용자 기준으로만 한다.
  const [userCategories, counts] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.id),
    db
      .select({ categoryId: articles.categoryId, value: count() })
      .from(articles)
      .where(eq(articles.userId, userId))
      .groupBy(articles.categoryId),
  ]);

  const countOf = (id: number | null) =>
    counts.find((c) => c.categoryId === id)?.value ?? 0;
  const total = counts.reduce((sum, c) => sum + c.value, 0);

  const chips: CategoryChip[] = [
    { key: "all", label: "전체", count: total },
    ...userCategories.map((c) => ({
      key: String(c.id),
      label: c.name,
      count: countOf(c.id),
    })),
    { key: "none", label: "미분류", count: countOf(null) },
  ];

  const selectedKey = chips.some((c) => c.key === selected) ? selected : "all";
  const categoryFilter =
    selectedKey === "all"
      ? undefined
      : selectedKey === "none"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, Number(selectedKey));

  // 최신순: 발행일 내림차순(발행일이 없는 기사는 뒤로), 같으면 저장 시각 내림차순
  const list = await db
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), categoryFilter))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.createdAt),
    );

  const nameById = new Map(userCategories.map((c) => [c.id, c.name]));

  return (
    <>
      <CategoryBar chips={chips} selected={selectedKey} />
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-neutral-700">
          <p className="font-medium text-slate-700 dark:text-neutral-200">
            {total === 0
              ? "아직 가져온 뉴스가 없어요."
              : "이 카테고리에는 아직 뉴스가 없어요."}
          </p>
          {total === 0 && (
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              뉴스 가져오기 기능이 연결되면 이곳에 카드로 표시돼요.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              categoryName={
                article.categoryId
                  ? (nameById.get(article.categoryId) ?? null)
                  : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-9 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}
