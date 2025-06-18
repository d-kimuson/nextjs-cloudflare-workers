"use client";

import { type FC, useCallback, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "../lib/session/useSession";
import { CookieConsent } from "./cookie-consent";

interface FavoriteButtonProps {
  itemId: string;
  onToggle?: (itemId: string, isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  itemId,
  onToggle,
  size = "md",
  className,
}) => {
  const { updateSession, session } = useSession();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "remove" | null>(
    null
  );

  const isFavorite = useMemo(
    () => session.data?.favorite.works.includes(itemId) ?? false,
    [session.data, itemId]
  );

  const executeToggle = useCallback(
    (action: "add" | "remove") => {
      if (session.status === "loading" || !session.data) return;

      if (onToggle) {
        onToggle(itemId, action === "remove");
      }

      if (action === "remove") {
        // お気に入りから削除
        updateSession.mutate({
          favorite: {
            works: session.data.favorite.works.filter((id) => id !== itemId),
            makers: session.data.favorite.makers,
            series: session.data.favorite.series,
          },
        });
      } else {
        // お気に入りに追加
        updateSession.mutate({
          favorite: {
            works: [...session.data.favorite.works, itemId],
            makers: session.data.favorite.makers,
            series: session.data.favorite.series,
          },
        });
      }
    },
    [itemId, session, updateSession, onToggle]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (session.status === "loading") return;

      // 同意が必要な場合はモーダルを表示
      if (session.status === "not-agreed") {
        const action = isFavorite ? "remove" : "add";
        setPendingAction(action);
        setShowConsentModal(true);
        return;
      }

      // 同意済みの場合は直接実行
      const action = isFavorite ? "remove" : "add";
      executeToggle(action);
    },
    [isFavorite, session.status, executeToggle]
  );

  const handleConsentComplete = useCallback(() => {
    // 同意完了後、保留中のアクションを実行
    if (pendingAction) {
      executeToggle(pendingAction);
      setPendingAction(null);
    }
  }, [pendingAction, executeToggle]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={session.status === "loading"}
        className={cn(
          sizeStyles[size],
          "rounded-full transition-all duration-200",
          isFavorite
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-500",
          session.status === "loading" && "opacity-50",
          className
        )}
        aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <Heart
          className={cn(
            iconSizes[size],
            "transition-all duration-200",
            isFavorite ? "fill-current" : "fill-none"
          )}
        />
      </Button>

      <CookieConsent
        show={showConsentModal}
        onShow={setShowConsentModal}
        onConsent={handleConsentComplete}
      />
    </>
  );
};
