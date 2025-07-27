import type { DB } from "../../server/db/client";
import { curatedMakersRepository } from "../../server/features/curatedMakers/curatedMakers.repository";

// 目利き作者の初期データ
const INITIAL_CURATED_MAKERS = [
  {
    name: "にゅう工房",
    priority: 100,
    description: "高品質な作品で人気の作者",
  },
  { name: "スルメニウム", priority: 90, description: "独特な作風で注目の作者" },
  { name: "ie研究室", priority: 80, description: "実験的な作品を手掛ける作者" },
  {
    name: "ひまわりのたね",
    priority: 70,
    description: "温かみのある作品が特徴的な作者",
  },
  {
    name: "ひよりハムスター",
    priority: 60,
    description: "可愛らしいキャラクターが魅力の作者",
  },
  {
    name: "サークルみづさね",
    priority: 60,
  },
  {
    name: "ゐちぼっち",
    priority: 60,
  },
  {
    name: "赤本アカモト",
    priority: 60,
  },
  {
    name: "五味滓太郎",
    priority: 60,
  },
  {
    name: "ひまわりのたね",
    priority: 60,
  },
  {
    name: "かみか堂",
    priority: 60,
  },
  {
    name: "クラムボン",
    priority: 60,
  },
  {
    name: "もすきーと音。",
    priority: 60,
  },
  {
    name: "もすきーと音",
    priority: 60,
  },
  {
    name: "K-てん",
    priority: 60,
  },
  {
    name: "どじろーブックス",
    priority: 60,
  },
  {
    name: "STUDIOふあん",
    priority: 60,
  },
  {
    name: "リンゴヤ",
    priority: 60,
  },
  {
    name: "リンゴヤ",
    priority: 60,
  },
  {
    name: "三崎",
    priority: 60,
  },
  {
    name: "三崎",
    priority: 60,
  },
  {
    name: "ハイエロ",
    priority: 60,
  },
  {
    name: "ひとのふんどし",
    priority: 60,
  },
  {
    name: "Digital Lover",
    priority: 60,
  },
  {
    name: "チンジャオ娘",
    priority: 60,
  },
  {
    name: "エアリーソックス",
    priority: 50,
  },
];

export const seedCuratedMakers = async (db: DB) => {
  console.log("Starting curated makers seeding...");
  const curatedMakersRepositoryClient = curatedMakersRepository(db);

  let addedCount = 0;
  let skippedCount = 0;

  for (const makerData of INITIAL_CURATED_MAKERS) {
    try {
      console.log(`Processing maker: ${makerData.name}`);

      // 既に目利き作者として登録されているかチェック
      const existingCuratedMaker =
        await curatedMakersRepositoryClient.findActive();
      const isAlreadyCurated = existingCuratedMaker.some(
        (cm) => cm.maker.name === makerData.name,
      );

      if (isAlreadyCurated) {
        console.log(`Maker ${makerData.name} is already curated, skipping...`);
        skippedCount++;
        continue;
      }

      // 目利き作者として追加
      const maker = await curatedMakersRepositoryClient.createByMakerName(
        makerData.name,
        {
          priority: makerData.priority,
          description: makerData.description,
          isActive: true,
        },
      );

      console.log(
        `Added curated maker: ${maker.name} (ID: ${maker.id}) with priority ${makerData.priority}`,
      );
      addedCount++;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Maker not found")) {
        console.warn(
          `Maker "${makerData.name}" not found in database. This maker will be added when their works are discovered.`,
        );
      } else {
        console.error(`Error processing maker ${makerData.name}:`, error);
      }
      skippedCount++;
    }
  }

  console.log(
    `Curated makers seeding completed! Added: ${addedCount}, Skipped: ${skippedCount}`,
  );
};
