import type { DB } from "../../db/client";
import { seriesRepository } from "./series.repository";
import { ResultAsync } from "neverthrow";
import { transformToWorkItem } from "../works/works.transform";
import { worksRepository } from "../works/works.repository";
import type { SeriesItemDetail } from "./series.model";

export const seriesService = (db: DB) => {
  const seriesRepositoryClient = seriesRepository(db);
  const worksRepositoryClient = worksRepository(db);

  const getSeriesById = ResultAsync.fromThrowable(
    async (seriesId: number): Promise<SeriesItemDetail | null> => {
      const [series, works] = await Promise.all([
        seriesRepositoryClient.findById(seriesId),
        worksRepositoryClient.findBySeriesId(seriesId),
      ]);

      if (series === null || series === undefined) {
        return null;
      }

      const worksWithRating = works.filter(
        (work) =>
          work.reviewAverageScore !== null &&
          work.reviewAverageScore !== undefined &&
          work.reviewAverageScore > 0
      );

      const averageRating =
        worksWithRating.length > 0
          ? worksWithRating.reduce(
              (sum, work) => sum + (work.reviewAverageScore || 0),
              0
            ) / worksWithRating.length
          : null;

      return {
        ...series,
        works: works.map((work) => transformToWorkItem(work)),
        stats: {
          totalWorks: works.length,
          averageRating,
        },
      };
    }
  );

  return {
    getSeriesById,
  };
};
