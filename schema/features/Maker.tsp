namespace Maker;

@doc("メーカー情報")
model Maker {
  @doc("メーカーID")
  @example(1509)
  maker_id: int32;
  
  @doc("メーカー名")
  @example("ムーディーズ")
  name: string;
  
  @doc("メーカー名（読み仮名）")
  @example("むーでぃーず")
  ruby: string;
  
  @doc("リストページURL（アフィリエイトID付き）")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Flist%2F%3D%2Farticle%3Dmaker%2Fid%3D1509%2F&af_id=affiliate-990&ch=api")
  list_url: string;
}

@doc("メーカー検索レスポンス")
model MakerSearchResponse {
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
  
  @doc("メーカー情報リスト")
  maker: Maker[];
} 