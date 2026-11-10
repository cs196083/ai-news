# UI 가이드 — AI 뉴스 수집기

앱 이름: **AI 뉴스 수집기**
메인 화면: 뉴스를 카드 형태로 보여 주는 **대시보드**
스타일: Tailwind CSS v4 유틸리티 클래스 사용. 깔끔하고 읽기 편한 UI.

요구사항의 원본은 `PRD.md`이고, 이 문서는 화면 구성과 스타일 규칙만 다룬다.

---

## 1. 디자인 원칙

- **읽기 우선**: 한국어 제목과 요약이 가장 눈에 띄어야 한다. 부가 정보(출처, 날짜)는 작고 연하게 표시한다.
- **여백을 넉넉하게**: 카드 안팎에 충분한 간격을 둔다. 정보가 빽빽해 보이지 않게 한다.
- **색은 절제**: 기본은 흰색, 회색 계열(neutral/slate). 강조색은 하나(indigo)만 쓴다.
- **일관성**: 둥근 모서리, 그림자, 간격 값을 아래 토큰으로 통일한다.
- **다크 모드 대응**: 기존 `globals.css`의 `prefers-color-scheme` 방식을 따른다. 필요한 곳에만 `dark:` 변형을 붙인다.

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
| 성공 | `emerald-600` / 배경 `emerald-50` |
| 오류 | `red-600` / 배경 `red-50` |
| 모서리 | 카드 `rounded-xl`, 버튼·칩 `rounded-lg` / `rounded-full` |
| 그림자 | 카드 `shadow-sm`, hover `shadow-md` |
| 폰트 | `font-sans` (Geist, 한글은 시스템 폰트로 대체) |

참고: 현재 `globals.css`의 `body`에 `font-family: Arial`이 하드코딩되어 있어 `font-sans`가 적용되지 않는다. 구현할 때 이 줄을 제거하거나 `var(--font-sans)`로 바꾼다. 한글이 잘 보이도록 `font-sans` 뒤에 `Pretendard`, `Apple SD Gothic Neo`, `Malgun Gothic`을 대체 폰트로 추가하는 것을 권장한다.

## 3. 전체 레이아웃

```
┌──────────────────────────────────────────────────────┐
│ 헤더: AI 뉴스 수집기              [뉴스 가져오기] [👤] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [전체] [모델/연구] [제품/서비스] [투자/비즈니스] [+ 추가] │  ← 카테고리 바
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  카드   │  │  카드   │  │  카드   │               │
│  └─────────┘  └─────────┘  └─────────┘               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│  │  카드   │  │  카드   │  │  카드   │               │
│  └─────────┘  └─────────┘  └─────────┘               │
└──────────────────────────────────────────────────────┘
```

- 페이지 컨테이너: `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`
- 본문 영역 세로 간격: `py-8 space-y-6`
- 카드 그리드: `grid gap-5 sm:grid-cols-2 lg:grid-cols-3`

## 4. 헤더

- 고정 상단 바: `sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80`
- 높이: `h-16`, 내용은 `flex items-center justify-between`
- 왼쪽: 앱 이름 **AI 뉴스 수집기** — `text-lg font-bold text-slate-900 dark:text-neutral-50`
- 오른쪽: **뉴스 가져오기** 버튼(주요 버튼) + Clerk `UserButton`

### 뉴스 가져오기 버튼 (Primary)

```
inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2
text-sm font-medium text-white shadow-sm transition
hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60
```

- 가져오는 중: 버튼 비활성화 + 스피너(`animate-spin`) + 문구 "가져오는 중…"
- 완료 후: 새로 저장된 개수와 실패 개수를 토스트 또는 상단 알림 바로 알린다 (6절 참고).

## 5. 카테고리 바 (뉴스 카드 목록 위)

카드 목록 바로 위에 가로로 나열한다. **맨 끝에 "카테고리 추가" 버튼**을 둔다.

- 컨테이너: `flex flex-wrap items-center gap-2`
  (모바일에서 칸이 부족하면 줄바꿈. 칩이 많아지면 `overflow-x-auto flex-nowrap`으로 가로 스크롤도 가능)
