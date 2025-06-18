import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import { drizzle } from "drizzle-orm/d1";
import { dmmApiClient } from "../src/lib/api/client";
import type { DB } from "../src/server/db/client";
import * as schema from "../src/server/db/schema";
import { getRequiredEnv } from "./utils/env";

async function main() {
  console.log("Starting database seeding...");

  const sqliteDb = await createSQLiteDB(getRequiredEnv("DATABASE_URL"));
  const database = new D1Database(new D1DatabaseAPI(sqliteDb));
  const db = drizzle(database, { schema }) as unknown as DB;

  try {
    // 1. ランキングから100件の同人誌を取得
    console.log("Fetching ranking doujin list...");
    const rankingResult = await dmmApiClient.getRankingDoujinList({
      hits: 1,
    });

    if (rankingResult.isErr()) {
      throw new Error(
        `Failed to fetch ranking: ${rankingResult.error.message}`
      );
    }

    console.log(JSON.stringify(rankingResult.value.at(0), null, 2));
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
