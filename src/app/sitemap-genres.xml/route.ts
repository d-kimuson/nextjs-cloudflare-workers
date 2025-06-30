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
import { genresRepository } from "@/server/features/genres/genres.repository";
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
    const genresRepo = genresRepository(db);

    // Get all genres with work counts
    const genres = await genresRepo.findAllWithCounts(1000, 0); // Get up to 1000 genres

    const baseUrl = SITE_CONFIG.url;
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    const sitemapEntries: SitemapEntry[] = genres.map((genre) => {
      const genreUrl = sanitizeSitemapUrl(
        `${baseUrl}/doujinshi/genres/${genre.id}`,
      );

      // Calculate priority based on work count
      const workCount = genre.workCount || 0;
      const isPopular = workCount > 50;
      const hasRecentActivity = new Date(genre.createdAt || "") > oneWeekAgo;

      const priority = calculatePriority(0.75, {
        workCount,
        isPopular,
        recentActivity: hasRecentActivity,
      });

      const changeFrequency = getChangeFrequency({
        hasRecentActivity,
        isPopular,
        workCount,
      });

      const lastModified = getLatestDate(genre.createdAt);

      return {
        url: genreUrl,
        lastModified,
        changeFrequency,
        priority,
      };
    });

    const xmlContent = generateSitemapXML(sitemapEntries);

    return createSitemapResponse(xmlContent, {
      "X-Sitemap-Type": "genres",
      "X-Content-Count": sitemapEntries.length.toString(),
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
