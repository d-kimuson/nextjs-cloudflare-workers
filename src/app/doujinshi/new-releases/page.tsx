import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorPage } from "../../../components/ErrorPage";
import { getDmmDailyRanking } from "../../../server/fetchers/dmm";
import { getAllGenresWithCounts } from "../../../server/fetchers/genres";
import { getRecentWorksByTopMakers } from "../../../server/fetchers/works";
import { NewReleases } from "./NewReleases";

export default async function NewReleasesPage() {
  try {
    const [works, genres, dailyRanking] = await Promise.all([
      getRecentWorksByTopMakers({ limit: 20, daysAgo: 7 }),
      getAllGenresWithCounts(6, 0),
      getDmmDailyRanking(),
    ]);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* メインコンテンツ */}
            <NewReleases works={works} loading={false} />

            {/* サイドバー */}
            <Sidebar genres={genres} dailyRanking={dailyRanking} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch new releases:", error);
    return <ErrorPage statusCode={500} title="新着作品の取得に失敗しました" />;
  }
}
