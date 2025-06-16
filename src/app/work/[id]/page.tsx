import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDb } from "@/db/client";
import {
  authorsTable,
  previewImagesTable,
  seriesTable,
  worksTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface WorkPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { id } = await params;
  const db = getDb();

  // 作品情報を取得
  const workResult = await db
    .select({
      work: worksTable,
      author: authorsTable,
      series: seriesTable,
    })
    .from(worksTable)
    .leftJoin(authorsTable, eq(worksTable.authorId, authorsTable.id))
    .leftJoin(seriesTable, eq(worksTable.seriesId, seriesTable.id))
    .where(eq(worksTable.id, id))
    .limit(1);

  if (workResult.length === 0) {
    notFound();
  }

  const { work, author, series } = workResult[0];

  // 試し読み画像を取得
  const previewImages = await db
    .select()
    .from(previewImagesTable)
    .where(eq(previewImagesTable.workId, id))
    .orderBy(previewImagesTable.order);

  // シリーズ作品を取得（自分以外）
  const seriesWorks = series
    ? await db
        .select({
          id: worksTable.id,
          title: worksTable.title,
          thumbnailUrl: worksTable.thumbnailUrl,
          price: worksTable.price,
          releaseDate: worksTable.releaseDate,
          isFree: worksTable.isFree,
        })
        .from(worksTable)
        .where(eq(worksTable.seriesId, series.id))
        .orderBy(worksTable.releaseDate)
    : [];

  const otherWorksInSeries = seriesWorks.filter((w) => w.id !== id);

  // タグを解析
  const tags = work.tags ? JSON.parse(work.tags) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* パンくずナビ */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                ホーム
              </Link>
            </li>
            <li>/</li>
            {author && (
              <>
                <li>
                  <Link
                    href={`/author/${author.id}`}
                    className="hover:text-foreground"
                  >
                    {author.name}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-foreground line-clamp-1">{work.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 作品詳細 */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-6">
                  {work.thumbnailUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={work.thumbnailUrl}
                        alt={work.title}
                        width={200}
                        height={280}
                        className="rounded-lg w-full md:w-auto"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="mb-4">
                      {work.isFree === 1 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 mb-2"
                        >
                          無料
                        </Badge>
                      )}
                      {series && (
                        <Badge variant="outline" className="mb-2 ml-2">
                          {series.name}
                        </Badge>
                      )}
                      {work.genre && (
                        <Badge variant="secondary" className="mb-2 ml-2">
                          {work.genre}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">
                      (同人誌) [{author?.name || "不明"}] {work.title}
                    </CardTitle>
                    <div className="mb-4">
                      {author && (
                        <Link
                          href={`/author/${author.id}`}
                          className="text-primary hover:underline"
                        >
                          作者: {author.name}
                        </Link>
                      )}
                      {work.releaseDate && (
                        <div className="text-sm text-muted-foreground mt-2">
                          発売日:{" "}
                          {new Date(work.releaseDate).toLocaleDateString(
                            "ja-JP",
                          )}
                        </div>
                      )}
                    </div>
                    {work.description && (
                      <CardDescription className="text-base mb-4">
                        {work.description}
                      </CardDescription>
                    )}

                    {/* タグ */}
                    {tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 価格と購入ボタン */}
                    <div className="flex items-center gap-4">
                      {work.price && (
                        <span className="text-2xl font-bold text-primary">
                          ¥{work.price.toLocaleString()}
                        </span>
                      )}
                      <Button size="lg" asChild>
                        <a
                          href={work.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          購入する
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* 試し読み */}
            {previewImages.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>試し読み</CardTitle>
                  <CardDescription>
                    作品の一部を無料でご覧いただけます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewImages.slice(0, 6).map((image) => (
                      <div key={image.id} className="relative">
                        <Image
                          src={image.imageUrl}
                          alt={`試し読み ${image.order}ページ目`}
                          width={300}
                          height={400}
                          className="w-full rounded-lg border"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {image.order}ページ目
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  {previewImages.length > 6 && (
                    <div className="text-center mt-4">
                      <p className="text-muted-foreground text-sm">
                        他 {previewImages.length - 6} ページの試し読みがあります
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* シリーズ作品 */}
            {otherWorksInSeries.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>シリーズ作品</CardTitle>
                  <CardDescription>
                    「{series?.name}」シリーズの他の作品
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {otherWorksInSeries.slice(0, 5).map((seriesWork) => (
                      <Link
                        key={seriesWork.id}
                        href={`/work/${seriesWork.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                          {seriesWork.thumbnailUrl ? (
                            <Image
                              src={seriesWork.thumbnailUrl}
                              alt={seriesWork.title}
                              width={60}
                              height={80}
                              className="rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-15 h-20 bg-muted rounded flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                              {seriesWork.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs text-muted-foreground">
                                {seriesWork.releaseDate &&
                                  new Date(
                                    seriesWork.releaseDate,
                                  ).toLocaleDateString("ja-JP")}
                              </div>
                              {seriesWork.price && (
                                <div className="text-xs font-medium">
                                  ¥{seriesWork.price.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {otherWorksInSeries.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/series/${series?.id}`}>
                          シリーズ一覧を見る
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 作者の他の作品 */}
            {author && (
              <Card>
                <CardHeader>
                  <CardTitle>作者の他の作品</CardTitle>
                  <CardDescription>{author.name}さんの作品一覧</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/author/${author.id}`}>作者ページを見る</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
