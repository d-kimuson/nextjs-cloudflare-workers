"use client";

import { Heart, User } from "lucide-react";
import { useState } from "react";
import { CookieConsent } from "../../components/cookie-consent";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { WorksList } from "../../components/works/WorksList";
import { useFavoriteWorks, useSession } from "../../lib/session/useSession";

export default function MyPage() {
  const { session } = useSession();
  const favoriteWorks = useFavoriteWorks();
  const [showConsentModal, setShowConsentModal] = useState(false);

  // 同意が必要な場合の処理
  if (session.status === "not-agreed") {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-8">
              {/* ヘッダー */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-6 w-6" />
                    <span>マイページ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      お気に入り機能をご利用いただくには
                    </h3>
                    <p className="text-gray-600 mb-6">
                      作品をお気に入りに追加して、いつでも簡単にアクセスできるようになります。
                      <br />
                      ご利用にはクッキーの使用に同意していただく必要があります。
                    </p>
                    <Button
                      onClick={() => setShowConsentModal(true)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      同意してお気に入り機能を使う
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <CookieConsent
          show={showConsentModal}
          onShow={setShowConsentModal}
          onConsent={() => {
            setShowConsentModal(false);
          }}
        />
      </>
    );
  }

  // セッション読み込み中
  if (session.status === "loading" || favoriteWorks.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            {/* ヘッダー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>マイページ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-600">読み込み中...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // エラーハンドリング
  if (favoriteWorks.isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            {/* ヘッダー */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span>マイページ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-red-600">
                    お気に入りの読み込みでエラーが発生しました。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const favoriteWorksData = favoriteWorks.data || [];
  const favoriteCount = session.data?.favorite.works.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* お気に入り作品一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-lg font-semibold">
                  お気に入り作品 ({favoriteCount})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favoriteWorksData.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    まだお気に入りがありません
                  </h3>
                  <p className="text-gray-600">
                    気になる作品を見つけたら、ハートボタンを押してお気に入りに追加しましょう！
                  </p>
                </div>
              ) : (
                <WorksList
                  works={favoriteWorksData}
                  layout="grid"
                  emptyMessage="お気に入りの作品がありません"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
