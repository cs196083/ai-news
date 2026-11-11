import Image from "next/image";
import type { Article } from "@/db/schema";
import { DeleteNewsButton } from "@/components/DeleteNewsButton";
import { NotionSaveButton } from "@/components/NotionSaveButton";
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
  notionUrl,
}: {
  article: Article;
  categoryName: string | null;
  /** Notion에 저장된 페이지 주소 (저장 전이면 null) */
  notionUrl: string | null;
}) {
  const date = article.publishedAt ?? article.createdAt;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-indigo-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800">
      <DeleteNewsButton articleId={article.id} />
      {article.imageUrl && (
        // 원문 대표 이미지. 제목이 바로 아래에 있어 장식용으로 두고 alt는 비운다.
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col px-5 pb-3 pt-5">
        <div className="flex min-h-7 items-center justify-between gap-2">
          {article.categoryId !== null && categoryName ? (
            <span
              className={`rounded-full px-3 py-1 text-[13px] font-semibold ${categoryColor(article.categoryId).badge}`}
            >
              {categoryName}
            </span>
          ) : (
            // 분류 전 기사는 배지를 표시하지 않는다 (날짜는 오른쪽 정렬 유지)
            <span />
          )}
          <time
            dateTime={date.toISOString()}
            className="text-[13px] tabular-nums text-slate-600 dark:text-neutral-400"
          >
            {formatDate(date)}
          </time>
        </div>

        <h2 className="mt-3 line-clamp-2 break-keep text-[1.1875rem] font-bold leading-snug tracking-tight text-balance text-slate-900 dark:text-neutral-50">
          {/* 제목 링크가 카드 전체를 덮는다. 삭제·저장·출처 링크는 z-10으로 위에 둔다. */}
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={article.originalTitle}
            className="transition-colors after:absolute after:inset-0 after:rounded-2xl group-hover:text-indigo-700 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-indigo-600 dark:group-hover:text-indigo-300"
          >
            {article.titleKo ?? article.originalTitle}
          </a>
        </h2>
        <p className="mt-2.5 line-clamp-4 break-keep text-[15px] leading-7 text-slate-700 dark:text-neutral-300">
          {article.summaryKo ?? article.excerpt}
        </p>

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-neutral-800">
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={article.originalTitle}
            className="inline-flex min-h-9 min-w-0 items-center gap-1.5 rounded text-sm text-slate-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-300"
          >
            <span className="font-medium text-slate-800 dark:text-neutral-200">
              원문 보기 ↗
            </span>
            <span className="truncate text-[13px]">{article.source}</span>
          </a>
          <NotionSaveButton articleId={article.id} savedUrl={notionUrl} />
        </div>
      </div>
    </article>
  );
}
