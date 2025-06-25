import { ResultAsync } from "neverthrow";
import { BaseError, isBaseError } from "../../../lib/error/BaseError";
import { calculatePaginationData } from "../../../lib/pagination";
import type { PaginationInfo } from "../../../types/pagination";
import type { DB } from "../../db/client";
import { dmmApiClient } from "../../lib/dmmApi/client";
import type { ItemItem, ItemMaker } from "../../lib/dmmApi/dmmApi.generated";
import { genresRepository } from "../genres/genres.repository";
import { makersRepository } from "../makers/makers.repository";
import { seriesRepository } from "../series/series.repository";
import { createWorkInput, worksRepository } from "./works.repository";
import {
  transformToWorkDetailItem,
  transformToWorkItem,
} from "./works.transform";

export const worksService = (db: DB) => {
  const makersRepositoryClient = makersRepository(db);
  const genresRepositoryClient = genresRepository(db);
  const seriesRepositoryClient = seriesRepository(db);
  const worksRepositoryClient = worksRepository(db);

  const registerWork = ResultAsync.fromThrowable(
    async (item: ItemItem) => {
      console.log(
        `registerWork: ${item.title} (${
          item.iteminfo?.maker?.at(0)?.name ?? "unknown"
        })`,
      );

      // 作者情報を処理
      for (const maker of item.iteminfo?.maker ?? []) {
        await makersRepositoryClient.createIfNotExists({
          id: maker.id,
          name: maker.name,
        });
      }

      for (const series of item.iteminfo?.series ?? []) {
        await seriesRepositoryClient.createIfNotExists({
          id: series.id,
          name: series.name,
        });
      }

      for (const genre of item.iteminfo?.genre ?? []) {
        await genresRepositoryClient.createIfNotExists({
          id: genre.id,
          name: genre.name,
        });
      }

      const parsed = createWorkInput.safeParse({
        id: item.content_id,
        title: item.title,
        volume: item.volume,
        reviewCount: item.review?.count,
        reviewAverageScore: item.review?.average,
        affiliateUrl: item.affiliateURL,
        listImageUrl: item.imageURL?.list,
        smallImageUrl: item.imageURL?.small,
        largeImageUrl: item.imageURL?.large,
        price: item.prices?.price,
        listPrice: item.prices?.list_price,
        releaseDate: item.date,
      });

      if (!parsed.success) {
        throw new BaseError("FAILED_TO_PARSE_ITEM", "BAD_REQUEST");
      }

      await worksRepositoryClient.createOrUpdate(parsed.data, {
        makerIds: item.iteminfo?.maker?.map((maker) => maker.id) ?? [],
        genreIds: item.iteminfo?.genre?.map((genre) => genre.id) ?? [],
        seriesIds: item.iteminfo?.series?.map((series) => series.id) ?? [],
        sampleSmallImages: item.sampleImageURL?.sample_s?.image ?? [],
        sampleLargeImages: item.sampleImageURL?.sample_l?.image ?? [],
      });
    },
    (error) => {
      if (isBaseError(error) && error.code === "FAILED_TO_PARSE_ITEM") {
        return error;
      }

      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  const registerWorksFromMaker = ResultAsync.fromThrowable(
    async (maker: ItemMaker) => {
      const makerItems = await dmmApiClient.getItemListByMaker(maker.id, {
        hits: 100,
      });

      if (makerItems.isErr()) {
        console.error(
          "Failed to fetch maker items",
          maker.name,
          JSON.stringify(makerItems.error, null, 2),
        );

        return new BaseError("FAILED_TO_FETCH_MAKER_ITEMS", "BAD_REQUEST");
      }

      for (const item of makerItems.value) {
        await registerWork(item);
      }
    },
    (error) => {
      if (isBaseError(error) && error.code === "FAILED_TO_FETCH_MAKER_ITEMS") {
        return error;
      }

      return new BaseError("UNKNOWN_ERROR", "UNHANDLED", {
        cause: error,
      });
    },
  );

  const getWorkById = ResultAsync.fromThrowable(async (workId: string) => {
    const work = await worksRepositoryClient.findById(workId);
    if (!work) return null;
    return transformToWorkDetailItem(work);
  });

  const getWorksByGenreId = ResultAsync.fromThrowable(
    async (
      genreId: number,
      params?: {
        page?: number;
        limit?: number;
      },
    ) => {
      const { page = 1, limit = 20 } = params ?? {};
      const totalItems = await worksRepositoryClient.countByGenreId(genreId);
      const paginationData = calculatePaginationData(totalItems, page, limit);

      const works = await worksRepositoryClient.findByGenreId(genreId, {
        limit: paginationData.itemsPerPage,
        offset: paginationData.offset,
      });

      return {
        works: works
          .map((work) => work.work)
          .filter((work) => work !== null)
          .map((work) => transformToWorkItem(work)),
        pagination: {
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage,
          hasNextPage: paginationData.hasNextPage,
          hasPreviousPage: paginationData.hasPreviousPage,
        },
      };
    },
  );

  const getWorksByMakerId = ResultAsync.fromThrowable(
    async (
      makerId: number,
      params?: {
        page?: number;
        limit?: number;
      },
    ) => {
      const { page = 1, limit = 20 } = params ?? {};
      const totalItems = await worksRepositoryClient.countByMakerId(makerId);
      const paginationData = calculatePaginationData(totalItems, page, limit);

      const works = await worksRepositoryClient.findByMakerId(makerId, {
        limit: paginationData.itemsPerPage,
        offset: paginationData.offset,
      });

      return {
        works: works.map((work) => transformToWorkItem(work)),
        pagination: {
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage,
          hasNextPage: paginationData.hasNextPage,
          hasPreviousPage: paginationData.hasPreviousPage,
          currentPage: page,
        } satisfies PaginationInfo,
      };
    },
  );

  const getWorksByMakerIds = ResultAsync.fromThrowable(
    async (
      makerIds: number[],
      params?: {
        limit?: number;
      },
    ) => {
      const { limit = 20 } = params ?? {};
      const works = await worksRepositoryClient.findByMakerIds(makerIds, {
        limit,
      });

      return {
        works: works
          .map((work) => work.work)
          .filter((work) => work !== null)
          .map((work) => transformToWorkItem(work)),
      };
    },
  );

  const getWorksBySeriesId = ResultAsync.fromThrowable(
    async (
      seriesId: number,
      params?: {
        page?: number;
        limit?: number;
      },
    ) => {
      const { page = 1, limit = 20 } = params ?? {};
      const totalItems = await worksRepositoryClient.countBySeriesId(seriesId);
      const paginationData = calculatePaginationData(totalItems, page, limit);

      const works = await worksRepositoryClient.findBySeriesId(seriesId, {
        limit: paginationData.itemsPerPage,
        offset: paginationData.offset,
      });

      return {
        works: works.map((work) => transformToWorkItem(work)),
        pagination: {
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage,
          hasNextPage: paginationData.hasNextPage,
          hasPreviousPage: paginationData.hasPreviousPage,
        },
      };
    },
  );

  const search = ResultAsync.fromThrowable(
    async (
      options: {
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
      pagenationParams?: {
        page?: number;
        limit?: number;
      },
    ) => {
      const { page = 1, limit = 20 } = pagenationParams ?? {};
      const count = await worksRepositoryClient.countWithFilters(options);
      const paginationData = calculatePaginationData(count, page, limit);
      const rawWorks = await worksRepositoryClient.findWithFilters({
        ...options,
        limit: paginationData.itemsPerPage,
        offset: paginationData.offset,
      });

      return {
        works: rawWorks.map((work) => transformToWorkItem(work)),
        pagination: {
          totalPages: paginationData.totalPages,
          totalItems: paginationData.totalItems,
          itemsPerPage: paginationData.itemsPerPage,
          hasNextPage: paginationData.hasNextPage,
          hasPreviousPage: paginationData.hasPreviousPage,
        },
      };
    },
  );

  const getRecentWorksByTopMakers = ResultAsync.fromThrowable(
    async (params?: { limit?: number; daysAgo?: number }) => {
      const worksRepo = worksRepository(db);
      const { limit = 20, daysAgo = 7 } = params ?? {};

      const recentWorks = await worksRepo.findRecentWorksByTopScoredMakers({
        limit,
        daysAgo,
      });

      return recentWorks.map((work) => transformToWorkItem(work));
    },
  );

  return {
    registerWork,
    registerWorksFromMaker,
    getWorkById,
    getWorksByGenreId,
    getWorksByMakerId,
    getWorksByMakerIds,
    getWorksBySeriesId,
    search,
    getRecentWorksByTopMakers,
  };
};
