const BAR_CLASS = "animate-pulse rounded bg-slate-200 dark:bg-neutral-800";

/** 뉴스 카드가 로딩되는 동안 보여 주는 뼈대. NewsCard와 같은 모양(이미지·배지·제목·요약·하단)을 따른다. */
export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className={`aspect-video w-full rounded-none ${BAR_CLASS}`} />
      <div className="flex flex-1 flex-col px-5 pb-3 pt-5">
        <div className="flex min-h-7 items-center justify-between gap-2">
          <div className={`h-5 w-16 rounded-full ${BAR_CLASS}`} />
          <div className={`h-4 w-20 ${BAR_CLASS}`} />
        </div>
        <div className={`mt-3 h-6 w-full ${BAR_CLASS}`} />
        <div className={`mt-2 h-6 w-2/3 ${BAR_CLASS}`} />
        <div className={`mt-4 h-4 w-full ${BAR_CLASS}`} />
        <div className={`mt-2 h-4 w-full ${BAR_CLASS}`} />
        <div className={`mt-2 h-4 w-4/5 ${BAR_CLASS}`} />
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-neutral-800">
          <div className={`h-4 w-16 ${BAR_CLASS}`} />
          <div className={`h-8 w-20 rounded-lg ${BAR_CLASS}`} />
        </div>
      </div>
    </div>
  );
}
