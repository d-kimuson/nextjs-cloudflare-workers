import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorPage } from "../../../components/ErrorPage";
import { honoClient } from "../../../lib/api/client";
import { DailyRanking } from "./DailyRanking";

// Enable ISR for daily ranking - revalidate every 30 minutes
export const revalidate = 1800;

export const metadata = {
  title: "今日のランキング - 同人誌・エロ漫画人気作品",
  description:
    "FANZA同人の今日のランキングを毎日更新。人気の同人誌・エロ漫画作品をリアルタイムでお届け。正規サイトで安全にダウンロード購入できます。",
  keywords: [
    "同人誌ランキング",
    "エロ漫画ランキング",
    "FANZA人気",
    "今日の人気作品",
    "デイリーランキング",
    "正規購入",
    "同人作品",
  ],
  openGraph: {
    title: "今日のランキング | おかずNavi",
    description:
      "FANZA同人の今日のランキングを毎日更新。人気作品をリアルタイムでお届け",
    url: "https://okazu-navi.com/doujinshi/daily-ranking",
    images: [
      {
        url: "/og-ranking.jpg",
        width: 1200,
        height: 630,
        alt: "今日のランキング - 同人誌・エロ漫画人気作品",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "今日のランキング | おかずNavi",
    description: "FANZA同人の今日のランキングを毎日更新",
    images: ["/og-ranking.jpg"],
  },
  alternates: {
    canonical: "https://okazu-navi.com/doujinshi/daily-ranking",
  },
};

export default async function DailyRankingPage() {
  try {
    const [doujinList, genres] = await Promise.all([
      honoClient.api.dmm["daily-ranking"]
        .$get()
        .then(async (res) =>
          res.ok ? await res.json().then((body) => body.dailyRanking) : [],
        ),
      honoClient.api.genres
        .$get()
        .then(async (res) =>
          res.ok
            ? await res.json().then((body) => body.genres.slice(0, 6))
            : [],
        ),
    ]);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* メインコンテンツ */}
            <DailyRanking doujinList={doujinList || []} />

            {/* サイドバー */}
            <Sidebar genres={genres} dailyRanking={doujinList} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch daily ranking:", error);
    return <ErrorPage statusCode={500} title="データの取得に失敗しました" />;
  }
}
