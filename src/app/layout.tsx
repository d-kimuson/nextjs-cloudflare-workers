import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { RootErrorBoundary } from "./providers/RootErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_CONFIG } from "@/lib/constants/site";
import { QueryClientProvider } from "../lib/api/QueryClientProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords.slice(),
  authors: [{ name: SITE_CONFIG.author }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
} as const satisfies Metadata;

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
            <QueryClientProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </QueryClientProvider>
          </RootErrorBoundary>
        </Suspense>
      </body>
    </html>
  );
}
