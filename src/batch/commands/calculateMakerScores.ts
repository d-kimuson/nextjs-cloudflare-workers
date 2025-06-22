import type { DB } from "../../server/db/client";
import { makerScoringService } from "../../server/features/makers/makerScoring.service";

export const calculateMakerScores = async (db: DB) => {
  const makerScoringServiceClient = makerScoringService(db);

  console.log("=== 作者スコアリング開始 ===");

  // 全作者のスコアを計算
  const result = await makerScoringServiceClient.calculateAllMakerScores({
    limit: 50,
  });

  if (result.isErr()) {
    console.error("スコア計算エラー:", result.error, result.error.stack);
    throw result.error;
  }

  const { processedCount, errorCount, totalMakers } = result.value;

  console.log("=== 作者スコアリング完了 ===");
  console.log(`対象作者数: ${totalMakers}`);
  console.log(`処理成功: ${processedCount}`);
  console.log(`処理失敗: ${errorCount}`);

  // 上位10位の作者を表示
  console.log("\n=== 上位スコア作者（上位10位）===");
  const topMakersResult = await makerScoringServiceClient.getTopScoredMakers({
    limit: 10,
  });

  if (topMakersResult.isErr()) {
    console.error("上位作者取得エラー:", topMakersResult.error);
  } else {
    const topMakers = topMakersResult.value;
    topMakers.forEach((entry, index) => {
      console.log(
        `${index + 1}位: ${entry.maker?.name} (ID: ${
          entry.makerId
        }) - スコア: ${entry.totalScore}`
      );
      console.log(
        `   作品数: ${entry.worksCount}, 平均評価: ${
          entry.avgReviewScore?.toFixed(2) ?? "N/A"
        }, 平均レビュー数: ${entry.avgReviewCount?.toFixed(0) ?? "N/A"}`
      );
    });
  }
};
