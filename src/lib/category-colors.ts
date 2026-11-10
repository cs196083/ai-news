// Tailwind는 클래스 문자열을 정적으로 읽으므로 색마다 전체 클래스를 그대로 적어 둔다.
// 카테고리 id로 색을 정해서 DB 변경 없이도 같은 카테고리는 항상 같은 색이 된다.
// (한 사용자의 기본 카테고리처럼 id가 연달아 있으면 팔레트 길이 안에서 색이 겹치지 않는다.)
export type CategoryColor = {
  /** 선택되지 않은 칩 */
  chip: string;
  /** 선택된 칩 */
  active: string;
  /** 카드의 카테고리 배지 */
  badge: string;
};

const PALETTE: CategoryColor[] = [
  {
    chip: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900",
    active: "border-rose-600 bg-rose-600 text-white",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  {
    chip: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900",
    active: "border-amber-600 bg-amber-600 text-white",
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900",
    active: "border-emerald-600 bg-emerald-600 text-white",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    chip: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900",
    active: "border-sky-600 bg-sky-600 text-white",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  {
    chip: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900",
    active: "border-violet-600 bg-violet-600 text-white",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    chip: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900",
    active: "border-orange-600 bg-orange-600 text-white",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    chip: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900",
    active: "border-teal-600 bg-teal-600 text-white",
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  },
  {
    chip: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 dark:border-fuchsia-900 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900",
    active: "border-fuchsia-600 bg-fuchsia-600 text-white",
    badge: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  },
];

export function categoryColor(categoryId: number): CategoryColor {
  return PALETTE[categoryId % PALETTE.length];
}
