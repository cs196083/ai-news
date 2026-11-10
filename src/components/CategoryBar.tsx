import Link from "next/link";

export type CategoryChip = {
  /** "all" | "none"(미분류) | 카테고리 id 문자열 */
  key: string;
  label: string;
  count: number;
};

const base =
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
const idle =
  "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";

export function CategoryBar({
  chips,
  selected,
}: {
  chips: CategoryChip[];
  selected: string;
}) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const isActive = chip.key === selected;
        return (
          <Link
            key={chip.key}
            href={
              chip.key === "all" ? "/dashboard" : `/dashboard?category=${chip.key}`
            }
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? active : idle}`}
          >
            {chip.label}
            <span className="ml-1.5 text-xs opacity-70">{chip.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
