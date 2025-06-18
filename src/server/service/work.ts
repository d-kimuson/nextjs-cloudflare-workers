import { ResultAsync } from "neverthrow";
import { dmmApiClient } from "../../lib/dmmApi/client";
import type { ItemItem, ItemMaker } from "../../lib/dmmApi/dmmApi.generated";
import { BaseError, isBaseError } from "../../lib/error/BaseError";
import type { DB } from "../db/client";
import { genresRepository } from "../repositories/genres.repository";
import { makersRepository } from "../repositories/makers.repository";
import { seriesRepository } from "../repositories/series.repository";
import {
  createWorkInput,
  worksRepository,
} from "../repositories/works.repository";

export const workService = (db: DB) => {
  const makersRepositoryClient = makersRepository(db);
  const genresRepositoryClient = genresRepository(db);
  const seriesRepositoryClient = seriesRepository(db);
  const worksRepositoryClient = worksRepository(db);

  const registerWork = ResultAsync.fromThrowable(
    async (item: ItemItem) => {
      console.log(
        `registerWork: ${item.title} (${
          item.iteminfo?.maker?.at(0)?.name ?? "unknown"
        })`
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
    }
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
          JSON.stringify(makerItems.error, null, 2)
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
    }
  );
  return {
    registerWork,
    registerWorksFromMaker,
  };
};
