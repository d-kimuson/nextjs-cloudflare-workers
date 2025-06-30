import { subHours } from "date-fns/subHours";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { getCurrentDate } from "../../../lib/date/currentDate";
import { formatISOWithoutTZ } from "../../../lib/date/formatISOWithoutTZ";
import { envUtils } from "../../../lib/envUtils";
import { BaseError } from "../../../lib/error/BaseError";
import {
  type ItemListArticle,
  type ItemListParams,
  itemList,
} from "./dmmApi.generated";
import sites from "./sites.generated.json" with { type: "json" };

const authInfo = {
  affiliate_id: envUtils.getEnv("DMM_AFFILIATE_ID"),
  api_id: envUtils.getEnv("DMM_API_ID"),
} as const;

const buildSearchQuery = (
  filters: readonly {
    kind: ItemListArticle;
    id: number;
  }[],
): {
  [K in keyof ItemListParams as K extends `article${string}`
    ? K
    : never]: ItemListParams[K];
} => {
  const [first, ...others] = filters;
  if (first === undefined) {
    return {};
  }

  if (others.length === 0) {
    return {
      article: first.kind,
      article_id: first.id.toString(),
    };
  }

  return filters
    .map(
      ({ kind, id }, index) =>
        ({
          article: {
            key: `article[${index}]`,
            value: kind,
          },
          articleId: {
            key: `article_id[${index}]`,
            value: id.toString(),
          },
        }) as const,
    )
    .reduce((acc: Record<string, string>, { article, articleId }) => {
      acc[article.key] = article.value;
      acc[articleId.key] = articleId.value;
      return acc;
    }, {});
};

export const dmmApiClient = {
  getRankingDoujinList: (
    options?: Partial<{
      hits: number;
    }>,
  ) =>
    ResultAsync.fromPromise(
      itemList({
        ...authInfo,
        site: "FANZA",
        service: sites["FANZA（アダルト）"].services.同人.code,
        floor: sites["FANZA（アダルト）"].services.同人.floors.同人.code,
        sort: "rank",
        hits: options?.hits ?? 20,
        output: "json",
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

  getDailyRankingDoujinList: (
    options?: Partial<{
      hits: number;
    }>,
  ) =>
    ResultAsync.fromPromise(
      itemList({
        ...authInfo,
        site: "FANZA",
        service: sites["FANZA（アダルト）"].services.同人.code,
        floor: sites["FANZA（アダルト）"].services.同人.floors.同人.code,
        sort: "rank",
        output: "json",
        hits: options?.hits ?? 20,
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

  getItemListByMaker: (
    makerId: number,
    options?: Partial<{
      hits: number;
    }>,
  ) =>
    ResultAsync.fromPromise(
      itemList({
        ...authInfo,
        site: "FANZA",
        service: sites["FANZA（アダルト）"].services.同人.code,
        floor: sites["FANZA（アダルト）"].services.同人.floors.同人.code,
        sort: "date",
        hits: options?.hits ?? 20,
        ...buildSearchQuery([{ kind: "maker", id: makerId }]),
        output: "json",
      }),
      (error) => {
        console.error(error);
        return new BaseError("NETWORK_ERROR", "UNHANDLED");
      },
    ).andThen((result) => {
      if (result.status !== 200) {
        console.error("request parameters", result.data.request.parameters);
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
