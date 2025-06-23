import { uniqBy } from "es-toolkit";
import type { DB } from "../../server/db/client";
import { worksService } from "../../server/features/works/works.service";
import { dmmApiClient } from "../../server/lib/dmmApi/client";

export const exploreRanking = async (db: DB) => {
  console.log("Starting database seeding...");
  const workServiceClient = worksService(db);

  // 1. ランキングから40件の同人誌を取得
  console.log("Fetching ranking doujin list...");
  const rankingResult = await dmmApiClient.getRankingDoujinList({
    hits: 50, // fetch 上限が50
  });

  if (rankingResult.isErr()) {
    throw new Error(`Failed to fetch ranking: ${rankingResult.error.message}`);
  }

  const items = rankingResult.value;
  console.log(`Fetched ${items.length} items from ranking`);

  // 2. 各作品から作者・シリーズ・作品を作成
  for (const item of items) {
    await workServiceClient.registerWork(item);
  }

  const makers = uniqBy(
    items.flatMap((item) => item.iteminfo?.maker ?? []),
    (maker) => maker.id
  );

  console.log(
    "fetch items by ranking makers",
    makers.map((maker) => maker.name)
  );

  for (const maker of makers) {
    await workServiceClient.registerWorksFromMaker(maker);
  }

  console.log("Database seeding completed successfully!");
};
