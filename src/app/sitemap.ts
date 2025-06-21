import { SITE_CONFIG } from "@/lib/constants/site";
import { sanitizeSitemapUrl } from "@/lib/sitemap/utils";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;

  try {
    const staticPages = [
      // ホームページ - 最高優先度
      {
        url: sanitizeSitemapUrl(baseUrl),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      // ランキングページ - 日次更新の重要コンテンツ
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/daily-ranking`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.95,
      },
      // 新作ページ - 日次更新の重要コンテンツ
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/new-releases`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.95,
      },
      // 作者一覧 - 重要なランディングページ
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/makers`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      },
      // ジャンル一覧 - 重要なランディングページ
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/genres`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      },
      // シリーズ一覧 - 追加のランディングページ
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/series`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      // 検索ページ - ユーザーエンゲージメント重要
      {
        url: sanitizeSitemapUrl(`${baseUrl}/doujinshi/search`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      // マイページ - ユーザー機能
      {
        url: sanitizeSitemapUrl(`${baseUrl}/mypage`),
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ];

    return staticPages;
  } catch (error) {
    console.error("Error generating main sitemap:", error);

    // Fallback to basic URLs without sanitization if URL parsing fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/doujinshi/daily-ranking`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/doujinshi/new-releases`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/doujinshi/makers`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/doujinshi/genres`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  }
}
