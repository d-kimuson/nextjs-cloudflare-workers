"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { type FC, useCallback } from "react";
import { pagesPath } from "../lib/$path";

type ErrorPageProps = {
  statusCode: number;
  title?: string;
  message?: string;
  showRefresh?: boolean;
  showHome?: boolean;
  onRefresh?: () => void;
};

export const ErrorPage: FC<ErrorPageProps> = ({
  statusCode = 500,
  title = "エラーが発生しました",
  message = "申し訳ありませんが、問題が発生しました。",
  showRefresh = true,
  showHome = true,
  onRefresh,
}) => {
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  }, [onRefresh]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {statusCode && (
              <span className="text-red-600 mr-2">{statusCode}</span>
            )}
            {title}
          </CardTitle>
          <CardDescription className="text-gray-600">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            {showRefresh && (
              <Button
                onClick={handleRefresh}
                variant="default"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                ページを再読み込み
              </Button>
            )}
            {showHome && (
              <Button asChild variant="outline" className="w-full">
                <Link href={pagesPath.$url()}>
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
