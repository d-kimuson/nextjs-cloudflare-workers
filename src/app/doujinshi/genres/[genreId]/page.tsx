import { Tag } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Badge } from "../../../../components/ui/badge";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { Separator } from "../../../../components/ui/separator";
import { GenrePageClient } from "./GenrePageClient";
import { honoClient } from "../../../../lib/api/client";

type GenrePageProps = {
  params: Promise<{
    genreId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { genreId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const genreIdNumber = Number.parseInt(genreId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(genreIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/genres/${genreId}${queryString ? `?${queryString}` : ""}`
    );
  }

  const [genre, worksResponse] = await Promise.all([
    honoClient.api.genres[":genreId"]
      .$get({
        param: { genreId: genreIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.genre) : null
      ),
    honoClient.api.genres[":genreId"].works
      .$get({
        param: { genreId: genreIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body) : null
      ),
  ]);

  if (!genre) {
    notFound();
  }

  const works = worksResponse?.works ?? [];
  const pagination = worksResponse?.pagination ?? {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0,
  };

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = [
    { label: "ジャンル一覧", href: "/doujinshi/genres" },
    { label: genre.name, current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{genre.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {pagination.totalItems}件の作品
            </Badge>
          </div>
          <p className="text-muted-foreground">
            「{genre.name}」ジャンルの作品一覧です。
          </p>
        </div>

        <Separator className="mb-8" />

        {/* 作品一覧 */}
        <GenrePageClient
          works={works}
          genreId={genreIdNumber}
          genreName={genre.name}
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
