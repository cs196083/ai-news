// 구글 캘린더 임베드(일정 목록). 구글에 로그인된 브라우저에서는 비공개 일정도 보인다.
// 데스크톱(lg 이상)은 오른쪽 고정 사이드바, 그보다 작은 화면은 접이식 패널로 보여 준다.
// 구글 캘린더는 다크 모드와 색상 변경을 지원하지 않아 흰 배경 그대로 둔다.

function embedUrl(calendarId: string) {
  const params = new URLSearchParams({
    src: calendarId,
    mode: "AGENDA",
    ctz: "Asia/Seoul",
    hl: "ko",
    wkst: "2", // 월요일 시작
    bgcolor: "#ffffff",
    showTitle: "0",
    showNav: "0",
    showDate: "0",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    showTz: "0",
  });
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

const frameClass =
  "h-[480px] w-full rounded-lg border border-slate-200 bg-white dark:border-neutral-800";

function Frame({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      title="구글 캘린더 일정 목록"
      loading="lazy"
      className={frameClass}
    />
  );
}

function OpenLink() {
  return (
    <a
      href="https://calendar.google.com/calendar"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-block text-sm text-slate-500 hover:text-indigo-600 hover:underline dark:text-neutral-400"
    >
      구글 캘린더에서 열기 ↗
    </a>
  );
}

export function CalendarPanel() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();

  if (!calendarId) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600 dark:border-neutral-700 dark:text-neutral-300">
        <p className="font-medium">캘린더를 연결해 주세요.</p>
        <p className="mt-1 text-slate-500 dark:text-neutral-400">
          <code>.env.local</code>의 <code>GOOGLE_CALENDAR_ID</code>에 캘린더 ID를 넣고 서버를 다시 시작하세요.
        </p>
      </aside>
    );
  }

  const src = embedUrl(calendarId);

  return (
    <>
      {/* 데스크톱: 오른쪽 사이드바 (스크롤해도 따라온다) */}
      <aside
        aria-label="캘린더"
        className="hidden lg:sticky lg:top-4 lg:block lg:self-start"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-neutral-50">
            다가오는 일정
          </h2>
          <Frame src={src} />
          <OpenLink />
        </div>
      </aside>

      {/* 모바일·태블릿: 카드가 아래로 밀리지 않도록 접어 둔다 (닫혀 있으면 iframe을 불러오지 않는다) */}
      <details className="rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-neutral-50">
          다가오는 일정 (캘린더)
        </summary>
        <div className="px-4 pb-4">
          <Frame src={src} />
          <OpenLink />
        </div>
      </details>
    </>
  );
}
