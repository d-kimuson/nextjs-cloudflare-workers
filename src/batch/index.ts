import { getDb } from "../server/db/client";
import { calculateMakerScores } from "./commands/calculateMakerScores";
import { exploreRanking } from "./commands/exploreRanking";

const handler: ExportedHandler<{
  DB: D1Database;
}> = {
  async scheduled(event, env, ctx) {
    const db = getDb(env.DB);

    switch (event.cron) {
      case "0 */3 * * *": {
        await exploreRanking(db);
        break;
      }
      case "1 */3 * * *": {
        await calculateMakerScores(db);
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
