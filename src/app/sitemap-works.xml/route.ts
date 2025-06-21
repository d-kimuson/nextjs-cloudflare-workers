import { SITE_CONFIG } from "@/lib/constants/site";
import { getDb } from "@/server/db/client";
import { worksTable } from "@/server/db/schema";
import { count, desc, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { NextResponse } from "next/server";

const WORKS_PER_SITEMAP = 45000; // Google recommends max 50k URLs per sitemap

export async function GET(request: Request) {
  const baseUrl = SITE_CONFIG.url;
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
  const offset = (page - 1) * WORKS_PER_SITEMAP;

  try {
    const db = await getDb();

    // Get total count for pagination info
    const totalCountResult = await db
      .select({ count: count() })
      .from(worksTable);
    const totalWorks = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalWorks / WORKS_PER_SITEMAP);

    // Validate page parameter
    if (page < 1 || page > totalPages) {
      return new NextResponse("Page not found", { status: 404 });
    }

    // Get works for current page with enhanced data
    const works = await db
      .select({
        id: worksTable.id,
        updatedAt: worksTable.updatedAt,
        releaseDate: worksTable.releaseDate,
        reviewCount: worksTable.reviewCount,
        reviewAverageScore: worksTable.reviewAverageScore,
        price: worksTable.price,
        createdAt: worksTable.createdAt,
      })
      .from(worksTable)
      .orderBy(desc(worksTable.updatedAt), desc(worksTable.createdAt))
      .limit(WORKS_PER_SITEMAP)
      .offset(offset);

    const sitemapEntries = works.map((work) => {
      // Use the more recent date between updatedAt and releaseDate for lastModified
      const updatedDate = work.updatedAt ? new Date(work.updatedAt) : null;
      const releaseDate = work.releaseDate ? new Date(work.releaseDate) : null;
      const createdDate = work.createdAt
        ? new Date(work.createdAt)
        : new Date();

      let lastModified = createdDate;
      if (updatedDate && (!lastModified || updatedDate > lastModified)) {
        lastModified = updatedDate;
      }
      if (releaseDate && (!lastModified || releaseDate > lastModified)) {
        lastModified = releaseDate;
      }

      // Calculate priority based on multiple factors
      let priority = 0.5; // Base priority for works

      // Review-based priority boost
      if (work.reviewCount && work.reviewCount > 0) {
        if (work.reviewCount > 200) {
          priority = 0.9;
        } else if (work.reviewCount > 100) {
          priority = 0.8;
        } else if (work.reviewCount > 50) {
          priority = 0.7;
        } else if (work.reviewCount > 20) {
          priority = 0.6;
        }
      }

      // Score-based priority boost
      if (work.reviewAverageScore && work.reviewAverageScore >= 4.5) {
        priority = Math.min(priority + 0.1, 1.0);
      } else if (work.reviewAverageScore && work.reviewAverageScore >= 4.0) {
        priority = Math.min(priority + 0.05, 1.0);
      }

      // Recency boost for new releases (within 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (releaseDate && releaseDate > thirtyDaysAgo) {
        priority = Math.min(priority + 0.1, 1.0);
      }

      // Determine change frequency based on activity and age
      let changeFrequency: "daily" | "weekly" | "monthly" = "monthly";
      if (releaseDate && releaseDate > thirtyDaysAgo) {
        changeFrequency = "weekly"; // New releases change more frequently
      } else if (work.reviewCount && work.reviewCount > 10) {
        changeFrequency = "weekly"; // Popular works get updated reviews
      }

      return {
        url: `${baseUrl}/doujinshi/works/${work.id}`,
        lastModified,
        changeFrequency,
        priority: Math.round(priority * 10) / 10, // Round to 1 decimal place
      };
    });

    // Generate XML sitemap with proper formatting
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
        "X-Total-Works": totalWorks.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating works sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
