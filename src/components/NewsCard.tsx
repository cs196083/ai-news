import type { Article } from "@/db/schema";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDate(date: Date) {
  // "2026. 11. 10." → "2026.11.10"
  return dateFormat.format(date).replace(/\.\s/g, ".").replace(/\.$/, "");
}

export function NewsCard({
  article,
  categoryName,
}: {
  article: Article;
  categoryName: string | null;
}) {
  const date = article.publishedAt ?? article.createdAt;
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryName
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              : "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {categoryName ?? "미분류"}
        </span>
        <span className="text-xs text-slate-500 dark:text-neutral-400">
          {article.source} · {formatDate(date)}
        </span>
      </div>

      <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-neutral-50">
        {article.titleKo ?? article.originalTitle}
      </h2>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
        {article.summaryKo ?? article.excerpt}
      </p>

      <div className="mt-auto border-t border-slate-100 pt-4 dark:border-neutral-800">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="text-sm text-slate-500 hover:text-indigo-600 hover:underline dark:text-neutral-400"
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}
