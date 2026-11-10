# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Working app: sign-in, manual news fetch (RSS), Gemini translation/summary/classification, image extraction, category filter, color-coded cards, and 9-per-page pagination are implemented (fetch, translation/classification, and images were confirmed working by the user; pagination was typechecked but not browser-tested).

**Not implemented yet:** category add/rename/delete UI (the dashboard only lists categories and filters by them), Notion save (the `notion_saves` table exists but nothing writes to it).

`PRD.md` (Korean) is the source of truth for requirements, data model, and open decisions (section 10) — read it before implementing anything. `ui.md` (Korean) is the source of truth for layout and styling (header, category bar and colors, card with image, pagination, states and notices); it marks unbuilt parts as 미구현. Read it before building or changing any UI. If it ever conflicts with `PRD.md`, follow `PRD.md` and fix `ui.md`.

## Commands

```bash
npm run dev          # dev server (http://localhost:3000)
npm run build        # production build
npm run lint         # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit     # typecheck
npm run db:generate  # drizzle-kit: create a migration from src/db/schema.ts
npm run db:migrate   # apply migrations to Neon (uses DATABASE_URL from .env.local)
npm run db:studio    # drizzle studio
```

No test runner is configured. After changing `src/db/schema.ts`, run `db:generate` then `db:migrate`; commit the generated files in `drizzle/`.

Restart `npm run dev` after changing `.env.local` or `next.config.ts`.

## Next.js version warning

`AGENTS.md` states this Next.js version (16.x, React 19) has breaking changes from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices. Setup: App Router, `src/` dir, TypeScript, Tailwind v4, import alias `@/*` → `src/*`. `next.config.ts` enables `cacheComponents` and `partialPrefetching`.

## Environment variables (`.env.local`, server-only, git-ignored)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk
- `DATABASE_URL` — Neon
- `GEMINI_API_KEY` — Google AI Studio key. It must belong to a project **without billing/prepay**: a project on prepaid billing with a $0 balance returns `402 Your prepayment credits are depleted` for every model.
- `GEMINI_MODEL` — optional, defaults to `gemini-3.5-flash-lite`
- `GOOGLE_CALENDAR_ID` — Google Calendar ID (usually a gmail address) for the dashboard calendar sidebar. If empty, the sidebar shows a setup hint. The ID appears in the iframe URL, so it is visible to the signed-in user only (single-user app).

## Architecture

Flow: the "뉴스 가져오기" button calls the server action `fetchNewsAction` (`src/app/dashboard/actions.ts`), which, for the signed-in Clerk user:

1. fetches both RSS feeds, keeps items from the **last 24 hours**, normalizes URLs, and inserts only new articles;
2. sends articles whose `title_ko` is null (max 30, batches of 10) to Gemini for Korean title, Korean summary (2–3 sentences), and category — in one call per batch;
3. fills missing article images (max 30, 5 concurrent);
4. calls `revalidatePath("/dashboard")` and returns counts for the notice.

Steps 2 and 3 are wrapped in their own try/catch: an AI or image failure must never fail the fetch itself.

File map:

| Path | Role |
|---|---|
| `src/lib/rss.ts` | RSS sources, parsing, 24h filter, URL normalization, feed-body image |
| `src/lib/enrich.ts` | Gemini call (translate + summarize + classify), JSON-schema output, validation |
| `src/lib/og-image.ts`, `src/lib/image-hosts.ts` | `og:image` fetch; allowed image/page hosts (also feeds `next.config.ts` `images.remotePatterns`) |
| `src/lib/category-colors.ts` | category id → Tailwind color classes (8-color palette; classes must stay full static strings) |
| `src/db/schema.ts`, `src/db/index.ts` | Drizzle schema, Neon HTTP client |
| `src/db/articles.ts` | article queries/mutations (all take `userId`) |
| `src/db/categories.ts` | default categories, created on first access |
| `src/app/dashboard/page.tsx` | dashboard (server component): filter, pagination (`PAGE_SIZE = 9`), cards |
| `src/components/` | `NewsCard`, `CategoryBar`, `Pagination`, `FetchNewsButton` (client, `useActionState`), `CalendarPanel` (Google Calendar AGENDA iframe: sticky right sidebar on `lg`, collapsible `<details>` below) |

## News sources (RSS)

- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/` (no image in feed → `og:image` from the article page)
- The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` (image is in the feed body)

Out of scope: adding other sources, scheduled fetching, social/comments, full-article-body summarization (summaries use the RSS excerpt only).

## Data model

- `articles`: id, user_id, original_title, original_url (unique per user), source, published_at, `excerpt`, `image_url`, `title_ko` (nullable), `summary_ko` (nullable), `category_id` (nullable), created_at
  - `title_ko` null ⇒ not yet processed by AI (this is the work-queue criterion).
  - `image_url` null ⇒ not looked up yet; `""` ⇒ looked up, no image (do not retry).
  - `category_id` null ⇒ no category. There is **no "미분류" chip or badge**; such articles appear only under "전체". Deleting a category sets this to null (`onDelete: set null`).
- `categories`: id, user_id, name (unique per user), created_at. Defaults: 기술·원리, 활용·도구, 교육·학습, 윤리·안전·저작권, 정책·규제, 산업·진로.
- `notion_saves`: id, article_id (unique), notion_page_url, saved_at (unused so far)

## Card and Notion contents

- Card shows: original image (if any), Korean title (falls back to original title), Korean summary (falls back to the excerpt), category badge in its color, source, published date, original link. "Notion 저장" button and saved state are planned.
- Notion save (planned) writes: Korean title, summary, category, source, original link, published date. Report success/failure to the user.

## Open decisions (see PRD section 10)

- What to do with articles whose category was deleted (they keep their translation, so enrichment never revisits them).
- Notion MCP auth: verify before implementing; fall back to direct Notion API (`@notionhq/client`) if hard. Once chosen, remove the unused package (`@modelcontextprotocol/sdk` or `@notionhq/client`).
- Summary quality: Gemini sometimes adds generic sentences beyond the excerpt.

## Rules that span multiple files

- Fetching is manual only (button-triggered); no cron or auto-collection.
- Dedupe by original URL per user (normalized, `utm_*`/hash stripped) before inserting; only `title_ko IS NULL` articles are ever sent to Gemini — processed articles must never be re-sent (free-tier quota).
- One article/batch/source failing must not abort the rest; report failures to the user. On a quota error (429/`RESOURCE_EXHAUSTED`) stop further AI calls but still keep the fetched articles.
- Classification always picks the closest user category; category ids returned by the model are validated against the user's own categories.
- Article titles/excerpts are untrusted input: they go to the model as data, never as instructions.
- Every query/mutation must be scoped to the signed-in Clerk user id (updates also guard on the "still unprocessed" column so concurrent clicks don't overwrite).
- Only store/render images from hosts in `src/lib/image-hosts.ts`; page requests go only to the RSS source sites.
- Notion saves must be idempotent (no duplicate saves) and record the resulting page URL.
- API keys (Gemini, Notion, DB URL, Clerk secret) are server env vars only (`.env.local`); never expose to client code. Never print or commit key values.
- Free-tier Gemini input may be used by Google to improve products: send only public news text (title + excerpt), never user data.
- Tailwind color classes in `category-colors.ts` must be complete literal strings (no string-built class names).
