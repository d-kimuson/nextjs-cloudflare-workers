import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { RootErrorBoundary } from "./providers/RootErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoujinShare - 同人作品アフィリエイトサイト",
  description: "人気同人作品をご紹介。DLsite・FANZA正規購入リンク掲載",
  keywords: ["同人", "アフィリエイト", "DLsite", "FANZA", "二次元"],
  authors: [{ name: "DoujinShare" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "DoujinShare - 同人作品アフィリエイトサイト",
    description: "人気同人作品をご紹介。DLsite・FANZA正規購入リンク掲載",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoujinShare - 同人作品アフィリエイトサイト",
    description: "人気同人作品をご紹介。DLsite・FANZA正規購入リンク掲載",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <RootErrorBoundary>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </RootErrorBoundary>
        </Suspense>
      </body>
    </html>
  );
}
