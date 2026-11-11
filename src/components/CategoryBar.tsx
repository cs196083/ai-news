import Link from "next/link";
import { categoryColor } from "@/lib/category-colors";

export type CategoryChip = {
  /** "all" | "none"(미분류) | 카테고리 id 문자열 */
  key: string;
  label: string;
  count: number;
  /** 사용자 카테고리의 id. 있으면 카테고리별 색을 쓴다 ("전체"는 없음) */
  categoryId?: number;
};

const base =
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const idle =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";

function chipHref(key: string, query: string) {
  const params = new URLSearchParams();
  if (key !== "all") params.set("category", key);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export function CategoryBar({
  chips,
  selected,
  query = "",
}: {
  chips: CategoryChip[];
  selected: string;
  /** 검색어. 있으면 칩을 옮겨도 유지한다 */
  query?: string;
}) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const isActive = chip.key === selected;
        const color =
          chip.categoryId !== undefined ? categoryColor(chip.categoryId) : null;
        return (
          <Link
            key={chip.key}
            href={chipHref(chip.key, query)}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${
              isActive ? (color?.active ?? active) : (color?.chip ?? idle)
            }`}
          >
            {chip.label}
            <span className="ml-1.5 text-xs opacity-70">{chip.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
