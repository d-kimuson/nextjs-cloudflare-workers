import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { getDb } from "../../../../server/db/client";
import { seriesRepository } from "../../../../server/repositories/series.repository";

type SeriesPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesId } = await params;
  const db = getDb();
  const seriesRepo = seriesRepository(db);

  const series = await seriesRepo.findByIdWithWorks(
    Number.parseInt(seriesId, 10)
  );

  if (!series) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

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
        <div>
          <h2 className="text-2xl font-semibold mb-6">作品一覧</h2>
          {series.works.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {series.works
                .map((workRelation) => workRelation.work)
                .filter(
                  (work): work is NonNullable<typeof work> => work != null
                )
                .map((work) => (
                  <Link
                    key={work.id}
                    href={`/doujinshi/works/${work.id}`}
                    className="group"
                  >
                    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img
                          src={work.largeImageUrl}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                          {work.title}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-xl font-bold text-red-600">
                            {formatPrice(work.price)}
                          </p>
                          {work.listPrice !== work.price && (
                            <p className="text-sm text-gray-500 line-through">
                              定価: {formatPrice(work.listPrice)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            発売日: {formatDate(work.releaseDate)}
                          </p>
                          {work.volume && (
                            <p className="text-sm text-gray-500">
                              {work.volume}ページ
                            </p>
                          )}
                          {work.reviewCount && work.reviewAverageScore && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm">
                                {work.reviewAverageScore.toFixed(1)} (
                                {work.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  このシリーズの作品はまだありません。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SeriesPageProps) {
  const { seriesId } = await params;
  const db = getDb();
  const seriesRepo = seriesRepository(db);
  const series = await seriesRepo.findById(Number.parseInt(seriesId, 10));

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
