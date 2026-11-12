import { auth } from "@clerk/nextjs/server";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

/** 이미 로그인한 사용자가 홈에 들어오면 바로 대시보드로 보낸다. */
async function RedirectToDashboard() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return null;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      {/* Cache Components: auth()는 요청 시점 데이터를 읽으므로 Suspense 안에 둔다 */}
      <Suspense>
        <RedirectToDashboard />
      </Suspense>
      <Show when="signed-out">
        <h1 className="text-3xl font-semibold">AI 뉴스 요약</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          해외 AI 뉴스를 한국어로 번역·요약해 보여드립니다. 로그인 후 이용할 수
          있습니다.
        </p>
        <div className="flex gap-3">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="rounded-full bg-black px-6 py-2 text-white dark:bg-white dark:text-black">
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="rounded-full border border-zinc-300 px-6 py-2 dark:border-zinc-700">
              회원가입
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        {/* 이동하는 짧은 순간에 보이는 대체 화면 */}
        <h1 className="text-3xl font-semibold">AI 뉴스 요약</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          대시보드로 이동하는 중이에요…
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          대시보드로 이동
        </Link>
      </Show>
    </main>
  );
}
