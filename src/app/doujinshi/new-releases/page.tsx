import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorPage } from "../../../components/ErrorPage";
import { honoClient } from "../../../lib/api/client";
import { NewReleases } from "./NewReleases";

export const metadata = {
  title: "人気作者の新作 - 注目の同人誌・エロ漫画",
  description:
    "高評価を獲得している人気作者の新作同人誌・エロ漫画を毎日更新。質の高い最新作品を安全な正規サイトでダウンロード購入できます。",
  keywords: [
    "人気作者",
    "新作同人誌",
    "エロ漫画新作",
    "注目作品",
    "最新リリース",
    "正規購入",
    "安全ダウンロード",
    "高品質",
  ],
  openGraph: {
    title: "人気作者の新作 | おかずNavi",
    description: "高評価を獲得している人気作者の新作同人誌・エロ漫画を毎日更新",
    url: "https://okazu-navi.com/doujinshi/new-releases",
    images: [
      {
        url: "/og-new-releases.jpg",
        width: 1200,
        height: 630,
        alt: "人気作者の新作 - 注目の同人誌・エロ漫画",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "人気作者の新作 | おかずNavi",
    description: "人気作者の新作同人誌・エロ漫画を毎日更新",
    images: ["/og-new-releases.jpg"],
  },
  alternates: {
    canonical: "https://okazu-navi.com/doujinshi/new-releases",
  },
};

export default async function NewReleasesPage() {
  try {
    const [genres, dailyRanking, recentWorksByTopMakers] = await Promise.all([
      honoClient.api.genres
        .$get()
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.genres) : []
        ),
      honoClient.api.dmm["daily-ranking"]
        .$get()
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.dailyRanking) : []
        ),
      honoClient.api["recent-works-by-top-makers"]
        .$get()
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.works) : []
        ),
    ]);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* メインコンテンツ */}
            <NewReleases works={recentWorksByTopMakers} loading={false} />

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
