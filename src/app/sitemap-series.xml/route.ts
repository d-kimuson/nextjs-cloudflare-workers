import { SITE_CONFIG } from "@/lib/constants/site";
import {
  type SitemapEntry,
  calculatePriority,
  createSitemapErrorResponse,
  createSitemapResponse,
  generateSitemapXML,
  getChangeFrequency,
  getLatestDate,
  sanitizeSitemapUrl,
} from "@/lib/sitemap/utils";
import { getDb } from "@/server/db/client";
import { seriesTable, workSeriesTable } from "@/server/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { subDays } from "date-fns";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { env } = await getCloudflareContext<{
      DB: D1Database;
    }>({
      async: true,
    });

    const db = getDb(env.DB);

    // Get all series with work counts using raw query
    const series = await db
      .select({
        id: seriesTable.id,
        name: seriesTable.name,
        createdAt: seriesTable.createdAt,
        workCount: sql<number>`count(${workSeriesTable.workId})`.as(
          "work_count",
        ),
      })
      .from(seriesTable)
      .leftJoin(workSeriesTable, eq(seriesTable.id, workSeriesTable.seriesId))
      .groupBy(seriesTable.id)
      .orderBy(sql`work_count desc`)
      .limit(1000);

    const baseUrl = SITE_CONFIG.url;
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    const sitemapEntries: SitemapEntry[] = series.map((seriesItem) => {
      const seriesUrl = sanitizeSitemapUrl(
        `${baseUrl}/doujinshi/series/${seriesItem.id}`,
      );

      // Calculate priority based on work count
      const workCount = seriesItem.workCount || 0;
      const isPopular = workCount > 10;
      const hasRecentActivity =
        new Date(seriesItem.createdAt || "") > oneWeekAgo;

      const priority = calculatePriority(0.7, {
        workCount,
        isPopular,
        recentActivity: hasRecentActivity,
      });

      const changeFrequency = getChangeFrequency({
        hasRecentActivity,
        isPopular,
        workCount,
      });

      const lastModified = getLatestDate(seriesItem.createdAt);

      return {
        url: seriesUrl,
        lastModified,
        changeFrequency,
        priority,
      };
    });

    const xmlContent = generateSitemapXML(sitemapEntries);

    return createSitemapResponse(xmlContent, {
      "X-Sitemap-Type": "series",
      "X-Content-Count": sitemapEntries.length.toString(),
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
