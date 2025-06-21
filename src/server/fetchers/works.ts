"use server";

import { cache } from "react";
import type { WorkItem } from "../../components/works/WorksList";
import { calculatePaginationData } from "../../lib/pagination";
import type {
  PaginationParams,
  PaginationResult,
} from "../../types/pagination";
import type { WorkItemWithMaker } from "../../types/work";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";
import {
  type RawWork,
  transformToWorkItem,
  transformToWorkItemWithMaker,
} from "../utils/transformWorkItem";

// 作品詳細を取得するServer Action
export const getWorkById = cache(
  async (workId: string): Promise<WorkItemWithMaker | null> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawWorkWithMaker = await worksRepo.findByIdWithMaker(workId);

    if (!rawWorkWithMaker) {
      return null;
    }

    return transformToWorkItemWithMaker(rawWorkWithMaker);
  },
);

// ジャンルIDから作品一覧を取得するServer Action（ページネーション無し）
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

// ジャンルIDから作品一覧を取得するServer Action（ページネーション付き）
export const getWorksByGenreIdWithPagination = cache(
  async (
    genreId: number,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countByGenreId(genreId);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawData = await worksRepo.findByGenreId(genreId, {
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);

// 制作者IDから作品一覧を取得するServer Action（ページネーション付き）
export const getWorksByMakerIdWithPagination = cache(
  async (
    makerId: number,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countByMakerId(makerId);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawData = await worksRepo.findByMakerId(makerId, {
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);

// シリーズIDから作品一覧を取得するServer Action（ページネーション付き）
export const getWorksBySeriesIdWithPagination = cache(
  async (
    seriesId: number,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countBySeriesId(seriesId);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawData = await worksRepo.findBySeriesId(seriesId, {
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
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

// 価格帯別での作品検索のServer Action
export const getWorksByPriceRange = cache(
  async (
    minPrice?: number,
    maxPrice?: number,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countByPriceRange(minPrice, maxPrice);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawWorks = await worksRepo.findByPriceRange(minPrice, maxPrice, {
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawWorks.map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);

// 発売日別での作品検索のServer Action
export const getWorksByReleaseDateRange = cache(
  async (
    startDate?: string,
    endDate?: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countByReleaseDateRange(
      startDate,
      endDate,
    );

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawWorks = await worksRepo.findByReleaseDateRange(
      startDate,
      endDate,
      {
        limit: paginationData.itemsPerPage,
        offset: paginationData.offset,
      },
    );

    const works = rawWorks.map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);

// 評価順での作品検索のServer Action
export const getWorksByRatingOrder = cache(
  async (
    minRating?: number,
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countByRatingOrder(minRating);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawWorks = await worksRepo.findByRatingOrder({
      minRating,
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawWorks.map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);

// 高度な検索機能のServer Action - 複数条件を組み合わせて検索
export const getWorksWithFilters = cache(
  async (
    filters: {
      title?: string;
      genreId?: number;
      makerId?: number;
      seriesId?: number;
      minPrice?: number;
      maxPrice?: number;
      startDate?: string;
      endDate?: string;
      minRating?: number;
      sortBy?:
        | "newest"
        | "oldest"
        | "rating-high"
        | "rating-low"
        | "price-high"
        | "price-low";
    },
    params: PaginationParams = {},
  ): Promise<PaginationResult<WorkItem>> => {
    const { page = 1, limit = 20 } = params;
    const db = await getDb();
    const worksRepo = worksRepository(db);

    // 総件数を取得
    const totalItems = await worksRepo.countWithFilters(filters);

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const rawWorks = await worksRepo.findWithFilters({
      ...filters,
      limit: paginationData.itemsPerPage,
      offset: paginationData.offset,
    });

    const works = rawWorks.map((work) => transformToWorkItem(work as RawWork));

    return {
      data: works,
      pagination: {
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        itemsPerPage: paginationData.itemsPerPage,
        hasNextPage: paginationData.hasNextPage,
        hasPreviousPage: paginationData.hasPreviousPage,
      },
    };
  },
);
