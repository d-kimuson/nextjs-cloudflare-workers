import { eq, sql } from "drizzle-orm";
import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../db/client";
import { makerScoresTable, workMakerTable, worksTable } from "../db/schema";

export interface CreateMakerScoreInput {
  makerId: number;
  worksCount: number;
  avgReviewScore?: number | null;
  avgReviewCount?: number | null;
  scoreVariance?: number | null;
  totalScore: number;
}

export interface MakerScoreStats {
  makerId: number;
  worksCount: number;
  avgReviewScore: number | null;
  avgReviewCount: number | null;
  scoreVariance: number | null;
  reviewScores: number[];
}

export const makerScoresRepository = (db: DB) => {
  const createOrUpdate = async (score: CreateMakerScoreInput) => {
    const currentTime = getCurrentDate().toISOString();

    await db
      .insert(makerScoresTable)
      .values({
        ...score,
        lastCalculatedAt: currentTime,
        createdAt: currentTime,
        updatedAt: currentTime,
      })
      .onConflictDoUpdate({
        target: [makerScoresTable.makerId],
        set: {
          worksCount: score.worksCount,
          avgReviewScore: score.avgReviewScore,
          avgReviewCount: score.avgReviewCount,
          scoreVariance: score.scoreVariance,
          totalScore: score.totalScore,
          lastCalculatedAt: currentTime,
          updatedAt: currentTime,
        },
      });
  };

  const findByMakerId = async (makerId: number) => {
    return db.query.makerScoresTable.findFirst({
      where: eq(makerScoresTable.makerId, makerId),
    });
  };

  const findTopScored = async (limit = 50, offset = 0) => {
    return await db.query.makerScoresTable.findMany({
      orderBy: (table, { desc }) => [desc(table.totalScore)],
      limit,
      offset,
      with: {
        maker: true,
      },
    });
  };

  // 作者の統計データを取得
  const getMakerStats = async (
    makerId: number
  ): Promise<MakerScoreStats | null> => {
    const result = await db
      .select({
        makerId: workMakerTable.makerId,
        worksCount: sql<number>`count(${worksTable.id})`.as("works_count"),
        avgReviewScore: sql<
          number | null
        >`avg(${worksTable.reviewAverageScore})`.as("avg_review_score"),
        avgReviewCount: sql<number | null>`avg(${worksTable.reviewCount})`.as(
          "avg_review_count"
        ),
        reviewScores:
          sql<string>`group_concat(${worksTable.reviewAverageScore})`.as(
            "review_scores"
          ),
      })
      .from(workMakerTable)
      .innerJoin(worksTable, eq(workMakerTable.workId, worksTable.id))
      .where(eq(workMakerTable.makerId, makerId))
      .groupBy(workMakerTable.makerId)
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    if (!row) return null;

    const reviewScores = row.reviewScores
      ? row.reviewScores
          .split(",")
          .map((score) => Number.parseFloat(score))
          .filter((score) => !Number.isNaN(score))
      : [];

    // 分散を計算
    let scoreVariance = null;
    if (reviewScores.length > 1 && row.avgReviewScore !== null) {
      const avgScore = row.avgReviewScore;
      const variance =
        reviewScores.reduce((sum, score) => {
          return sum + (score - avgScore) ** 2;
        }, 0) / reviewScores.length;
      scoreVariance = variance;
    }

    return {
      makerId: row.makerId ?? makerId,
      worksCount: row.worksCount,
      avgReviewScore: row.avgReviewScore,
      avgReviewCount: row.avgReviewCount,
      scoreVariance,
      reviewScores,
    };
  };

  const deleteAll = async () => {
    await db.delete(makerScoresTable);
  };

  return {
    createOrUpdate,
    findByMakerId,
    findTopScored,
    getMakerStats,
    deleteAll,
  };
};

export type MakerScoresRepository = ReturnType<typeof makerScoresRepository>;
