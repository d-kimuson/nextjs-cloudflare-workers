import { subHours } from "date-fns/subHours";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { envUtils } from "../../lib/envUtils";
import { getCurrentDate } from "../date/currentDate";
import { formatISOWithoutTZ } from "../date/formatISOWithoutTZ";
import { BaseError } from "../error/BaseError";
import { itemList } from "./dmmApi.generated";
import sites from "./sites.generated.json" with { type: "json" };

const authInfo = {
  affiliate_id: envUtils.getEnv("DMM_AFFILIATE_ID"),
  api_id: envUtils.getEnv("DMM_API_ID"),
} as const;

export const dmmApiClient = {
  getDailyRankingDoujinList: () =>
    ResultAsync.fromPromise(
      itemList({
        ...authInfo,
        site: "FANZA",
        service: sites["FANZA（アダルト）"].services.同人.code,
        floor: sites["FANZA（アダルト）"].services.同人.floors.同人.code,
        sort: "rank",
        output: "json",
        gte_date: formatISOWithoutTZ(subHours(getCurrentDate(), 24)),
      }),
      (error) => {
        console.error(error);
        return new BaseError("NETWORK_ERROR", "UNHANDLED");
      },
    ).andThen((result) => {
      if (result.status !== 200) {
        switch (result.status) {
          case 400:
            return errAsync(new BaseError("BAD_REQUEST", "BAD_REQUEST"));
          default:
            return errAsync(new BaseError("UNHANDLED", "UNHANDLED"));
        }
      }

      return okAsync(result.data.result.items);
    }),
};
