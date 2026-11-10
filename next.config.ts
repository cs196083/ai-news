import type { NextConfig } from "next";
import { IMAGE_HOST_PATTERNS } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // 카드의 원문 대표 이미지. 허용 도메인은 src/lib/image-hosts.ts 한 곳에서 관리한다.
    // search를 지정하지 않아 ?w=1024 같은 쿼리스트링이 붙은 주소도 허용된다.
    remotePatterns: IMAGE_HOST_PATTERNS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
