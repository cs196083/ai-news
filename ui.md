# UI 가이드 — AI 뉴스 수집기

앱 이름: **AI 뉴스 수집기**
메인 화면: 뉴스를 카드 형태로 보여 주는 **대시보드** (`/dashboard`)
스타일: Tailwind CSS v4 유틸리티 클래스 사용. 깔끔하고 읽기 편한 UI.

요구사항의 원본은 `PRD.md`이고, 이 문서는 화면 구성과 스타일 규칙만 다룬다. 현재 구현과 맞춰져 있으며, 아직 만들지 않은 항목은 **(미구현)** 으로 표시한다.

---

## 1. 디자인 원칙

- **읽기 우선**: 한국어 제목과 요약이 가장 눈에 띄어야 한다. 부가 정보(출처, 날짜)는 작고 연하게 표시한다.
- **여백을 넉넉하게**: 카드 안팎에 충분한 간격을 둔다. 정보가 빽빽해 보이지 않게 한다.
- **색은 절제**: 기본은 흰색, 회색 계열(neutral/slate). 강조색은 indigo 하나이고, 카테고리 구분에만 별도 색상 팔레트(5절)를 쓴다.
- **일관성**: 둥근 모서리, 그림자, 간격 값을 아래 토큰으로 통일한다.
- **다크 모드 대응**: `prefers-color-scheme` 방식을 따른다. 필요한 곳에만 `dark:` 변형을 붙인다.

## 2. 디자인 토큰

| 항목 | 값 (Tailwind) |
|---|---|
| 페이지 배경 | `bg-slate-50 dark:bg-neutral-950` |
| 카드 배경 | `bg-white dark:bg-neutral-900` |
| 테두리 | `border border-slate-200 dark:border-neutral-800` |
| 본문 글자 | `text-slate-700 dark:text-neutral-300` |
| 제목 글자 | `text-slate-900 dark:text-neutral-50` |
| 보조 글자 | `text-slate-500 dark:text-neutral-400` |
| 강조색 | `indigo-600` (hover `indigo-700`), 연한 배경 `indigo-50` |
| 성공 | `emerald-700` / 배경 `emerald-50` |
| 경고 | `amber-800` / 배경 `amber-50` |
| 오류 | `red-700` / 배경 `red-50` |
| 모서리 | 카드 `rounded-xl`, 버튼 `rounded-lg`, 칩 `rounded-full` |
| 그림자 | 카드 `shadow-sm`, hover `shadow-md` |
| 폰트 | `font-sans` (Geist, 한글은 시스템 폰트로 대체) |

참고: `globals.css`의 `body`에 `font-family: Arial`이 아직 하드코딩되어 있어 `font-sans`가 적용되지 않는다. 필요하면 이 줄을 제거하거나 `var(--font-sans)`로 바꾸고, 한글이 잘 보이도록 `Pretendard`, `Apple SD Gothic Neo`, `Malgun Gothic`을 대체 폰트로 추가한다.

## 3. 전체 레이아웃

```
┌──────────────────────────────────────────────────────┐
│                                              [👤]    │  ← 헤더: Clerk UserButton만 (우측 정렬)
├──────────────────────────────────────────────────────┤
│  AI 뉴스 수집기                      [뉴스 가져오기]   │  ← 제목 줄
│                                      (결과 알림)      │
│                                                      │
│  [전체 22] [카테고리1 5] [카테고리2 3] …              │  ← 카테고리 바
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  카드   │  │  카드   │  │  카드   │               │
│  └─────────┘  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  카드   │  │  카드   │  │  카드   │               │
│  └─────────┘  └─────────┘  └─────────┘               │
│                                                      │
│         [이전] [1] [2] [3] [다음]                     │  ← 페이지 이동
└──────────────────────────────────────────────────────┘
```

