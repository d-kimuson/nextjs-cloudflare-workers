import { BarChart3, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface MakerStatsProps {
  totalWorks: number;
  averageRating: number;
  totalReviews: number;
}

export function MakerStats({
  totalWorks,
  averageRating,
  totalReviews,
}: MakerStatsProps) {
  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : "未評価";
  };

  const stats = [
    {
      title: "総作品数",
      value: `${totalWorks}作品`,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "平均評価",
      value: formatRating(averageRating),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "総レビュー数",
      value: `${totalReviews}件`,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