- 순서: `전체` → 사용자 카테고리들 → `미분류` → **`+ 카테고리 추가`**

### 카테고리 칩

기본(선택 안 됨):
```
rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm
font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100
dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300
```

선택됨:
```
rounded-full border border-indigo-600 bg-indigo-600 px-3.5 py-1.5 text-sm
font-medium text-white
```

- 칩 안에 해당 카테고리의 기사 수를 작은 숫자로 붙일 수 있다 (`ml-1.5 text-xs opacity-70`).
- 선택은 단일 선택. 기본값은 `전체`.
- 접근성: 칩 그룹에 `role="tablist"` 대신 버튼 그룹으로 두고, 선택된 칩에 `aria-pressed="true"`를 준다.
- 사용자 카테고리 칩에는 이름 변경·삭제 메뉴를 붙일 수 있다 (hover 시 `⋯` 표시). `전체`와 `미분류`는 변경·삭제 불가.
- 삭제 시 해당 카테고리의 기사는 `미분류`로 이동한다는 안내를 확인 창에 표시한다.

### 카테고리 추가 버튼

칩과 구분되도록 **점선 테두리**를 쓴다.

```
inline-flex items-center gap-1 rounded-full border border-dashed
border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-500 transition
hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600
dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900
```

- 내용: `+` 아이콘 + "카테고리 추가"
- 클릭 시 칩 자리에서 **인라인 입력창**으로 바뀐다 (모달 없이 빠르게 추가).
  - 입력창: `rounded-full border border-indigo-400 px-3.5 py-1.5 text-sm outline-none ring-2 ring-indigo-100`
  - Enter = 추가, Esc = 취소, 바깥 클릭 = 취소
  - 빈 이름·중복 이름은 추가하지 않고 입력창 아래에 `text-xs text-red-600`으로 안내
- 추가한 카테고리는 새로 가져오는 뉴스부터 적용된다는 안내 문구를 한 줄 보조 텍스트로 보여 준다 (처음 한 번만).

## 6. 뉴스 카드

카드 한 장이 기사 하나를 나타낸다.

```
┌────────────────────────────────────┐
│ [모델/연구]        TechCrunch · 2일 전 │  ← 상단: 카테고리 배지, 출처·날짜
│                                    │
│ 한국어 제목 (굵게, 2줄까지)           │  ← 제목
│                                    │
│ 한국어 요약 본문 (3~4줄까지 표시…)    │  ← 요약
│                                    │
│ ─────────────────────────────────  │
│ 원문 보기 ↗        [Notion 저장]     │  ← 하단: 링크, 액션
└────────────────────────────────────┘
```

### 카드 컨테이너

```
flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5
shadow-sm transition hover:shadow-md
dark:border-neutral-800 dark:bg-neutral-900
```

### 구성 요소

| 요소 | 스타일 |
|---|---|
| 카테고리 배지 | `rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700` (미분류는 `bg-slate-100 text-slate-600`) |
| 출처·날짜 | `text-xs text-slate-500` — 형식 "TechCrunch · 2026.11.10" |
| 한국어 제목 | `mt-3 text-base font-semibold leading-snug text-slate-900 line-clamp-2` |
| 한국어 요약 | `mt-2 text-sm leading-relaxed text-slate-600 line-clamp-4` |
| 구분선 | `mt-4 border-t border-slate-100 pt-4` |
| 원문 링크 | `text-sm text-slate-500 hover:text-indigo-600 hover:underline`, `target="_blank" rel="noopener noreferrer"` |

- 하단 영역은 `mt-auto`로 카드 높이가 달라도 아래쪽에 맞춰 정렬한다.
- 원문 제목(영어)은 카드에 표시하지 않는다. 필요하면 원문 링크의 `title` 속성에 넣는다.

### Notion 저장 버튼 (Secondary)

기본:
```
rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium
text-slate-700 transition hover:bg-slate-50
disabled:cursor-not-allowed disabled:opacity-60
```

상태별 표시:

