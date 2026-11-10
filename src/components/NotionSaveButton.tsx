"use client";

import { useState, useTransition } from "react";
import { saveNewsToNotionAction } from "@/app/dashboard/actions";

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

export function NotionSaveButton({
  articleId,
  savedUrl,
}: {
  articleId: number;
  /** 이미 Notion에 저장된 기사의 페이지 주소 */
  savedUrl: string | null;
}) {
  const [url, setUrl] = useState(savedUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 서버에서 저장 기록이 내려오면(새로고침 등) 그 값을 따른다.
  const saved = url ?? savedUrl;

  if (saved) {
    return (
      <a
        href={saved}
        target="_blank"
        rel="noopener noreferrer"
        title="Notion에서 열기"
        className={`${buttonClass} text-emerald-600 dark:text-emerald-400`}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        저장됨
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={buttonClass}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await saveNewsToNotionAction(articleId);
            if (result.status === "saved") setUrl(result.url);
            else setError(result.message);
          });
        }}
      >
        {pending && (
          <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {pending ? "저장 중…" : "뉴스 저장"}
      </button>
      <div role="status" aria-live="polite">
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
