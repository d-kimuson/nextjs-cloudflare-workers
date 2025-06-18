import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import { drizzle } from "drizzle-orm/d1";
import { uniqBy } from "es-toolkit";
import { dmmApiClient } from "../src/lib/dmmApi/client";
import type { DB } from "../src/server/db/client";
import * as schema from "../src/server/db/schema";
import { workService } from "../src/server/service/work";
import { getRequiredEnv } from "./utils/env";

async function main() {
  console.log("Starting database seeding...");

  const sqliteDb = await createSQLiteDB(getRequiredEnv("DATABASE_URL"));
  const database = new D1Database(new D1DatabaseAPI(sqliteDb));
  const db = drizzle(database, { schema }) as unknown as DB;

  const workServiceClient = workService(db);

  try {
    // 1. ランキングから100件の同人誌を取得
    console.log("Fetching ranking doujin list...");
    const rankingResult = await dmmApiClient.getRankingDoujinList({
      hits: 100,
    });

    if (rankingResult.isErr()) {
      throw new Error(
        `Failed to fetch ranking: ${rankingResult.error.message}`
      );
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
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  } finally {
    sqliteDb.close();
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
