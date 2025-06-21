import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ImageIcon, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Work {
  id: string;
  title: string;
  maker: string;
  price: string;
  thumbnail?: string;
  description: string;
  tags: string[];
  releaseDate: string;
  rating: number;
}

interface WorkCardProps {
  work: Work;
  layout?: "horizontal" | "vertical";
}

function WorkThumbnail({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center ${className}`}
      >
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium">画像なし</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center animate-pulse">
          <div className="flex flex-col items-center space-y-2 text-muted-foreground">
            <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
            <span className="text-xs">読み込み中...</span>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="object-cover transition-opacity duration-300"
        style={{ opacity: imageLoading ? 0 : 1 }}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

export function WorkCard({ work, layout = "horizontal" }: WorkCardProps) {
  if (layout === "vertical") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* サムネイル */}
          <WorkThumbnail
            src={work.thumbnail}
            alt={`${work.title}のサムネイル`}
            className="w-full h-32 rounded-lg"
          />

          {/* タイトル */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            <Link
              href={`/doujinshi/works/${work.id}`}
              className="hover:text-primary transition-colors"
            >
              {work.title}
            </Link>
          </h3>

          {/* 作者と評価 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{work.maker}</span>
            <div className="flex items-center space-x-1 shrink-0">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{work.rating}</span>
            </div>
          </div>

          {/* タグ */}
          <div className="flex flex-wrap gap-1">
            {work.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 価格と購入ボタン */}
          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline" className="font-semibold text-xs">
              {work.price}
            </Badge>
            <Button size="sm" className="text-xs px-2 py-1">
              購入
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* サムネイル */}
          <WorkThumbnail
            src={work.thumbnail}
            alt={`${work.title}のサムネイル`}
            className="w-32 h-24 rounded-lg shrink-0"
          />

          {/* 作品情報 */}
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                <Link
                  href={`/doujinshi/works/${work.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {work.title}
                </Link>
              </h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{work.maker}</span>
                <span>{work.releaseDate}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{work.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {work.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {work.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="font-semibold">
                  {work.price}
                </Badge>
                <Button size="sm" className="flex items-center space-x-1">
                  <ExternalLink className="h-4 w-4" />
                  <span>購入</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
