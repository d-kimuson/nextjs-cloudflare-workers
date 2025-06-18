import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { WorksList } from "../../../../components/works/WorksList";
import { getMakerById } from "../../../../server/fetchers/makers";

type MakerPageProps = {
  params: Promise<{
    makerId: string;
  }>;
};

export default async function MakerPage({ params }: MakerPageProps) {
  const { makerId } = await params;

  const maker = await getMakerById(Number.parseInt(makerId, 10));

  if (!maker) {
    notFound();
  }

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
          <WorksList
            works={maker.works}
            layout="grid"
            emptyMessage="この作者の作品はまだありません。"
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: MakerPageProps) {
  const { makerId } = await params;

  const maker = await getMakerById(Number.parseInt(makerId, 10));

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
