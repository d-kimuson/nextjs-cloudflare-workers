import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
}

export interface SitemapResponse {
  xml: string;
  headers: Record<string, string>;
}

/**
 * Generates XML sitemap content from sitemap entries
 */
export function generateSitemapXML(entries: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString().split("T")[0]}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}

/**
 * Creates a NextResponse for sitemap with appropriate headers
 */
export function createSitemapResponse(
  xmlContent: string,
  additionalHeaders: Record<string, string> = {},
): NextResponse {
  return new NextResponse(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=21600, s-maxage=43200", // Cache for 6 hours, CDN for 12 hours
      ...additionalHeaders,
    },
  });
}

/**
 * Creates an error response for sitemap generation failures
 */
export function createSitemapErrorResponse(error: unknown): NextResponse {
  console.error("Sitemap generation error:", error);

  const errorXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap temporarily unavailable -->
</urlset>`;

  return new NextResponse(errorXML, {
    status: 500,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=300, s-maxage=600", // Short cache for errors
    },
  });
}

/**
 * Validates and sanitizes sitemap URL
 */
export function sanitizeSitemapUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // Ensure HTTPS for production
    if (parsedUrl.hostname !== "localhost" && parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "https:";
    }
    return parsedUrl.toString();
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

/**
 * Calculates priority based on multiple factors
 */
export function calculatePriority(
  basePriority: number,
  factors: {
    reviewCount?: number;
    reviewScore?: number;
    workCount?: number;
    recentActivity?: boolean;
    isPopular?: boolean;
  },
): number {
  let priority = basePriority;

  // Review count boost
  if (factors.reviewCount) {
    if (factors.reviewCount > 200) priority += 0.3;
    else if (factors.reviewCount > 100) priority += 0.2;
    else if (factors.reviewCount > 50) priority += 0.15;
    else if (factors.reviewCount > 20) priority += 0.1;
    else if (factors.reviewCount > 5) priority += 0.05;
  }

  // Review score boost
  if (factors.reviewScore) {
    if (factors.reviewScore >= 4.5) priority += 0.1;
    else if (factors.reviewScore >= 4.0) priority += 0.05;
  }

  // Work count boost (for makers/series)
  if (factors.workCount) {
    if (factors.workCount > 50) priority += 0.2;
    else if (factors.workCount > 20) priority += 0.15;
    else if (factors.workCount > 10) priority += 0.1;
    else if (factors.workCount > 5) priority += 0.05;
  }

  // Recent activity boost
  if (factors.recentActivity) {
    priority += 0.1;
  }

  // Popular content boost
  if (factors.isPopular) {
    priority += 0.05;
  }

  // Cap at 1.0 and round to 2 decimal places
  return Math.round(Math.min(priority, 1.0) * 100) / 100;
}

/**
 * Determines change frequency based on activity patterns
 */
export function getChangeFrequency(factors: {
  isNew?: boolean;
  isPopular?: boolean;
  hasRecentActivity?: boolean;
  workCount?: number;
}): "daily" | "weekly" | "monthly" {
  if (factors.isNew || (factors.hasRecentActivity && factors.isPopular)) {
    return "daily";
  }

  if (
    factors.isPopular ||
    factors.hasRecentActivity ||
    (factors.workCount && factors.workCount > 10)
  ) {
    return "weekly";
  }

  return "monthly";
}

/**
 * Gets the most recent date from multiple date sources
 */
export function getLatestDate(
  ...dates: (Date | string | null | undefined)[]
): Date {
  const validDates = dates
    .filter((date): date is Date | string => date != null)
    .map((date) => (typeof date === "string" ? new Date(date) : date))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) {
    return new Date();
  }

  return new Date(Math.max(...validDates.map((date) => date.getTime())));
}
