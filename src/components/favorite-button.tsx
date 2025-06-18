"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "./session-provider";
import type { SessionResult } from "@/lib/session";

interface FavoriteButtonProps {
  itemId: string;
  onToggle?: (itemId: string, isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteButton({
  itemId,
  onToggle,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const { favorites, addFavorite, removeFavorite } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isFavorite = favorites.includes(itemId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || isPending) return;

    const newIsFavorite = !isFavorite;

    startTransition(async () => {
      setIsLoading(true);

      try {
        let result: SessionResult;
        if (newIsFavorite) {
          result = await addFavorite(itemId);
        } else {
          result = await removeFavorite(itemId);
        }

        if (result?.success) {
          onToggle?.(itemId, newIsFavorite);
        } else if (result?.error?.includes("Session consent required")) {
          // Cookie許可バナーを表示するイベントを発火
          window.dispatchEvent(new CustomEvent("show-cookie-consent"));
        }
      } catch (error) {
        console.error("お気に入りの更新に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading || isPending}
      className={cn(
        sizeStyles[size],
        "rounded-full transition-all duration-200",
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-500",
        (isLoading || isPending) && "opacity-50",
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
  );
}
