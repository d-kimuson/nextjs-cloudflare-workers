"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cookie } from "lucide-react";
import { useSession } from "@/lib/session/useSession";

interface CookieConsentProps {
  onConsent?: () => void;
  show?: boolean;
  onShow?: (show: boolean) => void;
}

export function CookieConsent({ onConsent, show, onShow }: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { agreeSession } = useSession();

  useEffect(() => {
    // 手動表示の場合は show prop を優先
    if (show !== undefined) {
      setIsOpen(show);
      return;
    }

    // ページ読み込み時にセッション状態を確認（自動表示）
    const checkConsent = async () => {
      try {
        const response = await fetch("/api/session/check");
        const data = (await response.json()) as { consented: boolean };

        if (!data.consented) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("セッション状態の確認に失敗しました:", error);
        setIsOpen(true);
      }
    };

    checkConsent();
  }, [show]);

  const handleAccept = async () => {
    try {
      await agreeSession.mutateAsync();
      setIsOpen(false);
      onShow?.(false);
      onConsent?.();
    } catch (error) {
      console.error("Cookie許可の設定に失敗しました:", error);
    }
  };

  const handleDecline = () => {
    setIsOpen(false);
    onShow?.(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onShow?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-orange-500" />
            <DialogTitle className="text-lg">
              お気に入り機能について
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-sm leading-relaxed">
            お気に入り機能や個人向けレコメンドを利用するために、
            ブラウザに設定情報を保存させていただきます。
            個人を特定する情報は含まれません。
          </DialogDescription>

          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              disabled={agreeSession.isPending}
              className="flex-1"
            >
              {agreeSession.isPending ? "設定中..." : "利用する"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1"
            >
              今回は利用しない
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
