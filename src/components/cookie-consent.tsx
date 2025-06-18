"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setConsentAction } from "@/lib/actions";
import { X, Cookie } from "lucide-react";

interface CookieConsentProps {
  onConsent?: () => void;
}

export function CookieConsent({ onConsent }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ページ読み込み時にセッション状態を確認
    const checkConsent = async () => {
      try {
        const response = await fetch("/api/session/check");
        const data = (await response.json()) as { consented: boolean };

        if (!data.consented) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("セッション状態の確認に失敗しました:", error);
        setIsVisible(true);
      }
    };

    checkConsent();
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const result = await setConsentAction();
      if (result.success) {
        setIsVisible(false);
        onConsent?.();
      } else {
        console.error("Cookie許可の設定に失敗しました:", result.error);
      }
    } catch (error) {
      console.error("Cookie許可の設定に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">お気に入り機能について</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            お気に入り機能や個人向けレコメンドを利用するために、
            ブラウザに設定情報を保存させていただきます。
            個人を特定する情報は含まれません。
          </CardDescription>

          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "設定中..." : "利用する"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1"
            >
              今回は利用しない
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
