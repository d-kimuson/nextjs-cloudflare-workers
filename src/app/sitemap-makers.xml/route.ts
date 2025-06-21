import { SITE_CONFIG } from "@/lib/constants/site";
import { getDb } from "@/server/db/client";
import {
  makerScoresTable,
  makersTable,
  workMakerTable,
} from "@/server/db/schema";
import { count, desc, eq, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

const MAKERS_PER_SITEMAP = 40000; // Keep under 50k limit

export async function GET(request: Request) {
  const baseUrl = SITE_CONFIG.url;
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const offset = (page - 1) * MAKERS_PER_SITEMAP;

  try {
    const db = await getDb();

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(makersTable);
    const totalMakers = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalMakers / MAKERS_PER_SITEMAP);

    // Validate page parameter
    if (page < 1 || page > totalPages) {
      return new NextResponse("Page not found", { status: 404 });
    }

    // Get makers with their scores and work counts for current page
    const makers = await db
      .select({
        id: makersTable.id,
        updatedAt: makersTable.updatedAt,
        createdAt: makersTable.createdAt,
        workCount: sql<number>`count(${workMakerTable.workId})`.as(
          "work_count",
        ),
        totalScore: makerScoresTable.totalScore,
        avgReviewScore: makerScoresTable.avgReviewScore,
        avgReviewCount: makerScoresTable.avgReviewCount,
        lastCalculatedAt: makerScoresTable.lastCalculatedAt,
      })
      .from(makersTable)
      .leftJoin(workMakerTable, eq(makersTable.id, workMakerTable.makerId))
      .leftJoin(makerScoresTable, eq(makersTable.id, makerScoresTable.makerId))
      .groupBy(makersTable.id)
      .orderBy(desc(sql`work_count`), desc(makerScoresTable.totalScore))
      .limit(MAKERS_PER_SITEMAP)
      .offset(offset);

    const sitemapEntries = makers.map((maker) => {
      // Determine lastModified from multiple sources
      const updatedDate = maker.updatedAt ? new Date(maker.updatedAt) : null;
      const createdDate = maker.createdAt
        ? new Date(maker.createdAt)
        : new Date();
      const scoreUpdatedDate = maker.lastCalculatedAt
        ? new Date(maker.lastCalculatedAt)
        : null;

      let lastModified = createdDate;
      if (updatedDate && (!lastModified || updatedDate > lastModified)) {
        lastModified = updatedDate;
      }
      if (
        scoreUpdatedDate &&
        (!lastModified || scoreUpdatedDate > lastModified)
      ) {
        lastModified = scoreUpdatedDate;
      }

      // Calculate priority based on multiple factors
      let priority = 0.4; // Base priority for makers

      // Work count based priority
      if (maker.workCount > 50) {
        priority = 0.9;
      } else if (maker.workCount > 20) {
        priority = 0.8;
      } else if (maker.workCount > 10) {
        priority = 0.7;
      } else if (maker.workCount > 5) {
        priority = 0.6;
      } else if (maker.workCount > 1) {
        priority = 0.5;
      }

      // Score-based priority boost
      if (maker.totalScore) {
        if (maker.totalScore > 90) {
          priority = Math.min(priority + 0.15, 1.0);
        } else if (maker.totalScore > 80) {
          priority = Math.min(priority + 0.1, 1.0);
        } else if (maker.totalScore > 70) {
          priority = Math.min(priority + 0.05, 1.0);
        }
      }

      // Average review score boost
      if (maker.avgReviewScore && maker.avgReviewScore >= 4.5) {
        priority = Math.min(priority + 0.05, 1.0);
      }

      // High review count boost (popular makers)
      if (maker.avgReviewCount && maker.avgReviewCount > 50) {
        priority = Math.min(priority + 0.05, 1.0);
      }

      // Determine change frequency based on activity
      let changeFrequency: "daily" | "weekly" | "monthly" = "monthly";
      if (maker.workCount > 10) {
        changeFrequency = "weekly"; // Active makers change more frequently
      }
      // Recent score updates indicate active maker
      if (scoreUpdatedDate) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (scoreUpdatedDate > weekAgo) {
          changeFrequency = "weekly";
        }
      }

      return {
        url: `${baseUrl}/doujinshi/makers/${maker.id}`,
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
        "X-Total-Pages": totalPages.toString(),
        "X-Current-Page": page.toString(),
        "X-Total-Makers": totalMakers.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating makers sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
