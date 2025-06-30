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
import { worksRepository } from "@/server/features/works/works.repository";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { subDays } from "date-fns";

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
    const worksRepo = worksRepository(db);

    // Get all works with basic info for sitemap (limit to MAX_URLS_PER_SITEMAP)
    const works = await db.query.worksTable.findMany({
      limit: MAX_URLS_PER_SITEMAP,
      orderBy: (works, { desc }) => [desc(works.updatedAt)],
      with: {
        makers: {
          with: {
            maker: true,
          },
        },
      },
    });

    const baseUrl = SITE_CONFIG.url;
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    const sitemapEntries: SitemapEntry[] = works.map((work) => {
      const workUrl = sanitizeSitemapUrl(
        `${baseUrl}/doujinshi/works/${work.id}`,
      );

      // Calculate priority based on various factors
      const isNew = new Date(work.releaseDate) > oneWeekAgo;
      const isPopular = (work.reviewCount || 0) > 50;
      const hasRecentActivity =
        new Date(work.updatedAt || work.createdAt || "") > oneWeekAgo;

      const priority = calculatePriority(0.6, {
        reviewCount: work.reviewCount || 0,
        reviewScore: work.reviewAverageScore || 0,
        recentActivity: hasRecentActivity,
        isPopular,
      });

      const changeFrequency = getChangeFrequency({
        isNew,
        isPopular,
        hasRecentActivity,
      });

      const lastModified = getLatestDate(
        work.updatedAt,
        work.createdAt,
        work.releaseDate,
      );

      return {
        url: workUrl,
        lastModified,
        changeFrequency,
        priority,
      };
    });

    const xmlContent = generateSitemapXML(sitemapEntries);

    return createSitemapResponse(xmlContent, {
      "X-Sitemap-Type": "works",
      "X-Content-Count": sitemapEntries.length.toString(),
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
