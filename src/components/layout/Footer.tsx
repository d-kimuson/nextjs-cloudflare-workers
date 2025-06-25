import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サイト情報 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              おかずNavi Powered by{" "}
              <a href="https://affiliate.dmm.com/api/">FANZA Webサービス</a>
            </h3>
            <p className="text-sm text-muted-foreground">
              新作アダルト作品への発見体験を提供するナビゲーションサイトです。
            </p>
          </div>

          {/* ナビゲーション */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">ナビゲーション</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/doujinshi/daily-ranking"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ランキング
                </Link>
              </li>
              <li>
                <Link
                  href="/doujinshi/makers"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  人気作者ランキング！
                </Link>
              </li>
            </ul>
          </div>

          {/* 購入サイト */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">正規購入サイト</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.dmm.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FANZA
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* 免責事項 */}
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              ※当サイト掲載の画像やテキストは全て販売元の許可を得て引用・掲載しており、違法コンテンツや違法ダウンロードサイトへの誘導等はございません。
            </p>
            <p>
              ※Torrentや違法サイトでの作品ダウンロードは犯罪です。作品は必ず正規の方法で購入してお楽しみください。
            </p>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>&copy; 2024 おかずNavi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
