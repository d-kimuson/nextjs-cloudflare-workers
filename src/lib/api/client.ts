import { envUtils } from "../../lib/envUtils";
import { itemList } from "./dmmApi.generated";
import sites from "./sites.generated.json" with { type: "json" };

export const dmmApiClient = () => {
  const authInfo = {
    affiliate_id: envUtils.getEnv("DMM_AFFILIATE_ID"),
    api_id: envUtils.getEnv("DMM_API_ID"),
  } as const;

  return {
    getRankingDoujinList: async () => {
      const result = await itemList({
        ...authInfo,
        site: "FANZA",
        service: sites["FANZA（アダルト）"].services.同人.code,
        floor: sites["FANZA（アダルト）"].services.同人.floors.同人.code,
        sort: "rank",
        output: "json",
      });

      return result.data.result.items;
    },
  };
};
