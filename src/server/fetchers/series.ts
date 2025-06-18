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

  return {
    ...rawSeries,
    works: rawSeries.works
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
      ),
  };
});

// シリーズの基本情報のみ取得するServer Action
export const getSeriesBasicById = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  return await seriesRepo.findById(seriesId);
});
