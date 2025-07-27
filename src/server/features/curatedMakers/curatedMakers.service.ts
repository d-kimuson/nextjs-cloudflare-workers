import { ResultAsync } from "neverthrow";
import { BaseError, isBaseError } from "../../../lib/error/BaseError";
import type { DB } from "../../db/client";
import { curatedMakersRepository } from "./curatedMakers.repository";

export const curatedMakersService = (db: DB) => {
  const curatedMakersRepositoryClient = curatedMakersRepository(db);

  const getCuratedMakers = ResultAsync.fromThrowable(async () => {
    return await curatedMakersRepositoryClient.findActive();
  });

  const addCuratedMakerByName = ResultAsync.fromThrowable(
    async (
      makerName: string,
      options?: {
        priority?: number;
        description?: string;
      },
    ) => {
      try {
        const maker = await curatedMakersRepositoryClient.createByMakerName(
          makerName,
          {
            priority: options?.priority ?? 0,
            description: options?.description,
            isActive: true,
          },
        );

        return maker;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("Maker not found")
        ) {
          throw new BaseError("MAKER_NOT_FOUND", "NOT_FOUND", {
            message: `Maker not found: ${makerName}`,
          });
        }
        throw error;
      }
    },
    (error) => {
      if (isBaseError(error)) {
        return error;
      }

      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  const updateCuratedMaker = ResultAsync.fromThrowable(
    async (
      id: number,
      input: {
        priority?: number;
        isActive?: boolean;
        description?: string;
      },
    ) => {
      await curatedMakersRepositoryClient.update(id, input);
    },
    (error) => {
      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  const removeCuratedMaker = ResultAsync.fromThrowable(
    async (id: number) => {
      await curatedMakersRepositoryClient.deleteById(id);
    },
    (error) => {
      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  const getRecentWorksByCuratedMakers = ResultAsync.fromThrowable(
    async (params?: { limit?: number; daysAgo?: number }) => {
      const { limit = 20, daysAgo = 7 } = params ?? {};

      // アクティブな目利き作者を取得
      const curatedMakers = await curatedMakersRepositoryClient.findActive();

      if (curatedMakers.length === 0) {
        return [];
      }

      // 目利き作者のIDリストを作成
      const makerIds = curatedMakers.map((cm) => cm.maker.id);

      // worksRepositoryを使って最新作品を取得
      const { worksRepository } = await import("../works/works.repository");
      const worksRepo = worksRepository(db);

      const recentWorks = await worksRepo.findRecentWorksByMakerIds({
        makerIds,
        limit,
        daysAgo,
      });

      // transformを適用
      const { transformToWorkItem } = await import("../works/works.transform");
      return recentWorks.map((work) => transformToWorkItem(work));
    },
    (error) => {
      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  return {
    getCuratedMakers,
    addCuratedMakerByName,
    updateCuratedMaker,
    removeCuratedMaker,
    getRecentWorksByCuratedMakers,
  };
};

export type CuratedMakersService = ReturnType<typeof curatedMakersService>;
