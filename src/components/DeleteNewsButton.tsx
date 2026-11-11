"use client";

import { useState, useTransition } from "react";
import { deleteNewsAction } from "@/app/dashboard/actions";

export function DeleteNewsButton({ articleId }: { articleId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label="뉴스 삭제"
        title="삭제"
        className={`inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 transition focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 pointer-coarse:opacity-100 group-hover:opacity-100 ${pending || error ? "opacity-100" : "opacity-0"} hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-900/90 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-red-400`}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteNewsAction(articleId);
            if (result.status === "error") setError(result.message);
          });
        }}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div role="status" aria-live="polite">
        {error && (
          <p className="rounded bg-white/90 px-1.5 py-0.5 text-xs text-red-600 shadow-sm dark:bg-neutral-900/90">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
