import Image from "next/image";
import type { Article } from "@/db/schema";
import { categoryColor } from "@/lib/category-colors";

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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {article.imageUrl && (
        // 원문 대표 이미지. 제목이 바로 아래에 있어 장식용으로 두고 alt는 비운다.
        <div className="relative aspect-video w-full bg-slate-100 dark:bg-neutral-800">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          {article.categoryId !== null && categoryName ? (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(article.categoryId).badge}`}
            >
              {categoryName}
            </span>
          ) : (
            // 분류 전 기사는 배지를 표시하지 않는다 (출처·날짜는 오른쪽 정렬 유지)
            <span />
          )}
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
      </div>
    </article>
  );
}
