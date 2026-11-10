import "server-only";
import { isAllowedImageUrl, isAllowedPageUrl } from "./image-hosts";

const TIMEOUT_MS = 8_000;
// 기사 페이지 전체가 아니라 <head>만 읽으면 되므로 앞부분만 본다.
const MAX_HTML_CHARS = 200_000;

export function decodeEntities(s: string) {
  return s
    .replace(/&#0*38;|&amp;/g, "&")
    .replace(/&#0*39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"');
}

/** 허용된 도메인의 https 이미지 주소만 돌려준다. 아니면 null. */
export function cleanImageUrl(raw: string | null | undefined, base?: string) {
  if (!raw) return null;
  try {
    const url = new URL(decodeEntities(raw.trim()), base).toString();
    return isAllowedImageUrl(url) ? url : null;
  } catch {
    return null;
  }
}

/** HTML 본문(피드 내용)에서 첫 번째 <img>의 주소를 찾는다. */
export function firstImageInHtml(html: string | undefined) {
  const src = html?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return cleanImageUrl(src);
}

/**
 * 기사 페이지의 og:image를 가져온다.
 * 이미지가 없거나 가져오지 못하면 null, 이미지가 없다고 확인된 경우도 null이다.
 * (일시적 실패와 구분하려면 호출하는 쪽에서 오류를 따로 본다 — 여기서는 던지지 않는다.)
 */
export async function fetchOgImage(
  pageUrl: string,
): Promise<{ image: string | null; ok: boolean }> {
  if (!isAllowedPageUrl(pageUrl)) return { image: null, ok: true };
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": "ai-news-collector/1.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { image: null, ok: false };
    const html = (await res.text()).slice(0, MAX_HTML_CHARS);
    const tag = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*>/i)?.[0];
    const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
    return { image: cleanImageUrl(content, pageUrl), ok: true };
  } catch {
    return { image: null, ok: false };
  }
}
