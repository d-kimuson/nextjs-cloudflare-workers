import { BarChart3, Calendar, Star } from "lucide-react";
import Link from "next/link";
import { pagesPath } from "../../lib/$path";
import { urlObjectToString } from "../../lib/path/urlObjectToString";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { WorkItem } from "../works/WorksList";

interface SeriesStatsProps {
  stats: {
    totalWorks: number;
    latestWork?: WorkItem;
    averageRating: number | null;
  };
}

export function SeriesStats({ stats }: SeriesStatsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 総作品数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総作品数</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalWorks}</div>
          <p className="text-xs text-muted-foreground">作品</p>
        </CardContent>
      </Card>

      {/* 最新作品 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">最新作品</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.latestWork ? (
            <div className="space-y-1">
              <Link
                href={urlObjectToString(
                  pagesPath.doujinshi.works._workId(stats.latestWork.id).$url(),
                )}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
              >
                {stats.latestWork.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(stats.latestWork.releaseDate)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">なし</p>
          )}
        </CardContent>
      </Card>

      {/* 平均評価 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">平均評価</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.averageRating ? (
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    className={`h-4 w-4 ${
                      i < Math.round(stats.averageRating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">評価なし</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
