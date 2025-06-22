import { BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Badge } from "../../../../components/ui/badge";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { Separator } from "../../../../components/ui/separator";
import { SeriesPageClient } from "./SeriesPageClient";
import { honoClient } from "../../../../lib/api/client";

type SeriesPageProps = {
  params: Promise<{
    seriesId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export default async function SeriesPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const { seriesId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const seriesIdNumber = Number.parseInt(seriesId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(seriesIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/series/${seriesId}${queryString ? `?${queryString}` : ""}`
    );
  }

  const [series, works] = await Promise.all([
    honoClient.api.series[":seriesId"]
      .$get({
        param: { seriesId: seriesIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.series) : null
      ),
    honoClient.api.series[":seriesId"].works
      .$get({
        param: { seriesId: seriesIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.works) : []
      ),
  ]);

  if (!series) {
    notFound();
  }

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = [
    { label: "シリーズ一覧", href: "/doujinshi/series" },
    { label: series.name, current: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{series.name}</h1>
            <Badge variant="secondary" className="text-sm">
              {works?.length ?? 0}作品
            </Badge>
          </div>
          <p className="text-muted-foreground">
            「{series.name}」シリーズの作品一覧です。
          </p>
        </div>

        <Separator className="mb-8" />

        {/* 作品一覧 */}
        <SeriesPageClient
          works={works}
          pagination={{
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPreviousPage: false,
            totalItems: works?.length ?? 0,
            totalPages: 1,
          }}
          seriesId={seriesIdNumber}
          seriesName={series.name}
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
