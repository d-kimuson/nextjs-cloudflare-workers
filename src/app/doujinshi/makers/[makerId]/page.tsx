import { notFound, redirect } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import {
  createBreadcrumbSchema,
  createWebPageSchema,
} from "../../../../lib/structured-data";
import { getMakerByIdBasic } from "../../../../server/fetchers/makers";
import { getWorksByMakerIdWithPagination } from "../../../../server/fetchers/works";
import { MakerPageClient } from "./MakerPageClient";

type MakerPageProps = {
  params: Promise<{
    makerId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
};

export default async function MakerPage({
  params,
  searchParams,
}: MakerPageProps) {
  const { makerId } = await params;
  const { page: pageParam, limit: limitParam } = await searchParams;

  const makerIdNumber = Number.parseInt(makerId, 10);
  const page = Number(pageParam) || 1;
  const limit = Number(limitParam) || 20;

  if (Number.isNaN(makerIdNumber)) {
    notFound();
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    const params = new URLSearchParams();
    if (limit >= 1 && limit <= 100) params.set("limit", limit.toString());
    const queryString = params.toString();
    redirect(
      `/doujinshi/makers/${makerId}${queryString ? `?${queryString}` : ""}`,
    );
  }

  const [maker, worksResult] = await Promise.all([
    getMakerByIdBasic(makerIdNumber),
    getWorksByMakerIdWithPagination(makerIdNumber, { page, limit }),
  ]);

  if (!maker) {
    notFound();
  }

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = [
    { label: "作者一覧", href: "/doujinshi/makers" },
    { label: maker.name, current: true },
  ];

  // Generate structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://okazu-navi.com";
  const pageUrl = `${baseUrl}/doujinshi/makers/${makerId}${
    page > 1 ? `?page=${page}` : ""
  }`;
  const breadcrumbSchema = createBreadcrumbSchema(breadcrumbItems);
  const webPageSchema = createWebPageSchema(
    `${maker.name} - 制作者詳細${page > 1 ? ` (${page}ページ目)` : ""}`,
    `${maker.name}の制作者詳細ページ。${worksResult.pagination.totalItems}作品を掲載中。`,
    pageUrl,
    {
      breadcrumb: breadcrumbSchema,
      datePublished: maker.createdAt || undefined,
    },
  );

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([webPageSchema], null, 2),
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <div className="space-y-8">
            {/* 作者情報ヘッダー */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold">{maker.name}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {worksResult.pagination.totalItems}作品
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maker.description && (
                    <p className="text-lg text-gray-600">{maker.description}</p>
                  )}
                  <p className="text-gray-500">
                    登録日:{" "}
                    {maker.createdAt
                      ? new Date(maker.createdAt).toLocaleDateString("ja-JP")
                      : "不明"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 作品一覧 */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">作品一覧</h2>
              <MakerPageClient
                works={worksResult.data}
                pagination={worksResult.pagination}
                makerId={makerIdNumber}
                makerName={maker.name}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: MakerPageProps) {
  const { makerId } = await params;
  const { page: pageParam } = await searchParams;
  const makerIdNumber = Number.parseInt(makerId, 10);
  const page = Number(pageParam) || 1;

  if (Number.isNaN(makerIdNumber)) {
    return {
      title: "制作者が見つかりません",
    };
  }

  const maker = await getMakerByIdBasic(makerIdNumber);

  if (!maker) {
    return {
      title: "制作者が見つかりません",
    };
  }

  const [, worksResult] = await Promise.all([
    getMakerByIdBasic(makerIdNumber),
    getWorksByMakerIdWithPagination(makerIdNumber, { page: 1, limit: 1 }),
  ]);

  const pageTitle = page > 1 ? ` - ${page}ページ目` : "";
  const pageUrl = `https://okazu-navi.com/doujinshi/makers/${makerId}${
    page > 1 ? `?page=${page}` : ""
  }`;
  const description = `${maker.name}の同人作品一覧ページ。${worksResult.pagination.totalItems}作品を掲載中。高品質な同人誌・エロ漫画を安全にダウンロード購入できる正規サイトへご案内します。`;

  const keywords = [
    maker.name,
    "制作者",
    "サークル",
    "同人誌",
    "作品一覧",
    "正規購入",
    "FANZA",
    "DLsite",
    "ダウンロード",
    "エロ漫画",
  ];

  return {
    title: `${maker.name}の同人作品${pageTitle}`,
    description:
      description.length > 160
        ? `${description.substring(0, 157)}...`
        : description,
    keywords: keywords,
    alternates: {
      canonical: pageUrl,
      ...(page > 1 && {
        prev:
          page > 2
            ? `https://okazu-navi.com/doujinshi/makers/${makerId}?page=${
                page - 1
              }`
            : `https://okazu-navi.com/doujinshi/makers/${makerId}`,
      }),
      ...(worksResult.pagination.hasNextPage && {
        next: `https://okazu-navi.com/doujinshi/makers/${makerId}?page=${
          page + 1
        }`,
      }),
    },
    openGraph: {
      type: "profile",
      title: `${maker.name}の同人作品${pageTitle}`,
      description: `${maker.name}の作品一覧。${worksResult.pagination.totalItems}作品を掲載中`,
      url: pageUrl,
    },
    twitter: {
      card: "summary",
      title: `${maker.name}の同人作品${pageTitle}`,
      description: `${worksResult.pagination.totalItems}作品を掲載中`,
    },
  };
}
