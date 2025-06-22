import { ResultAsync } from "neverthrow";
import { BaseError } from "../../../lib/error/BaseError";
import type { DB } from "../../db/client";
import { makerScoresRepository } from "./makerScores.repository";
import { makersRepository } from "./makers.repository";

export const makerScoringService = (db: DB) => {
  const makerScoresRepositoryClient = makerScoresRepository(db);
  const makersRepositoryClient = makersRepository(db);

  // スコア計算ロジック
  const calculateScore = (stats: {
    worksCount: number;
    avgReviewScore: number | null;
    avgReviewCount: number | null;
    scoreVariance: number | null;
  }): number => {
    const { worksCount, avgReviewScore, avgReviewCount, scoreVariance } = stats;

    // 基本スコア計算
    let baseScore = 0;

    // レビュー平均スコアの重み付け (最大40点)
    if (avgReviewScore !== null && avgReviewScore > 0) {
      baseScore += (avgReviewScore / 5) * 40;
    }

    // レビュー数の重み付け (最大20点)
    if (avgReviewCount !== null && avgReviewCount > 0) {
      // 対数スケール（多くのレビューがあることを評価）
      const reviewWeight = Math.min(
        Math.log(avgReviewCount + 1) / Math.log(100),
        1
      );
      baseScore += reviewWeight * 20;
    }

    // 作品数の重み付け (最大15点)
    if (worksCount > 0) {
      const worksWeight = Math.min(Math.log(worksCount + 1) / Math.log(10), 1);
      baseScore += worksWeight * 15;
    }

    // 安定性ボーナス（分散が小さいほど高い）(最大15点)
    if (
      scoreVariance !== null &&
      avgReviewScore !== null &&
      avgReviewScore > 0
    ) {
      // 分散が小さいほど安定性が高い
      const stabilityScore = Math.max(0, 1 - scoreVariance / 2);
      baseScore += stabilityScore * 15;
    }

    // 新作期待度ボーナス（作品数が多く、安定して高評価の場合）(最大10点)
    if (worksCount >= 3 && avgReviewScore !== null && avgReviewScore >= 4) {
      const expectationBonus = Math.min(worksCount / 10, 1) * 10;
      baseScore += expectationBonus;
    }

    return Math.round(baseScore * 100) / 100;
  };

  // 単一作者のスコアを計算
  const calculateMakerScore = ResultAsync.fromThrowable(
    async (makerId: number) => {
      console.log(`Calculating score for maker ID: ${makerId}`);

      const stats = await makerScoresRepositoryClient.getMakerStats(makerId);
      if (!stats) {
        console.log(`No stats found for maker ID: ${makerId}`);
        return;
      }

      const totalScore = calculateScore(stats);

      await makerScoresRepositoryClient.createOrUpdate({
        makerId,
        worksCount: stats.worksCount,
        avgReviewScore: stats.avgReviewScore,
        avgReviewCount: stats.avgReviewCount,
        scoreVariance: stats.scoreVariance,
        totalScore,
      });

      console.log(`Score calculated for maker ID ${makerId}: ${totalScore}`);
    },
    (error) => {
      return new BaseError("FAILED_TO_CALCULATE_MAKER_SCORE", "UNHANDLED", {
        cause: error,
      });
    }
  );

  // 全作者のスコアを再計算
  const calculateAllMakerScores = ResultAsync.fromThrowable(
    async (options?: { limit?: number; offset?: number }) => {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;

      console.log(
        `Calculating scores for makers (limit: ${limit}, offset: ${offset})`
      );

      const makers = await makersRepositoryClient.findAll(limit, offset);
      let processedCount = 0;
      let errorCount = 0;

      for (const maker of makers) {
        try {
          const result = await calculateMakerScore(maker.id);
          if (result.isErr()) {
            console.error(
              `Failed to calculate score for maker ${maker.id}:`,
              result.error
            );
            errorCount++;
          } else {
            processedCount++;
          }
        } catch (error) {
          console.error(`Error processing maker ${maker.id}:`, error);
          errorCount++;
        }
      }

      console.log(
        `Score calculation completed. Processed: ${processedCount}, Errors: ${errorCount}`
      );

      return { processedCount, errorCount, totalMakers: makers.length };
    },
    (error) => {
      return new BaseError(
        "FAILED_TO_CALCULATE_ALL_MAKER_SCORES",
        "UNHANDLED",
        {
          cause: error,
        }
      );
    }
  );

  // 高スコア作者の取得
  const getTopScoredMakers = ResultAsync.fromThrowable(
    async (options?: { limit?: number; offset?: number }) => {
      const limit = options?.limit ?? 50;
      const offset = options?.offset ?? 0;

      return await makerScoresRepositoryClient.findTopScored(limit, offset);
    },
    (error) => {
      return new BaseError("FAILED_TO_GET_TOP_SCORED_MAKERS", "UNHANDLED", {
        cause: error,
      });
    }
  );

  // 作者スコアの詳細取得
  const getMakerScoreDetail = ResultAsync.fromThrowable(
    async (makerId: number) => {
      const score = await makerScoresRepositoryClient.findByMakerId(makerId);
      const maker = await makersRepositoryClient.findById(makerId);

      if (!score || !maker) {
        return null;
      }

      return {
        maker,
        score,
      };
    },
    (error) => {
      return new BaseError("FAILED_TO_GET_MAKER_SCORE_DETAIL", "UNHANDLED", {
        cause: error,
      });
    }
  );

  return {
    calculateMakerScore,
    calculateAllMakerScores,
    getTopScoredMakers,
    getMakerScoreDetail,
  };
};

export type MakerScoringService = ReturnType<typeof makerScoringService>;
