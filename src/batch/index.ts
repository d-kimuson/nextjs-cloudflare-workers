import { getDb } from "../server/db/client";
import { calculateMakerScores } from "./commands/calculateMakerScores";
import { exploreCheapWorks } from "./commands/exploreCheapWorks";
import { exploreNewWorksByPopularMakers } from "./commands/exploreNewWorksByPopularMakers";
import { exploreRanking } from "./commands/exploreRanking";
import { seedCuratedMakers } from "./commands/seedCuratedMakers";

const handler: ExportedHandler<{
  DB: D1Database;
}> = {
  async scheduled(event, env, _ctx) {
    const db = getDb(env.DB);

    switch (event.cron) {
      case "0 */4 * * *": {
        await exploreRanking(db);
        break;
      }
      case "0 12 * * *": {
        // 毎日12時（正午）に安い作品を探索
        await exploreCheapWorks(db);
        break;
      }
      case "1 12 * * *": {
        await calculateMakerScores(db);
        break;
      }
      case "0 6 * * *": {
        // 毎日6時（早朝）に人気作者の新作を探索
        await seedCuratedMakers(db);
        await exploreNewWorksByPopularMakers(db);
        break;
      }
      default: {
        console.error(`Unknown cron event: ${event.cron}`);
        break;
      }
    }
  },
};

export default handler;
