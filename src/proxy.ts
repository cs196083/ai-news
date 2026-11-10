import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

// 페이지는 로그인 모달로 처리하므로 리다이렉트하지 않고,
// API 라우트는 로그인하지 않은 요청을 차단한다.
export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};
