import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import { drizzle } from "drizzle-orm/d1";
import type { DB } from "../src/server/db/client";
import * as schema from "../src/server/db/schema";
import { makerScoringService } from "../src/server/features/makers/makerScoring.service";
import { getRequiredEnv } from "./utils/env";

const main = async () => {
  const sqliteDb = await createSQLiteDB(getRequiredEnv("DATABASE_URL"));
  const database = new D1Database(new D1DatabaseAPI(sqliteDb));
  const db = drizzle(database, { schema }) as unknown as DB;

  const makerScoringServiceClient = makerScoringService(db);

  console.log("=== 作者スコアリング開始 ===");

  try {
    // 全作者のスコアを計算
    const result = await makerScoringServiceClient.calculateAllMakerScores();

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
          }) - スコア: ${entry.totalScore}`,
        );
        console.log(
          `   作品数: ${entry.worksCount}, 平均評価: ${
            entry.avgReviewScore?.toFixed(2) ?? "N/A"
          }, 平均レビュー数: ${entry.avgReviewCount?.toFixed(0) ?? "N/A"}`,
        );
      });
    }
  } catch (error) {
    console.error("スクリプト実行エラー:", error);
    process.exit(1);
  } finally {
    sqliteDb.close();
  }
};

void main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
