"use client";

import { useActionState } from "react";
import {
  fetchNewsAction,
  type FetchNewsState,
} from "@/app/dashboard/actions";

export function FetchNewsButton() {
  const [state, action, pending] = useActionState<FetchNewsState>(
    fetchNewsAction,
    { status: "idle" },
  );

  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      <div role="status" aria-live="polite">
        {!pending && <Notice state={state} />}
      </div>
    </form>
  );
}

function Notice({ state }: { state: FetchNewsState }) {
  if (state.status === "idle") return null;
  if (state.status === "error") {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.message}
      </p>
    );
  }
  const failed = state.failures.map((f) => f.source).join(", ");
  if (state.failures.length > 0) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        새 뉴스 {state.saved}개를 가져왔고, {failed}은(는) 불러오지 못했어요.
      </p>
    );
  }
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        state.saved > 0
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {state.saved > 0
        ? `새 뉴스 ${state.saved}개를 가져왔어요.`
        : "새로 가져올 뉴스가 없어요."}
    </p>
  );
}
