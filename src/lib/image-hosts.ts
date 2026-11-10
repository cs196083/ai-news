// 카드에 표시할 수 있는 이미지 도메인. next.config.ts의 images.remotePatterns와 같은 목록을 쓴다.
// 이 목록 밖의 주소는 저장하지 않으므로 next/image가 허용되지 않은 주소 때문에 오류를 내지 않는다.
export const IMAGE_HOST_PATTERNS = [
  "techcrunch.com",
  "**.techcrunch.com",
  "**.theverge.com",
  "**.vox-cdn.com",
] as const;

// 기사 페이지에서 대표 이미지를 찾을 때 요청해도 되는 사이트 (RSS 소스와 같은 곳만).
const PAGE_HOSTS = ["techcrunch.com", "theverge.com"];

function matchesPattern(host: string, pattern: string) {
  if (pattern.startsWith("**.")) return host.endsWith(pattern.slice(2));
  return host === pattern;
}

export function isAllowedImageUrl(raw: string) {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      IMAGE_HOST_PATTERNS.some((p) => matchesPattern(u.hostname, p))
    );
  } catch {
    return false;
  }
}

export function isAllowedPageUrl(raw: string) {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      PAGE_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))
    );
  } catch {
    return false;
  }
}
