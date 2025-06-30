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
import { makersRepository } from "@/server/features/makers/makers.repository";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const { env } = await getCloudflareContext<{
      DB: D1Database;
    }>({
      async: true,
    });

    const db = getDb(env.DB);
    const makersRepo = makersRepository(db);

    // Get all makers with work counts
    const makers = await makersRepo.findAll(1000, 0); // Get up to 1000 makers

    const baseUrl = SITE_CONFIG.url;
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    const sitemapEntries: SitemapEntry[] = makers.map((maker) => {
      const makerUrl = sanitizeSitemapUrl(
        `${baseUrl}/doujinshi/makers/${maker.id}`,
      );

      // Calculate priority based on work count and recent activity
      const workCount = maker.workCount || 0;
      const hasRecentActivity =
        new Date(maker.updatedAt || maker.createdAt || "") > oneWeekAgo;
      const isPopular = workCount > 10;

      const priority = calculatePriority(0.7, {
        workCount,
        recentActivity: hasRecentActivity,
        isPopular,
      });

      const changeFrequency = getChangeFrequency({
        hasRecentActivity,
        isPopular,
        workCount,
      });

      const lastModified = getLatestDate(maker.updatedAt, maker.createdAt);

      return {
        url: makerUrl,
        lastModified,
        changeFrequency,
        priority,
      };
    });

    const xmlContent = generateSitemapXML(sitemapEntries);

    return createSitemapResponse(xmlContent, {
      "X-Sitemap-Type": "makers",
      "X-Content-Count": sitemapEntries.length.toString(),
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
