"use client";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Star, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import { WorksList } from "../../../components/works/WorksList";
import type { WorkItemDetail } from "../../../server/features/works/works.model";

type Props = {
  works: WorkItemDetail[];
  loading: boolean;
};

export const NewReleases: React.FC<Props> = ({ works, loading }) => {
  const breadcrumbItems = [{ label: "人気作者の新作", current: true }];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      <header className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-6 w-6 text-purple-500" />
          <h1 className="text-3xl font-bold text-foreground">人気作者の新作</h1>
        </div>
        <p className="text-muted-foreground">
          スコアの高い作者の最新作品（1週間以内）をご紹介
        </p>
      </header>

      {!loading && works.length > 0 ? (
        <WorksList works={works} layout="grid" />
      ) : loading ? (
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            データを読み込み中...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }, (_, i) => (
              <Card
                key={`skeleton-card-${Date.now()}-${i}`}
                className="overflow-hidden"
              >
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto" />
          <h3 className="text-xl font-semibold">新作がありません</h3>
          <p className="text-muted-foreground">
            現在、人気作者の新作（1週間以内）はありません。
          </p>
        </div>
      )}
    </div>
  );
};
