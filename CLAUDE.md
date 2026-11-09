# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Scaffold only: `create-next-app` boilerplate plus installed dependencies. No app code has been written yet. `PRD.md` (Korean) is the source of truth for requirements, data model, and open decisions (section 10) — read it before implementing anything.

## Commands

```bash
npm run dev     # dev server (http://localhost:3000)
npm run build   # production build
npm run lint    # eslint (flat config, eslint.config.mjs)
```

No test runner is configured. Drizzle migrations will use `drizzle-kit` (installed, no `drizzle.config.ts` yet).

## Next.js version warning

`AGENTS.md` states this Next.js version (16.x, React 19) has breaking changes from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices. Setup: App Router, `src/` dir, TypeScript, Tailwind v4, import alias `@/*` → `src/*`.

## Planned architecture (from PRD)

AI news summarizer: user clicks "뉴스 가져오기" → server fetches two RSS feeds (TechCrunch AI, The Verge AI) → Claude translates title to Korean, summarizes body in Korean, classifies into one of the user's categories (else "미분류") → cards with category filter → per-card "Notion 저장".

Stack mapping (all installed):
- **Clerk** (`@clerk/nextjs`): every feature requires login; all data is per-user.
- **Neon + Drizzle** (`@neondatabase/serverless`, `drizzle-orm`): tables `articles` (original URL unique per user), `categories` (per user), `notion_saves`.
- **Claude** (`@anthropic-ai/sdk`) and **RSS** (`rss-parser`): server-side only.
- **Notion**: `@modelcontextprotocol/sdk` (Notion MCP server) with `@notionhq/client` as the fallback if MCP auth proves hard. Auth method is undecided; once chosen, remove the unused package.

## News sources (RSS)

- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
- The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`

Out of scope: adding other sources, scheduled fetching, social/comments.

## Data model (PRD draft)

- `articles`: id, user_id, original title, original URL (unique per user), source, published date, Korean title, Korean summary, category_id, created_at
- `categories`: id, user_id, name, created_at
- `notion_saves`: id, article_id, Notion page URL, saved_at

## Card and Notion contents

- Card shows: Korean title, Korean summary, category, source, published date, original link, "Notion 저장" button, and whether it is already saved to Notion.
- Notion save writes: Korean title, summary, category, source, original link, published date. Report success/failure to the user.

## Open decisions (PRD section 10, not yet confirmed)

- Articles per feed: 10–20 (exact N undecided).
- Default categories: undecided (suggested: 모델/연구, 제품/서비스, 투자/비즈니스, 규제/정책, 기타).
- Re-classifying existing news after category add/rename: default is new news only.
- Category scope: per user (proposed).
- Notion MCP auth: verify before implementing; fall back to direct Notion API if hard.

## Rules that span multiple files

- Fetching is manual only (button-triggered); no cron or auto-collection.
- Dedupe by original URL per user *before* calling Claude; already-stored articles must never be re-sent to Claude (cost control).
- One article failing must not abort the batch; report failures to the user.
- Deleting a category moves its articles to "미분류". Default for add/rename: apply only to newly fetched news (not re-classify old ones).
- Every query/mutation must be scoped to the signed-in Clerk user id.
- Notion saves must be idempotent (no duplicate saves) and record the resulting page URL.
- API keys (Anthropic, Notion, DB URL, Clerk secret) are server env vars only (`.env.local`); never expose to client code.
