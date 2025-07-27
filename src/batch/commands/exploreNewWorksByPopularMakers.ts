import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../../server/db/client";
import { curatedMakersRepository } from "../../server/features/curatedMakers/curatedMakers.repository";
import { makersRepository } from "../../server/features/makers/makers.repository";
import { worksService } from "../../server/features/works/works.service";
import { dmmApiClient } from "../../server/lib/dmmApi/client";

const DAYS_TO_LOOKBACK = 14; // 過去14日間の新作を探索
const MAKERS_TO_PROCESS = 50; // 処理する作者数の上限
const WORKS_PER_MAKER = 20; // 作者ごとの取得作品数

export const exploreNewWorksByPopularMakers = async (db: DB) => {
  console.log(
    "Starting new works exploration by popular and curated makers...",
  );
  const workServiceClient = worksService(db);
  const makersRepositoryClient = makersRepository(db);
  const curatedMakersRepositoryClient = curatedMakersRepository(db);

  let totalNewWorksFound = 0;

  // 1. 目利き作者の新作を優先して取得
  console.log("Fetching works from curated makers...");
  const curatedMakers = await curatedMakersRepositoryClient.findActive();

  if (curatedMakers.length > 0) {
    console.log(
      `Found ${curatedMakers.length} curated makers: ${curatedMakers
        .slice(0, 5)
        .map((cm) => cm.maker.name)
        .join(", ")}...`,
    );

    for (const curatedMaker of curatedMakers) {
      const maker = curatedMaker.maker;
      try {
        console.log(
          `Processing curated maker: ${maker.name} (priority: ${curatedMaker.priority})`,
        );

        // DMM APIから作者の新作を取得
        const makerWorksResult = await dmmApiClient.getItemListByMaker(
          maker.id,
          {
            hits: WORKS_PER_MAKER,
          },
        );

        if (makerWorksResult.isErr()) {
          console.warn(
            `Failed to fetch works for curated maker ${maker.name}: ${makerWorksResult.error.message}`,
          );
          continue;
        }

        const allWorks = makerWorksResult.value;

        // 過去N日間の作品のみフィルタリング
        const cutoffDate = getDateDaysAgo(DAYS_TO_LOOKBACK);
        const recentWorks = allWorks.filter((work) => {
          return work.date && work.date >= cutoffDate;
        });

        console.log(
          `Found ${recentWorks.length} recent works (since ${cutoffDate}) for curated maker ${maker.name}`,
        );

        // 各作品をデータベースに登録
        for (const work of recentWorks) {
          const registerResult = await workServiceClient.registerWork(work);
          if (registerResult.isOk()) {
            totalNewWorksFound++;
          } else {
            console.warn(
              `Failed to register work ${work.title}: ${registerResult.error.message}`,
            );
          }
        }
      } catch (error) {
        console.error(`Error processing curated maker ${maker.name}:`, error);
      }
    }
  }

  // 2. 人気作者（作品数が多い順）からも追加で取得
  console.log(`Fetching top ${MAKERS_TO_PROCESS} popular makers...`);
  const popularMakers = await makersRepositoryClient.findAll(
    MAKERS_TO_PROCESS,
    0,
  );

  console.log(
    `Found ${popularMakers.length} makers: ${popularMakers
      .slice(0, 5)
      .map((m) => m.name)
      .join(", ")}...`,
  );

  // 3. 各作者の新作を探索（目利き作者と重複する場合はスキップ）
  const curatedMakerIds = new Set(curatedMakers.map((cm) => cm.maker.id));

  for (const maker of popularMakers) {
    // 目利き作者は既に処理済みなのでスキップ
    if (curatedMakerIds.has(maker.id)) {
      continue;
    }
    try {
      console.log(`Processing maker: ${maker.name} (${maker.workCount} works)`);

      // DMM APIから作者の新作を取得
      const makerWorksResult = await dmmApiClient.getItemListByMaker(maker.id, {
        hits: WORKS_PER_MAKER,
      });

      if (makerWorksResult.isErr()) {
        console.warn(
          `Failed to fetch works for maker ${maker.name}: ${makerWorksResult.error.message}`,
        );
        continue;
      }

      const allWorks = makerWorksResult.value;

      // 3. 過去N日間の作品のみフィルタリング
      const cutoffDate = getDateDaysAgo(DAYS_TO_LOOKBACK);
      const recentWorks = allWorks.filter((work) => {
        return work.date && work.date >= cutoffDate;
      });

      console.log(
        `Found ${recentWorks.length} recent works (since ${cutoffDate}) for ${maker.name}`,
      );

      // 4. 各作品をデータベースに登録
      for (const work of recentWorks) {
        const registerResult = await workServiceClient.registerWork(work);
        if (registerResult.isOk()) {
          totalNewWorksFound++;
        } else {
          console.warn(
            `Failed to register work ${work.title}: ${registerResult.error.message}`,
          );
        }
      }
    } catch (error) {
      console.error(`Error processing maker ${maker.name}:`, error);
    }
  }

  console.log(
    `New works exploration completed! Processed ${totalNewWorksFound} works from ${curatedMakers.length} curated makers and ${popularMakers.length} popular makers.`,
  );
};

// N日前の日付を取得（YYYY-MM-DD形式）
function getDateDaysAgo(days: number): string {
  const date = new Date(getCurrentDate());
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0] as string;
}
