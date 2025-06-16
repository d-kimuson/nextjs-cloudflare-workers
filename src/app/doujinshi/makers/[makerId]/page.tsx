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
import { seriesTable, worksTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AuthorPageProps {
  params: Promise<{ id: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;
  const db = getDb();

  // 作者情報を取得
  const author = await db
    .select()
    .from(authorsTable)
    .where(eq(authorsTable.id, id))
    .limit(1);

  if (author.length === 0) {
    notFound();
  }

  const authorInfo = author[0];

  // 作者の作品一覧を取得
  const works = await db
    .select({
      id: worksTable.id,
      title: worksTable.title,
      description: worksTable.description,
      thumbnailUrl: worksTable.thumbnailUrl,
      price: worksTable.price,
      releaseDate: worksTable.releaseDate,
      isFree: worksTable.isFree,
      affiliateUrl: worksTable.affiliateUrl,
      seriesName: seriesTable.name,
    })
    .from(worksTable)
    .leftJoin(seriesTable, eq(worksTable.seriesId, seriesTable.id))
    .where(eq(worksTable.authorId, id))
    .orderBy(worksTable.releaseDate);

  // 型安全な作品データ
  type WorkItem = (typeof works)[0];

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
            <li>
              <Link href="/authors" className="hover:text-foreground">
                作者一覧
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground">{authorInfo.name}</li>
          </ol>
        </nav>

        {/* 作者情報 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                {authorInfo.avatarUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={authorInfo.avatarUrl}
                      alt={authorInfo.name}
                      width={120}
                      height={120}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">
                    {authorInfo.name}
                  </CardTitle>
                  {authorInfo.description && (
                    <CardDescription className="text-base">
                      {authorInfo.description}
                    </CardDescription>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Badge variant="secondary">作品 {works.length}件</Badge>
                    {authorInfo.externalUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={authorInfo.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          公式サイト
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* 作品一覧 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">作品一覧</h2>
          {works.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  まだ作品が登録されていません。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work: WorkItem) => (
                <Card
                  key={work.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="p-0">
                    <Link href={`/work/${work.id}`}>
                      {work.thumbnailUrl ? (
                        <Image
                          src={work.thumbnailUrl}
                          alt={work.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                          <span className="text-muted-foreground">
                            画像なし
                          </span>
                        </div>
                      )}
                    </Link>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      {work.isFree === 1 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 mb-2"
                        >
                          無料
                        </Badge>
                      )}
                      {work.seriesName && (
                        <Badge variant="outline" className="mb-2">
                          {work.seriesName}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      <Link
                        href={`/work/${work.id}`}
                        className="hover:text-primary"
                      >
                        (同人誌) [{authorInfo.name}] {work.title}
                      </Link>
                    </CardTitle>
                    {work.description && (
                      <CardDescription className="line-clamp-3 mb-3">
                        {work.description}
                      </CardDescription>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {work.releaseDate &&
                          new Date(work.releaseDate).toLocaleDateString(
                            "ja-JP",
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        {work.price && (
                          <span className="font-semibold text-lg">
                            ¥{work.price.toLocaleString()}
                          </span>
                        )}
                        <Button size="sm" asChild>
                          <a
                            href={work.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            購入
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
