"use server";

import { cache } from "react";
import type { WorkItem } from "../../components/works/WorksList";
import type { WorkItemWithMaker } from "../../types/work";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";
import { type RawWork, transformToWorkItem } from "../utils/transformWorkItem";

// 作品詳細を取得するServer Action
export const getWorkById = cache(
  async (workId: string): Promise<WorkItem | null> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawWork = await worksRepo.findById(workId);

    if (!rawWork) {
      return null;
    }

    return transformToWorkItem(rawWork as RawWork);
  },
);

// ジャンルIDから作品一覧を取得するServer Action
export const getWorksByGenreId = cache(
  async (
    genreId: number,
    options?: { limit?: number; offset?: number },
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawData = await worksRepo.findByGenreId(genreId, options);

    return rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));
  },
);

// タイトルから作品を検索するServer Action
export const searchWorksByTitle = cache(
  async (
    searchTerm: string,
    options?: { limit?: number },
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawWorks = await worksRepo.searchByTitle(searchTerm, options);

    return rawWorks.map((work) => transformToWorkItem(work as RawWork));
  },
);

// シリーズIDから関連作品を取得するServer Action
export const getRelatedWorksBySeriesIds = cache(
  async (
    seriesIds: readonly number[],
    options?: { limit?: number; excludeWorkId?: string },
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawData = await worksRepo.findBySeriesIds(seriesIds, options);

    return rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));
  },
);

// 制作者IDから同じ作者の作品を取得するServer Action
export const getWorksByMakerIds = cache(
  async (
    makerIds: readonly number[],
    options?: { limit?: number; excludeWorkId?: string },
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawData = await worksRepo.findByMakerIds(makerIds, options);

    return rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));
  },
);

// 高スコア作者の新作を取得するServer Action
export const getRecentWorksByTopMakers = cache(
  async (options?: {
    limit?: number;
    daysAgo?: number;
  }): Promise<WorkItemWithMaker[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const { limit = 20, daysAgo = 7 } = options ?? {};

    try {
      const recentWorks = await worksRepo.findRecentWorksByTopScoredMakers({
        limit,
        daysAgo,
      });

      // WorkItem形式に変換
      return recentWorks.map((item) => ({
        id: item.work.id,
        title: item.work.title,
        price: item.work.price,
        listPrice: item.work.listPrice,
        listImageUrl: item.work.listImageUrl,
        largeImageUrl: item.work.largeImageUrl,
        affiliateUrl: item.work.affiliateUrl,
        releaseDate: item.work.releaseDate,
        volume: item.work.volume,
        reviewCount: item.work.reviewCount,
        reviewAverageScore: item.work.reviewAverageScore,
        genres: [], // APIからは基本情報のみ
        makers: [
          {
            id: String(item.maker.id),
            name: item.maker.name,
          },
        ],
        series: [],
        maker: {
          id: item.maker.id,
          name: item.maker.name,
          totalScore: item.score.totalScore,
          avgReviewScore: item.score.avgReviewScore,
          worksCount: item.score.worksCount,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch recent works by top makers:", error);
      return [];
    }
  },
);
