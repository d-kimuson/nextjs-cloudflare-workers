namespace Series;

@doc("シリーズ情報")
model Series {
  @doc("シリーズID")
  @example(62226)
  series_id: int32;
  
  @doc("シリーズ名")
  @example("ARIA")
  name: string;
  
  @doc("シリーズ名（読み仮名）")
  @example("ありあ")
  ruby: string;
  
  @doc("リストページURL（アフィリエイトID付き）")
  @example("https://al.dmm.com/?lurl=http%3A%2F%2Fwww.dmm.com%2Fmono%2Fbook%2F-%2Flist%2F%3D%2Farticle%3Dseries%2Fid%3D62226%2F&af_id=affiliate-001&ch=api")
  list_url: string;
}

@doc("シリーズ検索レスポンス")
model SeriesSearchResponse {
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
  
  @doc("シリーズ情報リスト")
  series: Series[];
} 