import {
  type SQL,
  and,
  between,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  ne,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../db/client";
import {
  makerScoresTable,
  makersTable,
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
    }> = {},
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
          })),
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
          })),
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
          })),
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
          })),
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
          })),
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

  const findByIdWithMaker = async (id: string) => {
    // First get the work with all its relations
    const work = await db.query.worksTable.findFirst({
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

    if (!work || work.makers.length === 0) {
      return null;
    }

    // Get the primary maker's score information
    const primaryMaker = work.makers[0]?.maker;
    if (!primaryMaker) {
      return null;
    }

    const makerScore = await db.query.makerScoresTable.findFirst({
      where: eq(makerScoresTable.makerId, primaryMaker.id),
    });

    return {
      work,
      maker: primaryMaker,
      score: makerScore || {
        totalScore: 0,
        avgReviewScore: null,
        worksCount: 0,
      },
    };
  };

  const findByGenreId = async (
    genreId: number,
    options?: { limit?: number; offset?: number },
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

  const countByGenreId = async (genreId: number) => {
    const result = await db
      .select({ count: count() })
      .from(workGenreTable)
      .where(eq(workGenreTable.genreId, genreId));

    return result[0]?.count ?? 0;
  };

  const searchByTitle = async (
    searchTerm: string,
    options?: { limit?: number },
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
    options?: { limit?: number; excludeWorkId?: string },
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
            ne(workSeriesTable.workId, excludeWorkId),
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

  const findBySeriesId = async (
    seriesId: number,
    options?: { limit?: number; offset?: number },
  ) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    return db.query.workSeriesTable.findMany({
      where: eq(workSeriesTable.seriesId, seriesId),
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
      orderBy: [desc(workSeriesTable.workId)], // 新しい順で表示
    });
  };

  const countBySeriesId = async (seriesId: number) => {
    const result = await db
      .select({ count: count() })
      .from(workSeriesTable)
      .where(eq(workSeriesTable.seriesId, seriesId));

    return result[0]?.count ?? 0;
  };

  const findByIds = async (
    workIds: readonly string[],
    options?: { limit?: number },
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

  const findByMakerIds = async (
    makerIds: readonly number[],
    options?: { limit?: number; excludeWorkId?: string },
  ) => {
    const limit = options?.limit ?? 10;
    const excludeWorkId = options?.excludeWorkId;

    if (makerIds.length === 0) {
      return [];
    }

    const results = await db.query.workMakerTable.findMany({
      where: excludeWorkId
        ? and(
            inArray(workMakerTable.makerId, [...makerIds]),
            ne(workMakerTable.workId, excludeWorkId),
          )
        : inArray(workMakerTable.makerId, [...makerIds]),
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
      orderBy: [desc(workMakerTable.workId)], // 新しい順で表示
    });

    return results.filter((result) => result.work !== null);
  };

  const findByMakerId = async (
    makerId: number,
    options?: { limit?: number; offset?: number },
  ) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    return db.query.workMakerTable.findMany({
      where: eq(workMakerTable.makerId, makerId),
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
      orderBy: [desc(workMakerTable.workId)], // 新しい順で表示
    });
  };

  const countByMakerId = async (makerId: number) => {
    const result = await db
      .select({ count: count() })
      .from(workMakerTable)
      .where(eq(workMakerTable.makerId, makerId));

    return result[0]?.count ?? 0;
  };

  // 高スコア作者の新作（1週間以内）を取得
  const findRecentWorksByTopScoredMakers = async (options?: {
    limit?: number;
    daysAgo?: number;
  }) => {
    const limit = options?.limit ?? 20;
    const daysAgo = options?.daysAgo ?? 7;

    // 1週間前の日付を計算
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - daysAgo);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split("T")[0]; // YYYY-MM-DD形式

    // 高スコア作者の新作を取得
    return await db
      .select({
        work: {
          id: worksTable.id,
          title: worksTable.title,
          price: worksTable.price,
          listPrice: worksTable.listPrice,
          listImageUrl: worksTable.listImageUrl,
          largeImageUrl: worksTable.largeImageUrl,
          affiliateUrl: worksTable.affiliateUrl,
          releaseDate: worksTable.releaseDate,
          volume: worksTable.volume,
          reviewCount: worksTable.reviewCount,
          reviewAverageScore: worksTable.reviewAverageScore,
          createdAt: worksTable.createdAt,
          updatedAt: worksTable.updatedAt,
        },
        maker: {
          id: makersTable.id,
          name: makersTable.name,
        },
        score: {
          totalScore: makerScoresTable.totalScore,
          avgReviewScore: makerScoresTable.avgReviewScore,
          worksCount: makerScoresTable.worksCount,
        },
      })
      .from(worksTable)
      .innerJoin(workMakerTable, eq(worksTable.id, workMakerTable.workId))
      .innerJoin(makersTable, eq(workMakerTable.makerId, makersTable.id))
      .innerJoin(makerScoresTable, eq(makersTable.id, makerScoresTable.makerId))
      .where(sql`${worksTable.releaseDate} >= ${oneWeekAgoStr}`)
      .orderBy(desc(makerScoresTable.totalScore), desc(worksTable.releaseDate))
      .limit(limit);
  };

  // 価格帯別での作品検索
  const findByPriceRange = async (
    minPrice?: number,
    maxPrice?: number,
    options?: { limit?: number; offset?: number },
  ) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let whereCondition: SQL | undefined = undefined;
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereCondition = between(worksTable.price, minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      whereCondition = gte(worksTable.price, minPrice);
    } else if (maxPrice !== undefined) {
      whereCondition = lte(worksTable.price, maxPrice);
    }

    return db.query.worksTable.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: [desc(worksTable.releaseDate)],
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

  const countByPriceRange = async (minPrice?: number, maxPrice?: number) => {
    let whereCondition: SQL | undefined = undefined;
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereCondition = between(worksTable.price, minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      whereCondition = gte(worksTable.price, minPrice);
    } else if (maxPrice !== undefined) {
      whereCondition = lte(worksTable.price, maxPrice);
    }

    const result = await db
      .select({ count: count() })
      .from(worksTable)
      .where(whereCondition);

    return result[0]?.count ?? 0;
  };

  // 発売日別での作品検索
  const findByReleaseDateRange = async (
    startDate?: string,
    endDate?: string,
    options?: { limit?: number; offset?: number },
  ) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    let whereCondition: SQL | undefined = undefined;
    if (startDate && endDate) {
      whereCondition = sql`${worksTable.releaseDate} >= ${startDate} AND ${worksTable.releaseDate} <= ${endDate}`;
    } else if (startDate) {
      whereCondition = sql`${worksTable.releaseDate} >= ${startDate}`;
    } else if (endDate) {
      whereCondition = sql`${worksTable.releaseDate} <= ${endDate}`;
    }

    return db.query.worksTable.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: [desc(worksTable.releaseDate)],
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

  const countByReleaseDateRange = async (
    startDate?: string,
    endDate?: string,
  ) => {
    let whereCondition: SQL | undefined = undefined;
    if (startDate && endDate) {
      whereCondition = sql`${worksTable.releaseDate} >= ${startDate} AND ${worksTable.releaseDate} <= ${endDate}`;
    } else if (startDate) {
      whereCondition = sql`${worksTable.releaseDate} >= ${startDate}`;
    } else if (endDate) {
      whereCondition = sql`${worksTable.releaseDate} <= ${endDate}`;
    }

    const result = await db
      .select({ count: count() })
      .from(worksTable)
      .where(whereCondition);

    return result[0]?.count ?? 0;
  };

  // 評価順での作品検索（評価の高い順）
  const findByRatingOrder = async (options?: {
    limit?: number;
    offset?: number;
    minRating?: number;
  }) => {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const minRating = options?.minRating;

    let whereCondition: SQL | undefined = undefined;
    if (minRating !== undefined) {
      whereCondition = gte(worksTable.reviewAverageScore, minRating);
    }

    return db.query.worksTable.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: [
        desc(worksTable.reviewAverageScore),
        desc(worksTable.reviewCount),
      ],
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

  const countByRatingOrder = async (minRating?: number) => {
    let whereCondition: SQL | undefined = undefined;
    if (minRating !== undefined) {
      whereCondition = gte(worksTable.reviewAverageScore, minRating);
    }

    const result = await db
      .select({ count: count() })
      .from(worksTable)
      .where(whereCondition);

    return result[0]?.count ?? 0;
  };

  // 高度な検索機能 - 複数条件を組み合わせて検索
  const findWithFilters = async (filters: {
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
    limit?: number;
    offset?: number;
  }) => {
    const {
      title,
      genreId,
      makerId,
      seriesId,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      minRating,
      sortBy = "newest",
      limit = 20,
      offset = 0,
    } = filters;

    // WHERE条件を構築
    const conditions = [];

    if (title) {
      conditions.push(like(worksTable.title, `%${title}%`));
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      conditions.push(between(worksTable.price, minPrice, maxPrice));
    } else if (minPrice !== undefined) {
      conditions.push(gte(worksTable.price, minPrice));
    } else if (maxPrice !== undefined) {
      conditions.push(lte(worksTable.price, maxPrice));
    }

    if (startDate && endDate) {
      conditions.push(
        sql`${worksTable.releaseDate} >= ${startDate} AND ${worksTable.releaseDate} <= ${endDate}`,
      );
    } else if (startDate) {
      conditions.push(sql`${worksTable.releaseDate} >= ${startDate}`);
    } else if (endDate) {
      conditions.push(sql`${worksTable.releaseDate} <= ${endDate}`);
    }

    if (minRating !== undefined) {
      conditions.push(gte(worksTable.reviewAverageScore, minRating));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // ORDER BY条件を構築
    const orderBy = (() => {
      switch (sortBy) {
        case "oldest":
          return [worksTable.releaseDate];
        case "rating-high":
          return [
            desc(worksTable.reviewAverageScore),
            desc(worksTable.reviewCount),
          ];
        case "rating-low":
          return [worksTable.reviewAverageScore, worksTable.reviewCount];
        case "price-high":
          return [desc(worksTable.price)];
        case "price-low":
          return [worksTable.price];
        default:
          return [desc(worksTable.releaseDate)];
      }
    })();

    // ジャンル、作者、シリーズでのフィルタリングが必要な場合は、
    // より複雑なクエリが必要になるため、基本的な検索を実装
    return db.query.worksTable.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy,
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

  const countWithFilters = async (filters: {
    title?: string;
    genreId?: number;
    makerId?: number;
    seriesId?: number;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
    minRating?: number;
  }) => {
    const { title, minPrice, maxPrice, startDate, endDate, minRating } =
      filters;

    // WHERE条件を構築
    const conditions = [];

    if (title) {
      conditions.push(like(worksTable.title, `%${title}%`));
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      conditions.push(between(worksTable.price, minPrice, maxPrice));
    } else if (minPrice !== undefined) {
      conditions.push(gte(worksTable.price, minPrice));
    } else if (maxPrice !== undefined) {
      conditions.push(lte(worksTable.price, maxPrice));
    }

    if (startDate && endDate) {
      conditions.push(
        sql`${worksTable.releaseDate} >= ${startDate} AND ${worksTable.releaseDate} <= ${endDate}`,
      );
    } else if (startDate) {
      conditions.push(sql`${worksTable.releaseDate} >= ${startDate}`);
    } else if (endDate) {
      conditions.push(sql`${worksTable.releaseDate} <= ${endDate}`);
    }

    if (minRating !== undefined) {
      conditions.push(gte(worksTable.reviewAverageScore, minRating));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({ count: count() })
      .from(worksTable)
      .where(whereCondition);

    return result[0]?.count ?? 0;
  };

  return {
    createOrUpdate,
    findById,
    findByIdWithMaker,
    findByGenreId,
    countByGenreId,
    findByMakerId,
    countByMakerId,
    findBySeriesId,
    countBySeriesId,
    searchByTitle,
    findBySeriesIds,
    findByIds,
    findByMakerIds,
    findRecentWorksByTopScoredMakers,
    findByPriceRange,
    countByPriceRange,
    findByReleaseDateRange,
    countByReleaseDateRange,
    findByRatingOrder,
    countByRatingOrder,
    findWithFilters,
    countWithFilters,
  };
};

export type WorksRepository = ReturnType<typeof worksRepository>;
