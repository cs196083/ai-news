/**
 * 키워드 검색 폼. GET 폼이라서 '검색' 버튼과 Enter 키 모두 /dashboard?q=... 로 이동한다.
 * 선택한 카테고리는 유지하고, 페이지는 1로 돌아간다.
 */
export function SearchBar({
  query,
  category,
}: {
  query: string;
  category: string;
}) {
  return (
    <form
      action="/dashboard"
      method="get"
      role="search"
      className="flex items-center gap-2"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={category} />
      )}
      {/* key: 주소의 검색어가 바뀌면(칩 이동 등) 입력칸도 새 값으로 맞춘다 */}
      <input
        key={query}
        type="search"
        name="q"
        defaultValue={query}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        maxLength={100}
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        검색
      </button>
    </form>
  );
}