| 상태 | 표시 |
|---|---|
| 저장 전 | "Notion 저장" |
| 저장 중 | 스피너 + "저장 중…", 버튼 비활성화 |
| 저장 완료 | `text-emerald-600` 체크 아이콘 + "저장됨", 클릭 시 Notion 페이지로 이동 (중복 저장 방지) |
| 실패 | 버튼 아래 `text-xs text-red-600` "저장에 실패했어요. 다시 시도해 주세요." + 다시 시도 가능 |

## 7. 상태 화면

### 빈 상태 (기사 없음)

- 가운데 정렬 박스: `rounded-xl border border-dashed border-slate-300 py-16 text-center`
- 문구: "아직 가져온 뉴스가 없어요." + 보조 문구 "오른쪽 위 **뉴스 가져오기** 버튼을 눌러 보세요."
- 특정 카테고리에 기사가 없을 때: "이 카테고리에는 아직 뉴스가 없어요."

### 로딩 (뉴스 가져오는 중)

- 카드 자리에 스켈레톤 카드를 표시: `animate-pulse` + `bg-slate-200` 막대 (제목 1줄, 요약 3줄)
- 요약에 시간이 걸릴 수 있으므로 "AI가 뉴스를 번역하고 요약하는 중이에요…" 안내를 같이 보여 준다.

### 결과 알림

- 상단 알림 바 또는 토스트로 표시한다.
- 성공: `bg-emerald-50 text-emerald-700` — "새 뉴스 12개를 가져왔어요."
- 일부 실패: `bg-amber-50 text-amber-800` — "새 뉴스 10개를 가져왔고, 2개는 처리하지 못했어요."
- 전체 실패: `bg-red-50 text-red-700` — 원인과 다시 시도 안내
- 새 기사가 없을 때: "새로 가져올 뉴스가 없어요." (이미 저장된 기사는 다시 처리하지 않음)

## 8. 반응형

| 화면 | 카드 열 수 | 비고 |
|---|---|---|
| 모바일 (`< sm`) | 1열 | 헤더의 버튼은 아이콘 + 짧은 문구 유지, 카테고리 바는 줄바꿈 또는 가로 스크롤 |
| 태블릿 (`sm`) | 2열 | |
| 데스크톱 (`lg` 이상) | 3열 | 컨테이너 최대 너비 `max-w-6xl` |

## 9. 접근성

- 모든 버튼·링크에 `focus-visible` 스타일을 준다 (키보드 포커스가 보여야 함).
- 아이콘만 있는 버튼에는 `aria-label`을 붙인다.
- 글자 대비: 본문은 `slate-600` 이상으로 진하게, 연한 회색(`slate-400`)은 장식 요소에만 쓴다.
- 색만으로 상태를 구분하지 않는다 (아이콘·문구를 함께 사용).
- 새 알림은 `role="status"` / `aria-live="polite"`로 스크린 리더에 전달한다.

## 10. 구현 시 권장 컴포넌트 구조

```
src/
  app/
    page.tsx                  # 대시보드 (서버 컴포넌트, 데이터 조회)
  components/
    Header.tsx                # 앱 이름, 뉴스 가져오기, UserButton
    FetchNewsButton.tsx       # 클라이언트: 가져오기 요청, 로딩/결과 상태
    CategoryBar.tsx           # 클라이언트: 칩 목록 + 선택 상태
    AddCategoryButton.tsx     # 클라이언트: 인라인 입력 추가
    NewsCard.tsx              # 카드 한 장
    NotionSaveButton.tsx      # 클라이언트: 저장 상태 관리
    EmptyState.tsx
    Notice.tsx                # 결과 알림
```

- 데이터 조회는 서버 컴포넌트에서, 클릭·입력 같은 상호작용이 필요한 부분만 `"use client"`로 분리한다.
- 모든 데이터는 로그인한 Clerk 사용자 기준으로만 조회한다.

## 11. 하지 않는 것

- 화려한 그라데이션, 큰 그림자, 과한 애니메이션
- 강조색을 여러 개 섞어 쓰는 것
- 카드에 영어 원문 제목·본문 전체를 노출하는 것
- 다른 뉴스 출처 추가, 댓글·소셜 기능 UI (범위 밖)
