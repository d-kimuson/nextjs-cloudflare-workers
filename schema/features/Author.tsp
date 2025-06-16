namespace Author;

@doc("作者情報")
model Author {
  @doc("作者ID")
  @example(21414)
  author_id: int32;
  
  @doc("作者名")
  @example("ヴィクトル・ユゴー")
  name: string;
  
  @doc("作者名（読み仮名）")
  @example("う゛ぃくとるゆごー")
  ruby: string;
  
  @doc("作者別名")
  @example("ヴィクトル・ユーゴー/ヴィクトル=ユーゴー")
  another_name?: string;
  
  @doc("リストページURL（アフィリエイトID付き）")
  @example("https://al.dmm.com/?lurl=http%3A%2F%2Fwww.dmm.com%2Fmono%2Fbook%2F-%2Flist%2F%3D%2Farticle%3Dauthor%2Fid%3D21414%2F&af_id=affiliate-990&ch=api")
  list_url: string;
}

@doc("作者検索レスポンス")
model AuthorSearchResponse {
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
  @example("DMM.com（一般）")
  site_name: string;
  
  @doc("サイトコード")
  @example("DMM.com")
  site_code: string;
  
  @doc("サービス名")
  @example("通販")
  service_name: string;
  
  @doc("サービスコード")
  @example("mono")
  service_code: string;
  
  @doc("フロアID")
  @example(24)
  floor_id: int32;
  
  @doc("フロア名")
  @example("本・コミック")
  floor_name: string;
  
  @doc("フロアコード")
  @example("book")
  floor_code: string;
  
  @doc("作者情報リスト")
  author: Author[];
} 