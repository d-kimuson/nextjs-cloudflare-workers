import { notFound, redirect } from "next/navigation";
import { Badge } from "../../../../components/ui/badge";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { MakerPageClient } from "./MakerPageClient";
import { honoClient } from "../../../../lib/api/client";

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

  const [maker, worksResponse] = await Promise.all([
    honoClient.api.makers[":makerId"]
      .$get({
        param: { makerId: makerIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body.maker) : null,
      ),
    honoClient.api.makers[":makerId"].works
      .$get({
        param: { makerId: makerIdNumber.toString() },
      })
      .then(async (res) =>
        res.ok ? await res.json().then((body) => body) : null,
      ),
  ]);

  if (!maker || !worksResponse) {
    notFound();
  }

  const works = worksResponse.works;
  const pagination = worksResponse.pagination;

  // パンくずナビゲーション用のアイテム
  const breadcrumbItems = [
    { label: "作者一覧", href: "/doujinshi/makers" },
    { label: maker.name, current: true },
  ];

  return (
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
                  {pagination.totalItems}作品
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-500">{maker.works.length}作品</p>
              </div>
            </CardContent>
          </Card>

          {/* 作品一覧 */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">作品一覧</h2>
            <MakerPageClient
              works={works}
              pagination={{
                ...pagination,
              }}
              makerId={makerIdNumber}
              makerName={maker.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
