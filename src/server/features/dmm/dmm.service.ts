import { dmmApiClient } from "../../lib/dmmApi/client";
import { ResultAsync } from "neverthrow";
import { processAffiliateUrl } from "../works/works.transform";

export const dmmService = () => {
  const getDmmDailyRanking = ResultAsync.fromThrowable(async () => {
    try {
      const result = await dmmApiClient.getDailyRankingDoujinList();

      if (result.isErr()) {
        console.error("DMM API error:", result.error);
        return [];
      }

      return result.value.map((item) => ({
        ...item,
        affiliateURL: processAffiliateUrl(item.affiliateURL),
      }));
    } catch (error) {
      console.error("Unexpected error:", error);
      return [];
    }
  });

  const getDmmRanking = ResultAsync.fromThrowable(async (hits = 20) => {
    try {
      const result = await dmmApiClient.getRankingDoujinList({ hits });

      if (result.isErr()) {
        console.error("DMM API error:", result.error);
        return [];
      }

      return result.value.map((item) => ({
        ...item,
        affiliateURL: processAffiliateUrl(item.affiliateURL),
      }));
    } catch (error) {
      console.error("Unexpected error:", error);
      return [];
    }
  });

  return {
    getDmmDailyRanking,
    getDmmRanking,
  };
};
