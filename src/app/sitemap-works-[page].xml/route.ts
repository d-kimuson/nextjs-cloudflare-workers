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

interface RouteParams {
  params: Promise<{
    page: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { page: pageParam } = await params;
    const page = Number.parseInt(pageParam, 10);

    if (Number.isNaN(page) || page < 1) {
      return new Response("Invalid page number", { status: 400 });
    }

    const { env } = await getCloudflareContext<{
      DB: D1Database;
    }>({
      async: true,
    });

    const db = getDb(env.DB);
    const worksRepo = worksRepository(db);

    // Calculate offset based on page number
    const offset = (page - 1) * MAX_URLS_PER_SITEMAP;

    // Get works for this page
    const works = await db.query.worksTable.findMany({
      limit: MAX_URLS_PER_SITEMAP,
      offset,
      orderBy: (works, { desc }) => [desc(works.updatedAt)],
      with: {
        makers: {
          with: {
            maker: true,
          },
        },
      },
    });

    // If no works found for this page, return 404
    if (works.length === 0) {
      return new Response("No works found for this page", { status: 404 });
    }

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
      "X-Sitemap-Page": page.toString(),
      "X-Content-Count": sitemapEntries.length.toString(),
    });
  } catch (error) {
    return createSitemapErrorResponse(error);
  }
}
