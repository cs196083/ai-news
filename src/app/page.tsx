import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <Show when="signed-out">
        <h1 className="text-3xl font-semibold">AI 뉴스 요약</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          해외 AI 뉴스를 한국어로 번역·요약해 보여드립니다. 로그인 후 이용할 수
          있습니다.
        </p>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="rounded-full bg-black px-6 py-2 text-white dark:bg-white dark:text-black">
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-full border border-zinc-300 px-6 py-2 dark:border-zinc-700">
              회원가입
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <h1 className="text-3xl font-semibold">AI 뉴스 요약</h1>
        <p className="text-zinc-600 dark:text-zinc-400">로그인되었습니다.</p>
      </Show>
    </main>
  );
}
