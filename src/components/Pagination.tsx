import Link from "next/link";

function href(category: string, page: number) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

// 1 … 4 5 [6] 7 8 … 20 형태로 현재 페이지 주변만 보여 준다.
function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set(
    [1, total, current - 1, current, current + 1].filter(
      (p) => p >= 1 && p <= total,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const item =
  "inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const idle =
  "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";
const disabled =
  "cursor-not-allowed border-slate-200 bg-white text-slate-400 opacity-60 dark:border-neutral-800 dark:bg-neutral-900";

export function Pagination({
  currentPage,
  totalPages,
  category,
}: {
  currentPage: number;
  totalPages: number;
  category: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {currentPage > 1 ? (
        <Link
          href={href(category, currentPage - 1)}
          className={`${item} ${idle}`}
        >
          이전
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} ${disabled}`}>
          이전
        </span>
      )}

      {pageList(currentPage, totalPages).map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-slate-500 dark:text-neutral-400"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(category, p)}
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={`${p}페이지`}
            className={`${item} ${p === currentPage ? active : idle}`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={href(category, currentPage + 1)}
          className={`${item} ${idle}`}
        >
          다음
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} ${disabled}`}>
          다음
        </span>
      )}
    </nav>
  );
}
