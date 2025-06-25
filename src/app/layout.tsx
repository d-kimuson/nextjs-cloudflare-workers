import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_CONFIG } from "@/lib/constants/site";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryClientProvider } from "../lib/api/QueryClientProvider";
import { RootErrorBoundary } from "./providers/RootErrorBoundary";

import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: "%s | おかずNavi",
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "ja-JP": SITE_CONFIG.url,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.siteName,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/og-image.jpg"],
    creator: "@okazu_navi",
    site: "@okazu_navi",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": SITE_CONFIG.themeColor,
    "msapplication-TileColor": SITE_CONFIG.themeColor,
    "msapplication-config": "/browserconfig.xml",
  },
} as const satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="おかずNavi" />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Additional SEO meta tags */}
        <meta name="rating" content="adult" />
        <meta name="content-rating" content="mature" />
        <meta name="audience" content="adults" />
        <meta httpEquiv="Content-Language" content="ja" />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//pics.dmm.co.jp" />
        <link rel="dns-prefetch" href="//doujin-assets.dmm.co.jp" />
        <link rel="dns-prefetch" href="//affiliate.dmm.com" />

        {/* Google Analytics */}
        <Script
          async
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FRZWXSXGVW"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-FRZWXSXGVW');
           `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <RootErrorBoundary>
          <QueryClientProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </QueryClientProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
