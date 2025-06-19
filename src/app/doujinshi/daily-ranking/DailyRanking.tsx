"use client";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FanzaWorksList } from "@/components/works/FanzaWorksList";
import type { ItemItem } from "@/server/lib/dmmApi/dmmApi.generated";
import { TrendingUp } from "lucide-react";

type Props = {
  doujinList: ItemItem[];
};

export const DailyRanking: React.FC<Props> = ({ doujinList }) => {
  const breadcrumbItems = [{ label: "新作ランキング", current: true }];

  return (
    <div className="flex-1">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      <header className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold text-foreground">新作ランキング</h1>
        </div>
        <p className="text-muted-foreground">
          24時間以内の人気同人作品をランキング形式でご紹介
        </p>
      </header>

      <FanzaWorksList
        works={doujinList}
        layout="grid"
        emptyMessage="データを読み込み中..."
        showRanking={true}
        showPagination={true}
      />
    </div>
  );
};
