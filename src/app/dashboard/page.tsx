import { auth } from "@clerk/nextjs/server";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArticleCountBadge,
  ArticleCountBadgeSkeleton,
} from "@/components/ArticleCountBadge";
import { CategoryBar, type CategoryChip } from "@/components/CategoryBar";
import { FetchNewsButton } from "@/components/FetchNewsButton";
import { NewsCard } from "@/components/NewsCard";
import { NewsCardSkeleton } from "@/components/NewsCardSkeleton";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { ensureDefaultCategories } from "@/db/categories";
import { findNotionUrls } from "@/db/articles";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export const metadata = { title: "대시보드 · AI 뉴스 수집기" };

const PAGE_SIZE = 9;

/** LIKE 패턴의 특수문자(\ % _)를 글자 그대로 검색하도록 이스케이프한다. */
function likePattern(keyword: string) {
  return `%${keyword.replace(/[\\%_]/g, "\\$&")}%`;
}

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-50">
              AI 뉴스 수집기
            </h1>
            <Suspense fallback={<ArticleCountBadgeSkeleton />}>
              <ArticleCountBadge />
            </Suspense>
          </div>
          <FetchNewsButton />
        </div>
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

  const { category, page, q } = await searchParams;
  const keyword = (typeof q === "string" ? q : "").trim().slice(0, 100);
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

  const countOf = (id: number) =>
    counts.find((c) => c.categoryId === id)?.value ?? 0;
  const total = counts.reduce((sum, c) => sum + c.value, 0);

  const chips: CategoryChip[] = [
    { key: "all", label: "전체", count: total },
    ...userCategories.map((c) => ({
      key: String(c.id),
      label: c.name,
      count: countOf(c.id),
      categoryId: c.id,
    })),
  ];

  const selectedKey = chips.some((c) => c.key === selected) ? selected : "all";
  const categoryFilter =
    selectedKey === "all"
      ? undefined
      : eq(articles.categoryId, Number(selectedKey));

  // 검색어는 원문/한국어 제목, 한국어 요약, 발췌문에서 찾는다.
  const searchFilter = keyword
    ? or(
        ilike(articles.originalTitle, likePattern(keyword)),
        ilike(articles.titleKo, likePattern(keyword)),
        ilike(articles.summaryKo, likePattern(keyword)),
        ilike(articles.excerpt, likePattern(keyword)),
      )
    : undefined;
  const listFilter = and(eq(articles.userId, userId), categoryFilter, searchFilter);

  // 검색어가 없으면 선택한 카테고리의 기사 수는 칩 개수와 같다. 범위를 벗어난 page는 가장 가까운 페이지로 맞춘다.
  let filteredTotal = chips.find((c) => c.key === selectedKey)?.count ?? 0;
  if (keyword) {
    const [row] = await db.select({ value: count() }).from(articles).where(listFilter);
    filteredTotal = row?.value ?? 0;
  }
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const requestedPage = Number(typeof page === "string" ? page : 1);
  const currentPage = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;

  // 최신순: 발행일 내림차순(발행일이 없는 기사는 뒤로), 같으면 저장 시각·id 내림차순(페이지 간 순서 고정)
  const list = await db
    .select()
    .from(articles)
    .where(listFilter)
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.createdAt),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((currentPage - 1) * PAGE_SIZE);

  const notionUrls = await findNotionUrls(list.map((a) => a.id));
  const nameById = new Map(userCategories.map((c) => [c.id, c.name]));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategoryBar chips={chips} selected={selectedKey} query={keyword} />
        <div className="w-full sm:ml-auto sm:w-72">
          <SearchBar query={keyword} category={selectedKey} />
        </div>
      </div>
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-neutral-700">
          <p className="font-medium text-slate-700 dark:text-neutral-200">
            {total === 0
              ? "아직 가져온 뉴스가 없어요."
              : keyword
                ? `'${keyword}'에 해당하는 뉴스가 없어요.`
                : "이 카테고리에는 아직 뉴스가 없어요."}
          </p>
          {total === 0 && (
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              오른쪽 위 <strong>뉴스 가져오기</strong> 버튼을 눌러 보세요.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              notionUrl={notionUrls.get(article.id) ?? null}
              categoryName={
                article.categoryId
                  ? (nameById.get(article.categoryId) ?? null)
                  : null
              }
            />
          ))}
        </div>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        category={selectedKey}
        query={keyword}
      />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-9 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
