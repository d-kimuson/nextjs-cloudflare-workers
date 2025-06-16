namespace Actress;

@doc("女優画像URL情報")
model ActressImageURL {
  @doc("画像（小）URL")
  @example("http://pics.dmm.co.jp/mono/actjpgs/thumbnail/asami_yuma.jpg")
  small: string;
  
  @doc("画像（大）URL")
  @example("http://pics.dmm.co.jp/mono/actjpgs/asami_yuma.jpg")
  large: string;
}

@doc("女優リストページURL情報（アフィリエイトID付き）")
model ActressListURL {
  @doc("動画リストページURL")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Flist%2F%3D%2Farticle%3Dactress%2Fid%3D15365%2F&af_id=affiliate-001&ch=api")
  digital: string;
  
  @doc("月額動画 見放題chデラックスリストページURL")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fmonthly%2Fpremium%2F-%2Flist%2F%3D%2Farticle%3Dactress%2Fid%3D15365%2F&af_id=affiliate-001&ch=api")
  monthly_premium: string;
  
  @doc("DVD通販リストページURL")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fmono%2Fdvd%2F-%2Flist%2F%3D%2Farticle%3Dactress%2Fid%3D15365%2F&af_id=affiliate-001&ch=api")
  mono: string;
}

@doc("女優情報")
model Actress {
  @doc("女優ID")
  @example(15365)
  id: int32;
  
  @doc("女優名")
  @example("麻美ゆま")
  name: string;
  
  @doc("女優名（読み仮名）")
  @example("あさみゆま")
  ruby: string;
  
  @doc("バスト（cm）")
  @example(96)
  bust?: int32;
  
  @doc("カップ数")
  @example("H")
  cup?: string;
  
  @doc("ウェスト（cm）")
  @example(58)
  waist?: int32;
  
  @doc("ヒップ（cm）")
  @example(88)
  hip?: int32;
  
  @doc("身長（cm）")
  @example(158)
  height?: int32;
  
  @doc("生年月日")
  @example("1987-03-24")
  birthday?: string;
  
  @doc("血液型")
  @example("AB")
  blood_type?: string;
  
  @doc("趣味")
  @example("香水集め、英会話、ピアノ")
  hobby?: string;
  
  @doc("出身地")
  @example("東京都")
  prefectures?: string;
  
  @doc("画像URL情報")
  imageURL?: ActressImageURL;
  
  @doc("リストページURL情報（アフィリエイトID付き）")
  listURL?: ActressListURL;
}

@doc("女優検索レスポンス")
model ActressSearchResponse {
  @doc("ステータスコード")
  @example(200)
  status: int32;
  
  @doc("取得件数")
  @example(20)
  result_count: int32;
  
  @doc("全体件数")
  @example(64964)
  total_count: int32;
  
  @doc("検索開始位置")
  @example(1)
  first_position: int32;
  
  @doc("女優情報リスト")
  actress: Actress[];
} 