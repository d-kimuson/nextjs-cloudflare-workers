import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { pagesPath } from "../../../../lib/$path";
import { getDb } from "../../../../server/db/client";
import { makersRepository } from "../../../../server/repositories/makers.repository";

type MakerPageProps = {
  params: Promise<{
    makerId: string;
  }>;
};

export default async function MakerPage({ params }: MakerPageProps) {
  const { makerId } = await params;
  const db = getDb();
  const makersRepo = makersRepository(db);

  const maker = await makersRepo.findById(Number.parseInt(makerId, 10));

  if (!maker) {
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
        {/* 作者情報ヘッダー */}
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">{maker.name}</h1>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                作品数: {maker.works.length}作品
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 作品一覧 */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">作品一覧</h2>
          {maker.works.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {maker.works
                .map((workRelation) => workRelation.work)
                .filter(
                  (work): work is NonNullable<typeof work> => work != null,
                )
                .map((work) => (
                  <Link
                    key={work.id}
                    href={pagesPath.doujinshi.works._workId(work.id).$url()}
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
                  この作者の作品はまだありません。
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: MakerPageProps) {
  const { makerId } = await params;
  const db = getDb();
  const makersRepo = makersRepository(db);
  const maker = await makersRepo.findById(Number.parseInt(makerId, 10));

  if (!maker) {
    return {
      title: "作者が見つかりません",
    };
  }

  return {
    title: `${maker.name} - 作者ページ`,
    description: `${maker.name}の作品一覧ページ。${maker.works.length}作品を掲載中。`,
  };
}
