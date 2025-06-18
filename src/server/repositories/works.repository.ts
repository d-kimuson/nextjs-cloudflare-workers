import { eq, like, desc, inArray, ne, and } from "drizzle-orm";
import { z } from "zod";
import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../db/client";
import {
  sampleLargeImagesTable,
  sampleSmallImagesTable,
  workGenreTable,
  workMakerTable,
  workSeriesTable,
  worksTable,
} from "../db/schema";

export const createWorkInput = z.object({
  id: z.string(),
  title: z.string(),
  volume: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .optional(),
  reviewCount: z.number().optional(),
  reviewAverageScore: z
    .string()
    .transform((val) => Number.parseFloat(val))
    .optional(),
  affiliateUrl: z.string(),
  listImageUrl: z.string(),
  smallImageUrl: z.string().optional(),
  largeImageUrl: z.string(),
  price: z.string().transform((val) => Number.parseInt(val, 10)),
  listPrice: z.string().transform((val) => Number.parseInt(val, 10)),
  releaseDate: z.string(),
});

export type CreateWorkInput = z.infer<typeof createWorkInput>;

export const worksRepository = (db: DB) => {
  const createOrUpdate = async (
    work: CreateWorkInput,
    related: Partial<{
      makerIds: readonly number[];
      genreIds: readonly number[];
      seriesIds: readonly number[];
      sampleSmallImages: readonly string[];
      sampleLargeImages: readonly string[];
    }> = {}
  ) => {
    const {
      makerIds = [],
      genreIds = [],
      seriesIds = [],
      sampleSmallImages = [],
      sampleLargeImages = [],
    } = related;
    const currentTime = getCurrentDate().toISOString();

    await db
      .insert(worksTable)
      .values({
        ...work,
        createdAt: currentTime,
      })
      .onConflictDoUpdate({
        target: [worksTable.id],
        set: {
          volume: work.volume,
          reviewCount: work.reviewCount,
          reviewAverageScore: work.reviewAverageScore,
          listImageUrl: work.listImageUrl,
          smallImageUrl: work.smallImageUrl,
          largeImageUrl: work.largeImageUrl,
          price: work.price,
          updatedAt: currentTime,
        },
      });

    // sampleSmallImages
    if (sampleSmallImages.length > 0) {
      await db
        .insert(sampleSmallImagesTable)
        .values(
          sampleSmallImages.map((imageUrl, index) => ({
            workId: work.id,
            imageUrl,
            order: index,
            createdAt: currentTime,
          }))
        )
        .onConflictDoNothing();
    }

    // sampleLargeImages
    if (sampleLargeImages.length > 0) {
      await db
        .insert(sampleLargeImagesTable)
        .values(
          sampleLargeImages.map((imageUrl, index) => ({
            workId: work.id,
            imageUrl,
            order: index,
            createdAt: currentTime,
          }))
        )
        .onConflictDoNothing();
    }

    // genre
    if (genreIds.length > 0) {
      await db
        .insert(workGenreTable)
        .values(
          genreIds.map((genreId) => ({
            workId: work.id,
            genreId,
          }))
        )
        .onConflictDoNothing();
    }

    // series
    if (seriesIds.length > 0) {
      await db
        .insert(workSeriesTable)
        .values(
          seriesIds.map((seriesId) => ({
            workId: work.id,
            seriesId,
          }))
        )
        .onConflictDoNothing();
    }

    // maker
    if (makerIds.length > 0) {
      await db
        .insert(workMakerTable)
        .values(
          makerIds.map((makerId) => ({
            workId: work.id,
            makerId,
          }))
        )
        .onConflictDoNothing();
    }
  };

  const findById = async (id: string) => {
    return db.query.worksTable.findFirst({
      where: eq(worksTable.id, id),
      with: {
        genres: {
          with: {
            genre: true,
          },
        },
        makers: {
          with: {
            maker: true,
          },
        },
        sampleLargeImages: true,
        sampleSmallImages: true,
        series: {
          with: {
            series: true,
          },
        },
      },
    });
  };

  const findByGenreId = async (
    genreId: number,
    options?: { limit?: number; offset?: number }
  ) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    return db.query.workGenreTable.findMany({
      where: eq(workGenreTable.genreId, genreId),
      limit,
      offset,
      with: {
        work: {
          with: {
            genres: {
              with: {
                genre: true,
              },
            },
            makers: {
              with: {
                maker: true,
              },
            },
            series: {
              with: {
                series: true,
              },
            },
          },
        },
      },
    });
  };

  const searchByTitle = async (
    searchTerm: string,
    options?: { limit?: number }
  ) => {
    const limit = options?.limit ?? 10;

    // 検索語が空の場合は空配列を返す
    if (!searchTerm.trim()) {
      return [];
    }

    // パフォーマンスのため、検索語が2文字未満の場合は検索しない
    if (searchTerm.trim().length < 2) {
      return [];
    }

    return db.query.worksTable.findMany({
      where: like(worksTable.title, `%${searchTerm}%`),
      limit,
      orderBy: [desc(worksTable.createdAt)], // 新しい順で表示
      with: {
        genres: {
          with: {
            genre: true,
          },
        },
        makers: {
          with: {
            maker: true,
          },
        },
        series: {
          with: {
            series: true,
          },
        },
      },
    });
  };

  const findBySeriesIds = async (
    seriesIds: readonly number[],
    options?: { limit?: number; excludeWorkId?: string }
  ) => {
    const limit = options?.limit ?? 10;
    const excludeWorkId = options?.excludeWorkId;

    if (seriesIds.length === 0) {
      return [];
    }

    const results = await db.query.workSeriesTable.findMany({
      where: excludeWorkId
        ? and(
            inArray(workSeriesTable.seriesId, [...seriesIds]),
            ne(workSeriesTable.workId, excludeWorkId)
          )
        : inArray(workSeriesTable.seriesId, [...seriesIds]),
      limit,
      with: {
        work: {
          with: {
            genres: {
              with: {
                genre: true,
              },
            },
            makers: {
              with: {
                maker: true,
              },
            },
            series: {
              with: {
                series: true,
              },
            },
          },
        },
      },
      orderBy: [desc(workSeriesTable.workId)], // 新しい順で表示
    });

    return results.filter((result) => result.work !== null);
  };

  const findByIds = async (
    workIds: readonly string[],
    options?: { limit?: number }
  ) => {
    const limit = options?.limit ?? 100;

    if (workIds.length === 0) {
      return [];
    }

    return db.query.worksTable.findMany({
      where: inArray(worksTable.id, [...workIds]),
      limit,
      orderBy: [desc(worksTable.createdAt)], // 新しい順で表示
      with: {
        genres: {
          with: {
            genre: true,
          },
        },
        makers: {
          with: {
            maker: true,
          },
        },
        series: {
          with: {
            series: true,
          },
        },
      },
    });
  };

  return {
    createOrUpdate,
    findById,
    findByGenreId,
    searchByTitle,
    findBySeriesIds,
    findByIds,
  };
};

export type WorksRepository = ReturnType<typeof worksRepository>;
