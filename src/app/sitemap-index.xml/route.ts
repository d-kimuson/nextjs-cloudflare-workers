import { SITE_CONFIG } from "@/lib/constants/site";
import { createSitemapErrorResponse } from "@/lib/sitemap/utils";
import { getDb } from "@/server/db/client";
import { worksTable } from "@/server/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { count } from "drizzle-orm";
import { NextResponse } from "next/server";

// Maximum number of URLs per sitemap (Google recommends 50,000)
const MAX_URLS_PER_SITEMAP = 50000;

export async function GET() {
  try {
    const { env } = await getCloudflareContext<{
      DB: D1Database;
    }>({
      async: true,
    });

    const db = getDb(env.DB);
    const baseUrl = SITE_CONFIG.url;

    // Get counts for each content type to determine if we need multiple sitemaps
    const [worksCount] = await db.select({ count: count() }).from(worksTable);
    const totalWorks = worksCount?.count || 0;

    // Calculate how many work sitemaps we need
    const workSitemapCount = Math.ceil(totalWorks / MAX_URLS_PER_SITEMAP);

    const sitemaps = [
      // Main sitemap with static pages
      {
        loc: `${baseUrl}/sitemap.xml`,
        lastmod: new Date().toISOString().split("T")[0],
      },
      // Individual content type sitemaps
      {
        loc: `${baseUrl}/sitemap-makers.xml`,
        lastmod: new Date().toISOString().split("T")[0],
      },
      {
        loc: `${baseUrl}/sitemap-genres.xml`,
        lastmod: new Date().toISOString().split("T")[0],
      },
      {
        loc: `${baseUrl}/sitemap-series.xml`,
        lastmod: new Date().toISOString().split("T")[0],
      },
    ];

    // Add work sitemaps (potentially multiple if we have many works)
    if (workSitemapCount === 1) {
      sitemaps.push({
        loc: `${baseUrl}/sitemap-works.xml`,
        lastmod: new Date().toISOString().split("T")[0],
      });
    } else {
      // Add numbered work sitemaps
      for (let i = 1; i <= workSitemapCount; i++) {
        sitemaps.push({
          loc: `${baseUrl}/sitemap-works-${i}.xml`,
          lastmod: new Date().toISOString().split("T")[0],
        });
      }
    }

    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>`;

    return new NextResponse(sitemapIndexXml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "max-age=21600, s-maxage=43200", // Cache for 6 hours, CDN for 12 hours
        "X-Total-Works": totalWorks.toString(),
        "X-Work-Sitemaps": workSitemapCount.toString(),
      },
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
