"use server";

import { cache } from "react";
import { calculatePaginationData } from "../../lib/pagination";
import type { WorkItem } from "../../components/works/WorksList";
import type {
  PaginationParams,
  PaginationResult,
} from "../../types/pagination";
import { getDb } from "../db/client";
import { makersRepository } from "../repositories/makers.repository";

// 制作者詳細を取得するServer Action（ページネーション無し）
export const getMakerById = cache(async (makerId: number) => {
  const db = await getDb();
  const makerRepo = makersRepository(db);
  const rawMaker = await makerRepo.findById(makerId);

  if (!rawMaker) {
    return null;
  }

  return {
    ...rawMaker,
    works: rawMaker.works
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
          genres: [], // 制作者ページでは基本情報のみ
          makers: [],
          series: [],
        }),
      ),
  };
});

// 制作者基本情報のみを取得するServer Action（作品一覧は含まない）
export const getMakerByIdBasic = cache(async (makerId: number) => {
  const db = await getDb();
  const makerRepo = makersRepository(db);
  const rawMaker = await makerRepo.findById(makerId);

  if (!rawMaker) {
    return null;
  }

  return {
    id: rawMaker.id,
    name: rawMaker.name,
    description: null, // description field might not exist in schema
    avatarUrl: null, // avatarUrl field might not exist in schema
    externalUrl: null, // externalUrl field might not exist in schema
    createdAt: rawMaker.createdAt,
    updatedAt: rawMaker.updatedAt,
    worksCount: rawMaker.works.length,
  };
});

// 制作者一覧を取得するServer Action（ページネーション無し）
export const getAllMakers = cache(async (limit = 50, offset = 0) => {
  const db = await getDb();
  return await makersRepository(db).findAll(limit, offset);
});

interface MakerWithStats {
  id: number;
  name: string;
  workCount: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 制作者一覧を取得するServer Action（ページネーション付き）
export const getAllMakersWithPagination = cache(
  async (
    params: PaginationParams = {},
  ): Promise<PaginationResult<MakerWithStats>> => {
    const { page = 1, limit = 50 } = params;
    const db = await getDb();
    const makerRepo = makersRepository(db);

    // 総件数を取得
    const totalItems = await makerRepo.countAll();

    // ページネーション計算
    const paginationData = calculatePaginationData(totalItems, page, limit);

    // データを取得
    const makers = await makerRepo.findAll(
      paginationData.itemsPerPage,
      paginationData.offset,
    );

    // データベースの結果をMakerWithStats型に変換
    const transformedMakers: MakerWithStats[] = makers.map((maker) => ({
      id: maker.id,
      name: maker.name,
      workCount: maker.workCount,
      description: undefined, // データベースにdescriptionがない場合
      createdAt: maker.createdAt ? new Date(maker.createdAt) : undefined,
      updatedAt: maker.updatedAt ? new Date(maker.updatedAt) : undefined,
    }));

    return {
      data: transformedMakers,
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

// 作者ランキングを取得するServer Action
export const getMakersRanking = cache(async (limit = 50, offset = 0) => {
  const db = await getDb();
  const { makerScoresRepository } = await import(
    "../repositories/makerScores.repository"
  );
  const makerScoresRepo = makerScoresRepository(db);

  const rankings = await makerScoresRepo.findTopScored(limit, offset);

  return rankings.map((ranking, index) => ({
    id: ranking.maker?.id ?? ranking.makerId,
    name: ranking.maker?.name ?? "不明な作者",
    workCount: ranking.worksCount,
    totalScore: ranking.totalScore,
    avgReviewScore: ranking.avgReviewScore,
    avgReviewCount: ranking.avgReviewCount,
    scoreVariance: ranking.scoreVariance,
    rank: offset + index + 1,
  }));
});
