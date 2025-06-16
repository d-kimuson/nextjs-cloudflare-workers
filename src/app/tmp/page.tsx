import { dmmApiClient } from "@/lib/api/client";
import type { ItemItem } from "@/lib/api/dmmApi.generated";

export default async function Home() {
  const apiClient = dmmApiClient();
  let doujinList: ItemItem[] = [];
  let error: string | null = null;

  try {
    doujinList = await apiClient.getRankingDoujinList();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error fetching doujin ranking:", err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            同人ランキング
          </h1>
          <p className="text-gray-600">人気同人作品のランキングをご紹介</p>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">データの取得に失敗しました: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doujinList.map((item, index) => (
              <div
                key={item.content_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                    #{index + 1}
                  </div>
                  {item.imageURL?.large && (
                    <img
                      src={item.imageURL.large}
                      alt={item.title}
                      width={300}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">
                    {item.title}
                  </h3>

                  <div className="space-y-2 text-xs text-gray-600">
                    {item.prices?.price && (
                      <div className="flex justify-between items-center">
                        <span>価格:</span>
                        <span className="font-bold text-red-600">
                          ¥{item.prices.price}
                        </span>
                      </div>
                    )}

                    {item.date && (
                      <div className="flex justify-between items-center">
                        <span>発売日:</span>
                        <span>
                          {new Date(item.date).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    )}

                    {item.review?.average && (
                      <div className="flex justify-between items-center">
                        <span>評価:</span>
                        <span className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{item.review.average}</span>
                          <span className="text-gray-400 ml-1">
                            ({item.review.count})
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <a
                      href={item.affiliateURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium block"
                    >
                      詳細を見る
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {doujinList.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">データを読み込み中...</p>
          </div>
        )}
      </div>
    </div>
  );
}
