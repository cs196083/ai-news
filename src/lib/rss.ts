import "server-only";
import Parser from "rss-parser";
import { firstImageInHtml } from "./og-image";

export const RSS_SOURCES = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

export type FeedItem = {
  source: string;
  title: string;
  url: string;
  publishedAt: Date;
  excerpt: string | null;
  /** 피드에 이미지가 있으면 그 주소. 없으면 null (나중에 기사 페이지에서 찾는다) */
  imageUrl: string | null;
};

export type SourceFailure = { source: string; reason: string };

const WINDOW_MS = 24 * 60 * 60 * 1000;
const EXCERPT_MAX = 600;

const parser = new Parser<unknown, { contentEncoded?: string }>({
  timeout: 10_000,
  headers: { "User-Agent": "ai-news-collector/1.0" },
  // The Verge 같은 피드는 본문 HTML(content:encoded)에 이미지가 들어 있다.
  customFields: { item: [["content:encoded", "contentEncoded"]] },
});

// 같은 기사가 추적 파라미터만 달라 중복 저장되지 않도록 URL을 정규화한다.
function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_") || key === "guccounter" || key === "guce_referrer")
        u.searchParams.delete(key);
    }
    return u.toString();
  } catch {
    return null;
  }
}

function toExcerpt(text: string | undefined): string | null {
  const cleaned = text?.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length > EXCERPT_MAX
    ? `${cleaned.slice(0, EXCERPT_MAX).trimEnd()}…`
    : cleaned;
}

/**
 * 두 RSS 피드를 병렬로 가져와 지난 24시간 안에 발행된 항목만 돌려준다.
 * 한 소스가 실패해도 나머지는 계속 처리하고, 실패한 소스는 failures에 담는다.
 */
export async function fetchRecentFeedItems(now = new Date()) {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((s) => parser.parseURL(s.url)),
  );

  const since = now.getTime() - WINDOW_MS;
  const items: FeedItem[] = [];
  const failures: SourceFailure[] = [];
  const seen = new Set<string>();

  results.forEach((result, i) => {
    const source = RSS_SOURCES[i].name;
    if (result.status === "rejected") {
      failures.push({
        source,
        reason: result.reason instanceof Error ? result.reason.message : "알 수 없는 오류",
      });
      return;
    }
    for (const entry of result.value.items) {
      const title = entry.title?.trim();
      const url = entry.link ? normalizeUrl(entry.link) : null;
      const published = entry.isoDate ? new Date(entry.isoDate) : null;
      // 제목·링크·발행일을 알 수 없으면 24시간 기준을 적용할 수 없어 건너뛴다.
      if (!title || !url || !published || Number.isNaN(published.getTime())) continue;
      if (published.getTime() < since || published.getTime() > now.getTime() + 60_000) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      items.push({
        source,
        title,
        url,
        publishedAt: published,
        excerpt: toExcerpt(entry.contentSnippet ?? entry.content),
        imageUrl: firstImageInHtml(entry.contentEncoded ?? entry.content),
      });
    }
  });

  return { items, failures };
}
