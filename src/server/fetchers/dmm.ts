"use server";

import { cache } from "react";
import { dmmApiClient } from "../lib/dmmApi/client";

// DMM デイリーランキングを取得するServer Action
export const getDmmDailyRanking = cache(async () => {
  try {
    const result = await dmmApiClient.getDailyRankingDoujinList();

    if (result.isErr()) {
      console.error("DMM API error:", result.error);
      return [];
    }

    return result.value;
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
});

// DMM ランキングを取得するServer Action
export const getDmmRanking = cache(async (hits = 20) => {
  try {
    const result = await dmmApiClient.getRankingDoujinList({ hits });

    if (result.isErr()) {
      console.error("DMM API error:", result.error);
      return [];
    }

    return result.value;
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
});
