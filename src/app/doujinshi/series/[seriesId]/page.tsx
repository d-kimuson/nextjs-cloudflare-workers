import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { WorksList } from "../../../../components/works/WorksList";
import {
  getSeriesBasicById,
  getSeriesById,
} from "../../../../server/fetchers/series";

type SeriesPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesId } = await params;

  const series = await getSeriesById(Number.parseInt(seriesId, 10));

  if (!series) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* シリーズ情報ヘッダー */}
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">{series.name}</h1>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                作品数: {series.works.length}作品
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 作品一覧 */}
        <WorksList
          works={series.works}
          layout="grid"
          emptyMessage="このシリーズの作品はまだありません。"
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SeriesPageProps) {
  const { seriesId } = await params;

  const series = await getSeriesBasicById(Number.parseInt(seriesId, 10));

  if (!series) {
    return {
      title: "シリーズが見つかりません",
    };
  }

  return {
    title: `${series.name} - シリーズページ`,
    description: `${series.name}の作品一覧ページ。シリーズ作品を掲載中。`,
  };
}
