import { SITE_CONFIG } from "@/lib/constants/site";
import { getDb } from "@/server/db/client";
import { genresTable, workGenreTable, worksTable } from "@/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = SITE_CONFIG.url;

  try {
    const db = await getDb();
    // Get all genres with their work counts and latest activity
    const genres = await db
      .select({
        id: genresTable.id,
        createdAt: genresTable.createdAt,
        workCount: sql<number>`count(${workGenreTable.workId})`.as(
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
        recentWorkCount:
          sql<number>`count(case when ${worksTable.releaseDate} > date('now', '-30 days') then 1 end)`.as(
            "recent_work_count",
          ),
      })
      .from(genresTable)
      .leftJoin(workGenreTable, eq(genresTable.id, workGenreTable.genreId))
      .leftJoin(worksTable, eq(workGenreTable.workId, worksTable.id))
      .groupBy(genresTable.id)
      .orderBy(desc(sql`work_count`), desc(sql`avg_review_count`));

    const sitemapEntries = genres.map((genre) => {
      // Use the latest work release date if available, otherwise creation date
      const createdDate = genre.createdAt
        ? new Date(genre.createdAt)
        : new Date();
      const latestWorkDate = genre.latestWorkDate
        ? new Date(genre.latestWorkDate)
        : null;
      const lastModified =
        latestWorkDate && latestWorkDate > createdDate
          ? latestWorkDate
          : createdDate;

      // Calculate priority based on multiple factors
      let priority = 0.5; // Base priority for genres

      // Work count based priority (genres are important landing pages)
      if (genre.workCount > 5000) {
        priority = 0.95;
      } else if (genre.workCount > 2000) {
        priority = 0.9;
      } else if (genre.workCount > 1000) {
        priority = 0.85;
      } else if (genre.workCount > 500) {
        priority = 0.8;
      } else if (genre.workCount > 200) {
        priority = 0.75;
      } else if (genre.workCount > 100) {
        priority = 0.7;
      } else if (genre.workCount > 50) {
        priority = 0.65;
      } else if (genre.workCount > 10) {
        priority = 0.6;
      }

      // Recent activity boost
      if (genre.recentWorkCount && genre.recentWorkCount > 0) {
        priority = Math.min(priority + 0.05, 1.0);
      }

      // Quality boost based on average reviews
      if (genre.avgReviewScore && genre.avgReviewScore >= 4.0) {
        priority = Math.min(priority + 0.03, 1.0);
      }

      // Popularity boost
      if (genre.avgReviewCount && genre.avgReviewCount > 30) {
        priority = Math.min(priority + 0.03, 1.0);
      }

      // Determine change frequency based on activity
      let changeFrequency: "daily" | "weekly" | "monthly" = "weekly";
      if (genre.recentWorkCount && genre.recentWorkCount > 10) {
        changeFrequency = "daily"; // Very active genres
      } else if (genre.workCount > 1000) {
        changeFrequency = "weekly"; // Popular genres
      } else if (genre.workCount < 50) {
        changeFrequency = "monthly"; // Less active genres
      }

      return {
        url: `${baseUrl}/doujinshi/genres/${genre.id}`,
        lastModified,
        changeFrequency,
        priority: Math.round(priority * 100) / 100, // Round to 2 decimal places
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
    console.error("Error generating genres sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
