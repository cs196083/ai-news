import type { Metadata } from "next";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 요약",
  description: "해외 AI 뉴스를 한국어로 번역·요약해 보여주는 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Cache Components: ClerkProvider는 요청 시점 데이터를 읽으므로 Suspense 안에 둔다 */}
        <Suspense>
          <ClerkProvider>
            <Show when="signed-in">
              <header className="flex justify-end p-4">
                <UserButton />
              </header>
            </Show>
            {children}
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
