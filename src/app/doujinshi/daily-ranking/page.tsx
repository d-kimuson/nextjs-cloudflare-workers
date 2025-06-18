import { dmmApiClient } from "@/lib/api/client";
import { ErrorPage } from "../../../components/ErrorPage";
import { Sidebar } from "@/components/layout/Sidebar";
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* メインコンテンツ */}
          <DailyRanking doujinList={doujinList.value} />

          {/* サイドバー */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
