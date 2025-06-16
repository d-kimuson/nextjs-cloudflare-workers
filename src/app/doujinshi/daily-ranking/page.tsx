import { dmmApiClient } from "@/lib/api/client";
import { ErrorPage } from "../../../components/ErrorPage";
import { DailyRanking } from "./DailyRanking";

export default async function DailyRankingPage() {
  const doujinList = await dmmApiClient.getDailyRankingDoujinList();

  if (doujinList.isErr()) {
    return (
      <ErrorPage
        statusCode={doujinList.error.status}
        title={doujinList.error.message}
      />
    );
  }

  return <DailyRanking doujinList={doujinList.value} />;
}
