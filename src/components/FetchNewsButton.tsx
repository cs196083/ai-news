"use client";

import { useActionState, useEffect, useState } from "react";
import {
  fetchNewsAction,
  type FetchNewsState,
} from "@/app/dashboard/actions";

// 알림이 화면에 남아 있는 시간. 문제가 있었던 결과(경고·오류)는 읽을 시간을 더 준다.
const NOTICE_MS = 5_000;
const PROBLEM_NOTICE_MS = 10_000;

function noticeDuration(state: FetchNewsState) {
  const clean =
    state.status === "done" &&
    state.failures.length === 0 &&
    state.enrichFailed === 0;
  return clean ? NOTICE_MS : PROBLEM_NOTICE_MS;
}

export function FetchNewsButton() {
  const [state, action, pending] = useActionState<FetchNewsState>(
    fetchNewsAction,
    { status: "idle" },
  );
  // 시간이 지나 숨긴 결과. 새로 가져오면 새 결과 객체가 만들어져 알림이 다시 나타난다.
  const [dismissed, setDismissed] = useState<FetchNewsState | null>(null);

  useEffect(() => {
    if (pending || state.status === "idle") return;
    const timer = setTimeout(() => setDismissed(state), noticeDuration(state));
    return () => clearTimeout(timer);
  }, [state, pending]);

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
        {!pending && state !== dismissed && <Notice state={state} />}
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
  const classifyNote =
    state.enrichFailed === -1
      ? "AI 번역·요약에 실패했어요. 다음에 다시 시도돼요."
      : state.enrichFailed > 0
        ? `${state.enriched}개를 번역·요약·분류했고 ${state.enrichFailed}개는 처리하지 못했어요(다음에 다시 시도돼요).`
        : state.enriched > 0
          ? `${state.enriched}개를 번역·요약하고 카테고리별로 분류했어요.`
          : "";
  const classifyProblem = state.enrichFailed !== 0;

  if (state.failures.length > 0 || classifyProblem) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        새 뉴스 {state.saved}개를 가져왔어요.
        {state.failures.length > 0 && ` ${failed}은(는) 불러오지 못했어요.`}
        {classifyNote && ` ${classifyNote}`}
      </p>
    );
  }
  const nothingNew = state.saved === 0 && state.enriched === 0;
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        nothingNew
          ? "bg-slate-100 text-slate-600"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {nothingNew
        ? "새로 가져올 뉴스가 없어요."
        : `새 뉴스 ${state.saved}개를 가져왔어요. ${classifyNote}`.trim()}
    </p>
  );
}
