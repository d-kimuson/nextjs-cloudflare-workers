import { SITE_CONFIG } from "@/lib/constants/site";
import { getDb } from "@/server/db/client";
import { makersTable, worksTable } from "@/server/db/schema";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

const WORKS_PER_SITEMAP = 45000;
const MAKERS_PER_SITEMAP = 40000;

export async function GET() {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date().toISOString();

  try {
    const db = await getDb();

    // Get counts to determine pagination
    const [worksCount, makersCount] = await Promise.all([
      db.select({ count: count() }).from(worksTable),
      db.select({ count: count() }).from(makersTable),
    ]);

    const totalWorks = worksCount[0]?.count || 0;
    const totalMakers = makersCount[0]?.count || 0;
    const worksPages = Math.ceil(totalWorks / WORKS_PER_SITEMAP);
    const makersPages = Math.ceil(totalMakers / MAKERS_PER_SITEMAP);

    // Build sitemap entries
    const sitemapEntries = [];

    // Main sitemap
    sitemapEntries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);

    // Works sitemaps (with pagination)
    for (let page = 1; page <= worksPages; page++) {
      const url =
        page === 1
          ? `${baseUrl}/sitemap-works.xml`
          : `${baseUrl}/sitemap-works.xml?page=${page}`;
      sitemapEntries.push(`  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
    }

    // Makers sitemaps (with pagination)
    for (let page = 1; page <= makersPages; page++) {
      const url =
        page === 1
          ? `${baseUrl}/sitemap-makers.xml`
          : `${baseUrl}/sitemap-makers.xml?page=${page}`;
      sitemapEntries.push(`  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);
    }

    // Series sitemap (typically smaller dataset)
    sitemapEntries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap-series.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);

    // Genres sitemap (typically smaller dataset)
    sitemapEntries.push(`  <sitemap>
    <loc>${baseUrl}/sitemap-genres.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`);

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</sitemapindex>`;

    return new NextResponse(sitemapIndex, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=21600, s-maxage=43200", // Cache for 6 hours, CDN for 12 hours
        "X-Total-Works": totalWorks.toString(),
        "X-Total-Makers": totalMakers.toString(),
        "X-Works-Pages": worksPages.toString(),
        "X-Makers-Pages": makersPages.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating sitemap index:", error);

    // Fallback to static sitemap index if database fails
    const fallbackSitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-works.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-makers.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-series.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-genres.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

    return new NextResponse(fallbackSitemapIndex, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=1800, s-maxage=3600", // Shorter cache for fallback
      },
    });
  }
}
