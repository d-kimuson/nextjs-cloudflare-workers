import { notFound } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { getGenreById } from "../../../../server/actions/genres";
import { getWorksByGenreId } from "../../../../server/actions/works";
import { WorksList } from "../../../../components/works/WorksList";
import type { WorkItem } from "../../../../components/works/WorksList";
import { Tag } from "lucide-react";

type GenrePageProps = {
  params: Promise<{
    genreId: string;
  }>;
};

export default async function GenrePage({ params }: GenrePageProps) {
  const { genreId } = await params;
  const genreIdNumber = Number.parseInt(genreId, 10);

  if (Number.isNaN(genreIdNumber)) {
    notFound();
  }

  const [genre, worksData] = await Promise.all([
    getGenreById(genreIdNumber),
    getWorksByGenreId(genreIdNumber, { limit: 20, offset: 0 }),
  ]);

  if (!genre) {
    notFound();
  }

  // WorkItem型に変換
  const works: WorkItem[] = worksData
    .map((item) => item.work)
    .filter((work): work is NonNullable<typeof work> => work !== null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{genre.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {works.length}件の作品
            </Badge>
          </div>
          <p className="text-muted-foreground">
            「{genre.name}」ジャンルの作品一覧です。
          </p>
        </div>

        <Separator className="mb-8" />

        {/* 作品一覧 */}
        <WorksList
          works={works}
          layout="grid"
          emptyMessage={`「${genre.name}」ジャンルの作品はまだ登録されていません。`}
          showPagination={true}
          currentGenreId={genreIdNumber}
        />

        {/* フッター注意書き */}
        <div className="mt-12 text-center">
          <Alert className="border-gray-200 bg-gray-50">
            <AlertDescription>
              ⚠️
              この作品の著作権は制作者に帰属します。正規の販売サイトからのみご購入ください。
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: GenrePageProps) {
  const { genreId } = await params;
  const genreIdNumber = Number.parseInt(genreId, 10);

  if (Number.isNaN(genreIdNumber)) {
    return {
      title: "ジャンルが見つかりません",
    };
  }

  const genre = await getGenreById(genreIdNumber);

  if (!genre) {
    return {
      title: "ジャンルが見つかりません",
    };
  }

  return {
    title: `【同人誌】${genre.name}ジャンルの作品一覧`,
    description: `${genre.name}ジャンルの同人作品を一覧で表示。人気作品から最新作品まで、安全な購入リンクと共にご紹介します。`,
    openGraph: {
      title: `【同人誌】${genre.name}ジャンル`,
      description: `${genre.name}ジャンルの同人作品一覧。安全な購入はこちらから。`,
    },
  };
}
