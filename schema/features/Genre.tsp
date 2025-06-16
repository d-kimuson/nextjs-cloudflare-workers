namespace Genre;

@doc("ジャンル情報")
model Genre {
  @doc("ジャンルID")
  @example(2001)
  genre_id: int32;
  
  @doc("ジャンル名")
  @example("巨乳")
  name: string;
  
  @doc("ジャンル名（読み仮名）")
  @example("きょにゅう")
  ruby: string;
  
  @doc("リストページURL（アフィリエイトID付き）")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Flist%2F%3D%2Farticle%3Dkeyword%2Fid%3D2001%2F&af_id=affiliate-001&ch=api")
  list_url: string;
}

@doc("ジャンル検索レスポンス")
model GenreSearchResponse {
  @doc("ステータスコード")
  @example(200)
  status: int32;
  
  @doc("取得件数")
  @example(100)
  result_count: int32;
  
  @doc("全体件数")
  @example(1000)
  total_count: int32;
  
  @doc("検索開始位置")
  @example(1)
  first_position: int32;
  
  @doc("サイト名")
  @example("FANZA（アダルト）")
  site_name: string;
  
  @doc("サイトコード")
  @example("FANZA")
  site_code: string;
  
  @doc("サービス名")
  @example("動画")
  service_name: string;
  
  @doc("サービスコード")
  @example("digital")
  service_code: string;
  
  @doc("フロアID")
  @example(40)
  floor_id: int32;
  
  @doc("フロア名")
  @example("ビデオ")
  floor_name: string;
  
  @doc("フロアコード")
  @example("videoa")
  floor_code: string;
  
  @doc("ジャンル情報リスト")
  genre: Genre[];
} 