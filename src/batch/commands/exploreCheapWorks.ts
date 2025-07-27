import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../../server/db/client";
import { worksService } from "../../server/features/works/works.service";
import { dmmApiClient } from "../../server/lib/dmmApi/client";
import type { ItemItem } from "../../server/lib/dmmApi/dmmApi.generated";

const MAX_PRICE = 300; // 300円以下
const MIN_REVIEW_COUNT = 5; // 最低レビュー数（人気の指標）
const HITS_PER_BATCH = 100; // 1回のAPIコールで取得する件数

export const exploreCheapWorks = async (db: DB) => {
  console.log("Starting cheap works exploration...");
  const workServiceClient = worksService(db);

  // 1. 人気順でランクの高い作品を取得（ここから安い作品をフィルタリング）
  console.log("Fetching popular doujin list...");
  const popularResult = await dmmApiClient.getItemList({
    site: "FANZA",
    service: "digital",
    floor: "doujin",
    hits: HITS_PER_BATCH,
    sort: "rank", // 人気順
    gte_date: getSevenDaysAgo(), // 過去7日間の人気作品
  });

  if (popularResult.isErr()) {
    throw new Error(
      `Failed to fetch popular works: ${popularResult.error.message}`,
    );
  }

  const items = popularResult.value;
  console.log(`Fetched ${items.length} items from popular list`);

  // 2. 300円以下かつ人気のあるもの（レビュー数が一定以上）をフィルタリング
  const cheapAndPopularItems = items.filter((item: ItemItem) => {
    const price = item.prices?.price;
    const reviewCount = item.review?.count;

    return (
      price !== undefined &&
      Number.parseInt(price, 10) <= MAX_PRICE &&
      reviewCount !== undefined &&
      reviewCount >= MIN_REVIEW_COUNT
    );
  });

  console.log(
    `Found ${cheapAndPopularItems.length} cheap and popular works (≤${MAX_PRICE}円, ≥${MIN_REVIEW_COUNT} reviews)`,
  );

  // 3. フィルタリングされた作品をデータベースに登録
  for (const item of cheapAndPopularItems) {
    await workServiceClient.registerWork(item);
  }

  // 4. さらに人気の低価格作品を探すため、最新順でも検索
  console.log("Fetching recent doujin list for additional cheap works...");
  const recentResult = await dmmApiClient.getItemList({
    site: "FANZA",
    service: "digital",
    floor: "doujin",
    hits: HITS_PER_BATCH,
    sort: "date", // 新着順
    gte_date: getThreeDaysAgo(), // 過去3日間の新着
  });

  if (recentResult.isErr()) {
    console.warn(`Failed to fetch recent works: ${recentResult.error.message}`);
  } else {
    const recentItems = recentResult.value;
    console.log(`Fetched ${recentItems.length} items from recent list`);

    // 5. 新着からも安い作品をフィルタリング（レビュー条件は緩和）
    const cheapRecentItems = recentItems.filter((item: ItemItem) => {
      const price = item.prices?.price;
      return price !== undefined && Number.parseInt(price, 10) <= MAX_PRICE;
    });

    console.log(
      `Found ${cheapRecentItems.length} cheap recent works (≤${MAX_PRICE}円)`,
    );

    for (const item of cheapRecentItems) {
      await workServiceClient.registerWork(item);
    }
  }

  console.log("Cheap works exploration completed successfully!");
};

// 7日前の日付を取得（YYYY-MM-DD形式）
function getSevenDaysAgo(): string {
  const date = new Date(getCurrentDate());
  date.setDate(date.getDate() - 7);
  return date.toISOString().split("T")[0] as string;
}

// 3日前の日付を取得（YYYY-MM-DD形式）
function getThreeDaysAgo(): string {
  const date = new Date(getCurrentDate());
  date.setDate(date.getDate() - 3);
  return date.toISOString().split("T")[0] as string;
}