- 페이지 컨테이너: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`
- 본문 영역 세로 간격: `py-8 space-y-6`
- 카드 그리드: `grid gap-5 sm:grid-cols-2 lg:grid-cols-3`
- 한 페이지에 카드 **9개**

## 4. 헤더와 제목 줄

- 헤더(`layout.tsx`): 로그인한 경우에만 `flex justify-end p-4`로 Clerk `UserButton`을 오른쪽에 둔다. 앱 이름은 헤더가 아니라 대시보드 본문에 있다. 고정 상단 바(sticky)는 쓰지 않는다.
- 제목 줄(`/dashboard`): `flex items-start justify-between gap-4`
  - 왼쪽: 앱 이름 **AI 뉴스 수집기** — `text-2xl font-bold text-slate-900 dark:text-neutral-50`
  - 앱 이름 오른쪽(좁은 화면에서는 줄바꿈): **총 N개의 뉴스** 배지 — 수집된 전체 기사 수(카테고리·검색과 무관). `inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300`. 로딩 중에는 `animate-pulse` 스켈레톤. `ArticleCountBadge.tsx`
  - 오른쪽: **뉴스 가져오기** 버튼과 그 아래 결과 알림

### 뉴스 가져오기 버튼 (Primary)

```
inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
text-sm font-medium text-white shadow-sm transition
hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60
```

- 가져오는 중: 버튼 비활성화 + 스피너(`animate-spin`) + 문구 "가져오는 중…"
- 완료 후: 버튼 아래에 결과 알림(7절)을 잠시 보여 준다.

## 5. 카테고리 바 (뉴스 카드 목록 위)

카드 목록 바로 위에 가로로 나열한다.

- 컨테이너: `flex flex-wrap items-center gap-2` (칸이 부족하면 줄바꿈)
- 순서: `전체` → 사용자 카테고리들
- **"미분류" 칩은 없다.** 카테고리가 없는 기사는 `전체`에서만 보인다.
- 칩은 링크(`/dashboard?category=<id>`)이고, 카테고리를 바꾸면 1페이지부터 다시 보인다.
- 칩 안에 해당 카테고리의 기사 수를 작은 숫자로 붙인다 (`ml-1.5 text-xs opacity-70`).
- 선택은 단일 선택. 기본값은 `전체`. 선택된 칩에는 `aria-current="page"`를 준다.

### 칩 스타일

공통: `rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`

`전체` 칩:
- 선택 안 됨: `border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300`
- 선택됨: `border-indigo-600 bg-indigo-600 text-white`

사용자 카테고리 칩은 카테고리마다 색이 다르다 (색상 규칙은 아래).
- 선택 안 됨: 연한 배경 + 같은 색 글자·테두리 (예: `border-rose-200 bg-rose-50 text-rose-700`)
- 선택됨: 같은 색의 진한 배경 + 흰 글자 (예: `border-rose-600 bg-rose-600 text-white`)

### 카테고리 색상

- 팔레트 8색: rose, amber, emerald, sky, violet, orange, teal, fuchsia (이 순서)
- 색은 **카테고리 id를 8로 나눈 나머지**로 정한다. DB에 색을 저장하지 않고, 카테고리를 삭제해도 나머지 색은 바뀌지 않는다. 카테고리가 9개를 넘으면 색이 반복된다.
- 같은 카테고리는 칩과 카드 배지에서 항상 같은 색이다.
- 정의는 `src/lib/category-colors.ts`. Tailwind는 클래스를 정적으로 읽으므로 클래스 이름은 문자열로 조합하지 않고 전체를 그대로 적는다.
- 색만으로 구분하지 않도록 칩과 배지에는 항상 카테고리 이름 글자를 함께 표시한다.

### 카테고리 추가·이름 변경·삭제 **(미구현)**

현재 화면에는 카테고리 목록 표시와 필터만 있다. 아래는 구현할 때의 설계이다.

- `+ 카테고리 추가` 버튼을 칩 줄 맨 끝에 점선 테두리로 둔다: `inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900`
- 클릭하면 칩 자리에서 인라인 입력창으로 바뀐다 (모달 없음). Enter = 추가, Esc = 취소, 바깥 클릭 = 취소. 빈 이름·중복 이름은 입력창 아래에 `text-xs text-red-600`으로 안내한다.
- 사용자 카테고리 칩에 이름 변경·삭제 메뉴(hover 시 `⋯`)를 붙인다. `전체`는 변경·삭제할 수 없다.
- 삭제할 때 확인 창에 "해당 카테고리의 기사는 카테고리 없이 `전체`에서만 보여요"라고 안내한다. (삭제된 카테고리의 기사를 어떻게 다룰지는 `PRD.md` 10절의 미확정 사항)
- 추가한 카테고리는 새로 가져오는 뉴스부터 적용된다는 안내 문구를 처음 한 번만 보여 준다.

## 6. 뉴스 카드

카드 한 장이 기사 하나를 나타낸다.

```
┌────────────────────────────────────┐
│ ┌────────────────────────────────┐ │
│ │       원문 대표 이미지 (16:9)    │ │  ← 이미지가 있을 때만
│ └────────────────────────────────┘ │
│ [카테고리]                 2026.11.10 │  ← 카테고리 배지(색), 날짜
│                                    │
│ 한국어 제목 (굵게, 2줄까지)           │
│                                    │
│ 한국어 요약 본문 (4줄까지 표시…)      │
│ ─────────────────────────────────  │
│ 원문 보기 ↗ TechCrunch    [뉴스 저장]   │  ← 원문 링크, 출처는 뒤에 작게
└────────────────────────────────────┘
```

### 카드 컨테이너

```
group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white
shadow-sm transition-[border-color,box-shadow] duration-200
hover:border-indigo-300 hover:shadow-md
dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800
```

이미지가 카드 가장자리까지 꽉 차도록 컨테이너에는 안쪽 여백이 없고, 이미지 아래 본문 영역(`flex flex-1 flex-col px-5 pb-3 pt-5`)에 여백을 둔다. 주 사용자는 초·중등 교사와 개발자이므로, 업무 중 훑어 읽기 쉽게 글자를 조금 크게 잡고(요약 15px, `leading-7`) 누르는 영역은 36px 이상으로 한다.

**hover·클릭**: 제목 `<a>`가 `after:absolute after:inset-0`으로 카드 전체를 덮어, 카드 어디를 눌러도 원문이 새 탭으로 열린다. 삭제 버튼, 하단 영역(`relative z-10`)은 그 위에 있어 따로 동작한다. hover하면 테두리·제목이 indigo로 바뀌고, 이미지가 `scale-[1.03]`으로 천천히 커진다(`motion-safe`만 적용). 키보드 포커스는 제목 링크의 `after` 가상 요소에 outline으로 카드 전체에 표시한다.

**삭제 버튼**: 평소에는 `opacity-0`으로 숨기고, 카드에 마우스를 올리면(`group-hover`) 나타난다. 키보드 포커스 시에도 보이고, 터치 기기(`pointer-coarse`)에서는 항상 보인다. 삭제 중이거나 오류 메시지가 있을 때도 계속 보인다.

### 구성 요소

| 요소 | 스타일 |
|---|---|
| 대표 이미지 | `relative aspect-video w-full bg-slate-100 dark:bg-neutral-800` 안에 `next/image`(`fill`, `object-cover`, `alt=""`). 제목이 바로 아래에 있어 장식용으로 취급한다. 이미지가 없으면 이 영역을 만들지 않는다. |
| 카테고리 배지 | `rounded-full px-3 py-1 text-[13px] font-semibold` + 카테고리 색(예: `bg-rose-50 text-rose-700`). 카테고리가 없는 기사는 배지를 표시하지 않는다(출처·날짜는 오른쪽 정렬 유지). |
| 날짜 | `<time>` `text-[13px] tabular-nums text-slate-600` — 형식 "2026.11.10" (배지 줄 오른쪽) |
| 한국어 제목 | `mt-3 text-[1.1875rem] font-bold leading-snug tracking-tight text-balance break-keep text-slate-900 line-clamp-2` |
| 한국어 요약 | `mt-2.5 text-[15px] leading-7 break-keep text-slate-700 line-clamp-4` |
| 구분선 | `mt-auto border-t border-slate-100 pt-3` |
| 원문 링크 | "**원문 보기 ↗**" (`font-medium text-slate-800`) 뒤에 출처 이름(`text-[13px]`). `inline-flex min-h-9 text-sm text-slate-600 hover:text-indigo-700`, `target="_blank" rel="noopener noreferrer"`, `title`에 원문 제목 |

- 하단 영역은 `mt-auto`로 카드 높이가 달라도 아래쪽에 맞춰 정렬한다.
- 번역 전 기사는 제목에 원제목을, 요약 자리에 RSS 발췌를 대신 표시한다.
- 원문 제목(영어)은 번역된 기사에서는 카드에 표시하지 않고 원문 링크의 `title` 속성에만 넣는다.
- 이미지는 허용된 도메인(`src/lib/image-hosts.ts`)의 것만 쓴다. 허용 도메인은 `next.config.ts`의 `images.remotePatterns`와 같은 목록이다.

### 뉴스 저장 버튼 (Secondary)

기본:
```
rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium
text-slate-700 transition hover:bg-slate-50
disabled:cursor-not-allowed disabled:opacity-60
```

| 상태 | 표시 |
|---|---|
| 저장 전 | "뉴스 저장" |
| 저장 중 | 스피너 + "저장 중…", 버튼 비활성화 |
| 저장 완료 | `text-emerald-600` 체크 아이콘 + "저장됨", 클릭 시 Notion 페이지로 이동 (중복 저장 방지) |
| 실패 | 버튼 아래 `text-xs text-red-600` "저장에 실패했어요. 다시 시도해 주세요." + 다시 시도 가능 |

## 7. 페이지 이동

카드 목록 아래, 가운데 정렬. 페이지가 2개 이상일 때만 나타난다.

- 주소: `?page=N` (카테고리 필터와 함께 유지, 예: `/dashboard?category=3&page=2`). 잘못된 값은 가장 가까운 유효한 페이지로 맞춘다.
- 구성: `이전` · 페이지 번호 · `다음`. 페이지가 많으면 `1 … 4 [5] 6 … 20`처럼 현재 페이지 주변만 보여 준다.
- 컨테이너: `flex flex-wrap items-center justify-center gap-2 pt-2`
- 항목: `inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium`
  - 기본: `border-slate-200 bg-white text-slate-600 hover:bg-slate-100`
  - 현재 페이지: `border-indigo-600 bg-indigo-600 text-white`, `aria-current="page"`
  - 이동할 수 없는 `이전`/`다음`: 링크가 아니라 `span`, `aria-disabled="true"`, `opacity-60`
- 각 페이지 링크에 `aria-label="N페이지"`를 준다.

## 8. 상태 화면

### 빈 상태 (기사 없음)

- 가운데 정렬 박스: `rounded-xl border border-dashed border-slate-300 py-16 text-center`
- 문구: "아직 가져온 뉴스가 없어요." + 보조 문구 "오른쪽 위 **뉴스 가져오기** 버튼을 눌러 보세요."
- 특정 카테고리에 기사가 없을 때: "이 카테고리에는 아직 뉴스가 없어요."

### 로딩

- 페이지를 처음 불러올 때: 스켈레톤(`animate-pulse` + `bg-slate-200`) — 칩 줄 1개와 카드 3장. 카드 뼈대는 실제 카드와 같은 모양(이미지·배지·제목·요약·하단)으로 `NewsCardSkeleton.tsx`에 있다.
- 뉴스를 가져오는 중: 버튼의 스피너와 "가져오는 중…" 문구만 보여 준다. 카드 자리에 스켈레톤을 따로 띄우지 않는다.

### 결과 알림

버튼 바로 아래에 표시하고, `role="status"` / `aria-live="polite"`로 스크린 리더에 전달한다. 공통 스타일은 `rounded-lg px-3 py-2 text-sm`.

| 상황 | 스타일 | 문구 예 |
|---|---|---|
| 성공 | `bg-emerald-50 text-emerald-700` | "새 뉴스 12개를 가져왔어요. 12개를 번역·요약하고 카테고리별로 분류했어요." |
| 새 뉴스 없음 | `bg-slate-100 text-slate-600` | "새로 가져올 뉴스가 없어요." |
| 일부 실패 (소스 또는 AI 처리) | `bg-amber-50 text-amber-800` | "새 뉴스 10개를 가져왔어요. The Verge은(는) 불러오지 못했어요." / "…3개는 처리하지 못했어요(다음에 다시 시도돼요)." |
| AI 처리 전체 실패 | `bg-amber-50 text-amber-800` | "…AI 번역·요약에 실패했어요. 다음에 다시 시도돼요." (뉴스 저장은 성공한 상태) |
| 전체 실패 | `bg-red-50 text-red-700` | 원인과 다시 시도 안내 |

- 알림은 **저절로 사라진다**: 정상 결과는 5초, 경고·오류는 읽을 시간이 필요해 10초 뒤. 다시 가져오면 새 결과가 다시 나타난다.
- 이미 저장된 기사는 다시 처리하지 않는다.

## 9. 반응형

| 화면 | 카드 열 수 | 비고 |
|---|---|---|
| 모바일 (`< sm`) | 1열 | 카테고리 바는 줄바꿈 |
| 태블릿 (`sm`) | 2열 | |
| 데스크톱 (`lg` 이상) | 3열 | 컨테이너 최대 너비 `max-w-6xl` |

이미지 `sizes`: `(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw`

## 10. 접근성

- 모든 버튼·링크에 `focus-visible` 스타일을 준다 (키보드 포커스가 보여야 함).
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다.
- 글자 대비: 본문은 `slate-600` 이상으로 진하게, 연한 회색(`slate-400`)은 장식 요소에만 쓴다.
- 색만으로 상태를 구분하지 않는다 (카테고리는 이름 글자, 알림은 문구를 함께 사용).
- 새 알림은 `role="status"` / `aria-live="polite"`로 스크린 리더에 전달한다.
- 장식용 카드 이미지는 `alt=""`로 둔다.

## 11. 컴포넌트 구조

```
src/
  app/
    layout.tsx                # 헤더(UserButton), ClerkProvider
    dashboard/
      page.tsx                # 대시보드 (서버 컴포넌트): 조회, 필터, 페이지 나누기
      actions.ts              # fetchNewsAction (서버 액션)
  components/
    FetchNewsButton.tsx       # 클라이언트: 가져오기 요청, 로딩, 결과 알림(자동 사라짐)
    CategoryBar.tsx           # 칩 목록 (링크 기반, 서버 렌더링)
    NewsCard.tsx              # 카드 한 장
    Pagination.tsx            # 페이지 이동
  lib/
    category-colors.ts        # 카테고리 id → 색 클래스
    image-hosts.ts            # 이미지 허용 도메인
```

**(미구현)** `AddCategoryButton.tsx`(인라인 입력). `NotionSaveButton.tsx`(저장 상태 관리)는 구현됨.

- 데이터 조회는 서버 컴포넌트에서, 클릭·입력 같은 상호작용이 필요한 부분만 `"use client"`로 분리한다.
- 모든 데이터는 로그인한 Clerk 사용자 기준으로만 조회한다.

## 12. 하지 않는 것

- 화려한 그라데이션, 큰 그림자, 과한 애니메이션
- 카테고리 구분 외에 강조색을 여러 개 섞어 쓰는 것
- 번역된 기사 카드에 영어 원문 제목·본문 전체를 노출하는 것
- 다른 뉴스 출처 추가, 댓글·소셜 기능 UI (범위 밖)
