import { SITE_CONFIG } from "@/lib/constants/site";
import { getDb } from "@/server/db/client";
import { seriesTable, workSeriesTable, worksTable } from "@/server/db/schema";
import { desc, eq, max, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = SITE_CONFIG.url;

  try {
    const db = await getDb();
    // Get all series with their work counts and latest work info
    const series = await db
      .select({
        id: seriesTable.id,
        createdAt: seriesTable.createdAt,
        workCount: sql<number>`count(${workSeriesTable.workId})`.as(
          "work_count",
        ),
        latestWorkDate: sql<string>`max(${worksTable.releaseDate})`.as(
          "latest_work_date",
        ),
        avgReviewCount: sql<number>`avg(${worksTable.reviewCount})`.as(
          "avg_review_count",
        ),
        avgReviewScore: sql<number>`avg(${worksTable.reviewAverageScore})`.as(
          "avg_review_score",
        ),
      })
      .from(seriesTable)
      .leftJoin(workSeriesTable, eq(seriesTable.id, workSeriesTable.seriesId))
      .leftJoin(worksTable, eq(workSeriesTable.workId, worksTable.id))
      .groupBy(seriesTable.id)
      .orderBy(desc(sql`work_count`), desc(sql`avg_review_count`));

    const sitemapEntries = series.map((seriesItem) => {
      // Use the latest work release date if available, otherwise creation date
      const createdDate = seriesItem.createdAt
        ? new Date(seriesItem.createdAt)
        : new Date();
      const latestWorkDate = seriesItem.latestWorkDate
        ? new Date(seriesItem.latestWorkDate)
        : null;
      const lastModified =
        latestWorkDate && latestWorkDate > createdDate
          ? latestWorkDate
          : createdDate;

      // Calculate priority based on multiple factors
      let priority = 0.4; // Base priority for series

      // Work count based priority
      if (seriesItem.workCount > 20) {
        priority = 0.9;
      } else if (seriesItem.workCount > 10) {
        priority = 0.8;
      } else if (seriesItem.workCount > 5) {
        priority = 0.7;
      } else if (seriesItem.workCount > 2) {
        priority = 0.6;
      } else if (seriesItem.workCount > 1) {
        priority = 0.5;
      }

      // Review-based priority boost
      if (seriesItem.avgReviewCount && seriesItem.avgReviewCount > 20) {
        priority = Math.min(priority + 0.1, 1.0);
      }

      if (seriesItem.avgReviewScore && seriesItem.avgReviewScore >= 4.0) {
        priority = Math.min(priority + 0.05, 1.0);
      }

      // Recent activity boost
      const now = new Date();
      const sixMonthsAgo = new Date(
        now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
      );
      if (latestWorkDate && latestWorkDate > sixMonthsAgo) {
        priority = Math.min(priority + 0.1, 1.0);
      }

      // Determine change frequency based on activity
      let changeFrequency: "weekly" | "monthly" = "monthly";
      const threeMonthsAgo = new Date(
        now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000,
      );
      if (latestWorkDate && latestWorkDate > threeMonthsAgo) {
        changeFrequency = "weekly"; // Active series
      } else if (seriesItem.workCount > 5) {
        changeFrequency = "weekly"; // Popular series
      }

      return {
        url: `${baseUrl}/doujinshi/series/${seriesItem.id}`,
        lastModified,
        changeFrequency,
        priority: Math.round(priority * 10) / 10,
      };
    });

    // Generate XML sitemap
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
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

    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=21600, s-maxage=43200", // Cache for 6 hours, CDN for 12 hours
      },
    });
  } catch (error) {
    console.error("Error generating series sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
