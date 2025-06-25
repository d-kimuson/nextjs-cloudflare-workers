import { ResultAsync } from "neverthrow";
import { calculatePaginationData } from "../../../lib/pagination";
import type { PaginationParams } from "../../../types/pagination";
import type { DB } from "../../db/client";
import { worksRepository } from "../works/works.repository";
import { transformToWorkItem } from "../works/works.transform";
import { makerScoresRepository } from "./makerScores.repository";
import type { MakerItemDetail, MakerWithStats } from "./makers.model";
import { makersRepository } from "./makers.repository";

export const makersService = (db: DB) => {
  const makerRepositoryClient = makersRepository(db);
  const makerScoresRepositoryClient = makerScoresRepository(db);
  const worksRepositoryClient = worksRepository(db);

  const getMakerById = ResultAsync.fromThrowable(
    async (makerId: number): Promise<MakerItemDetail | null> => {
      const [maker, works] = await Promise.all([
        makerRepositoryClient.findById(makerId),
        worksRepositoryClient.findByMakerId(makerId),
      ]);

      if (maker === null || maker === undefined) {
        return null;
      }

      return {
        ...maker,
        works: works.map((work) => transformToWorkItem(work)),
      };
    },
  );

  const getMakers = ResultAsync.fromThrowable(
    async (params?: PaginationParams) => {
      const { page = 1, limit = 50 } = params ?? {};

      // 総件数を取得
      const totalItems = await makerRepositoryClient.countAll();

      // ページネーション計算
      const paginationData = calculatePaginationData(totalItems, page, limit);

      // データを取得
      const makers = await makerRepositoryClient.findAll(
        paginationData.itemsPerPage,
        paginationData.offset,
      );

      return {
        makers: makers.map(
          (maker): MakerWithStats => ({
            id: maker.id,
            name: maker.name,
            workCount: maker.workCount,
          }),
        ),
        pagination: {
          currentPage: paginationData.currentPage,
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage,
        },
      };
    },
  );

  const getMakersRanking = ResultAsync.fromThrowable(
    async (limit = 50, offset = 0) => {
      const rankings = await makerScoresRepositoryClient.findTopScored(
        limit,
        offset,
      );

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
    },
  );

  return {
    getMakerById,
    getMakers,
    getMakersRanking,
  };
};
