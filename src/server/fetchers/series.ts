"use server";

import { cache } from "react";
import type { WorkItem } from "../../components/works/WorksList";
import { getDb } from "../db/client";
import { seriesRepository } from "../repositories/series.repository";

// シリーズ詳細を取得するServer Action
export const getSeriesById = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  const rawSeries = await seriesRepo.findByIdWithWorks(seriesId);

  if (!rawSeries) {
    return null;
  }

  const works = rawSeries.works
    .map((workRelation) => workRelation.work)
    .filter((work): work is NonNullable<typeof work> => work !== null)
    .map(
      (work): WorkItem => ({
        id: work.id,
        title: work.title,
        price: work.price,
        listPrice: work.listPrice,
        listImageUrl: work.listImageUrl,
        largeImageUrl: work.largeImageUrl,
        affiliateUrl: work.affiliateUrl,
        releaseDate: work.releaseDate,
        volume: work.volume,
        reviewCount: work.reviewCount,
        reviewAverageScore: work.reviewAverageScore,
        genres: [], // シリーズページでは基本情報のみ
        makers: [],
        series: [],
      }),
    );

  // 統計情報を計算
  const totalWorks = works.length;
  const latestWork =
    works.length > 0
      ? [...works].sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime(),
        )[0]
      : undefined;

  const worksWithRating = works.filter(
    (work) =>
      work.reviewAverageScore !== null &&
      work.reviewAverageScore !== undefined &&
      work.reviewAverageScore > 0,
  );
  const averageRating =
    worksWithRating.length > 0
      ? worksWithRating.reduce(
          (sum, work) => sum + (work.reviewAverageScore || 0),
          0,
        ) / worksWithRating.length
      : null;

  return {
    ...rawSeries,
    works,
    stats: {
      totalWorks,
      latestWork,
      averageRating: averageRating && averageRating > 0 ? averageRating : null,
    },
  };
});

// シリーズの基本情報のみ取得するServer Action
export const getSeriesBasicById = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  return await seriesRepo.findById(seriesId);
});

// シリーズの統計情報を取得するServer Action（作品一覧は含まない）
export const getSeriesWithStats = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  const rawSeries = await seriesRepo.findById(seriesId);

  if (!rawSeries) {
    return null;
  }

  // 統計情報の計算は works fetcher で行う
  return {
    ...rawSeries,
  };
});
