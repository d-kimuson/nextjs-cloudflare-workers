namespace Item;

@doc("レビュー情報")
model Review {
  @doc("レビュー数")
  @example(8)
  count: int32;
  
  @doc("レビュー平均点")
  @example(3.13)
  average: float32;
}

@doc("画像URL情報")
model ImageURL {
  @doc("リストページ用画像URL")
  @example("http://pics.dmm.co.jp/digital/video/15dss00145/15dss00145pt.jpg")
  list: string;
  
  @doc("末端用（小）画像URL")
  @example("http://pics.dmm.co.jp/digital/video/15dss00145/15dss00145ps.jpg")
  small: string;
  
  @doc("末端用（大）画像URL")
  @example("http://pics.dmm.co.jp/digital/video/15dss00145/15dss00145pl.jpg")
  large: string;
}

@doc("立ち読み情報")
model Tachiyomi {
  @doc("立ち読みページURL")
  @example("http://book.dmm.co.jp/tachiyomi/?product_id=b468acown00017&item_id=b468acown00017&shop=digital_book")
  URL: string;
  
  @doc("立ち読みアフィリエイトリンクURL")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fbook.dmm.co.jp%2Ftachiyomi%2F%3Fproduct_id%3Db468acown00017%26item_id%3Db468acown00017%26shop%3Ddigital_book&af_id=affiliate-990&ch=api")
  affilaiteURL: string;
}

@doc("サンプル画像URL情報")
model SampleImageURL {
  @doc("サンプル（小）画像リスト")
  sample_s: {
    @doc("サンプル画像（小）URL")
    @example("http://pics.dmm.co.jp/digital/video/15dss00145/15dss00145-1.jpg")
    image: string;
  }[];
  
  @doc("サンプル（大）画像リスト")
  sample_l: {
    @doc("サンプル画像（大）URL")
    @example("http://pics.dmm.co.jp/digital/video/15dss00145/15dss00145jp-1.jpg")
    image: string;
  }[];
}

@doc("サンプル動画URL情報")
model SampleMovieURL {
  @doc("476×306サイズ動画URL")
  @example("http://www.dmm.co.jp/litevideo/-/part/=/cid=15dss145/size=476_306/affi_id=affiliate-990/")
  size_476_306?: string;
  
  @doc("560×360サイズ動画URL")
  @example("http://www.dmm.co.jp/litevideo/-/part/=/cid=15dss145/size=560_360/affi_id=affiliate-990/")
  size_560_360?: string;
  
  @doc("644×414サイズ動画URL")
  @example("http://www.dmm.co.jp/litevideo/-/part/=/cid=15dss145/size=644_414/affi_id=affiliate-990/")
  size_644_414?: string;
  
  @doc("720×480サイズ動画URL")
  @example("http://www.dmm.co.jp/litevideo/-/part/=/cid=15dss145/size=720_480/affi_id=affiliate-990/")
  size_720_480?: string;
  
  @doc("PC対応フラグ（1: 対応、0: 非対応）")
  @example(1)
  pc_flag: int32;
  
  @doc("スマホ対応フラグ（1: 対応、0: 非対応）")
  @example(1)
  sp_flag: int32;
}

@doc("配信情報")
model Delivery {
  @doc("配信タイプ")
  @example("stream")
  type: string;
  
  @doc("配信価格")
  @example(300)
  price: int32;
}

@doc("価格情報")
model Prices {
  @doc("金額")
  @example("300～")
  price: string;
  
  @doc("定価")
  list_price?: string;
  
  @doc("配信リスト")
  deliveries?: {
    @doc("配信情報")
    delivery: Delivery;
  }[];
}

@doc("ジャンル情報")
model Genre {
  @doc("ジャンル名")
  @example("ベスト・総集編")
  name: string;
  
  @doc("ジャンルID")
  @example(6003)
  id: int32;
}

@doc("シリーズ情報")
model Series {
  @doc("シリーズ名")
  @example("GETシリーズ")
  name: string;
  
  @doc("シリーズID")
  @example(1006)
  id: int32;
}

@doc("メーカー情報")
model Maker {
  @doc("メーカー名")
  @example("桃太郎映像出版")
  name: string;
  
  @doc("メーカーID")
  @example(40016)
  id: int32;
}

@doc("出演者情報（一般作品のみ）")
model Actor {
  @doc("出演者名")
  name: string;
  
  @doc("出演者ID")
  id: int32;
}

@doc("女優情報（アダルト作品のみ）")
model Actress {
  @doc("女優名")
  @example("小澤マリア")
  name: string;
  
  @doc("女優ID")
  @example(15187)
  id: int32;
}

@doc("監督情報")
model Director {
  @doc("監督名")
  name: string;
  
  @doc("監督ID")
  id: int32;
}

@doc("作家・原作者・著者情報")
model Author {
  @doc("作家・原作者・著者名")
  name: string;
  
  @doc("作家・原作者・著者ID")
  id: int32;
}

@doc("レーベル情報")
model Label {
  @doc("レーベル名")
  @example("LADY HUNTERS")
  name: string;
  
  @doc("レーベルID")
  @example(76)
  id: int32;
}

@doc("タイプ情報")
model Type {
  @doc("タイプ名")
  name: string;
  
  @doc("タイプID")
  id: int32;
}

@doc("カラー情報")
model Color {
  @doc("カラー名")
  name: string;
  
  @doc("カラーID")
  id: int32;
}

@doc("サイズ情報")
model Size {
  @doc("サイズ名")
  name: string;
  
  @doc("サイズID")
  id: int32;
}

@doc("商品詳細情報")
model ItemInfo {
  @doc("ジャンル情報")
  genre?: Genre[];
  
  @doc("シリーズ情報")
  series?: Series[];
  
  @doc("メーカー情報")
  maker?: Maker[];
  
  @doc("出演者情報（一般作品のみ）")
  actor?: Actor[];
  
  @doc("女優情報（アダルト作品のみ）")
  actress?: Actress[];
  
  @doc("監督情報")
  director?: Director[];
  
  @doc("作家・原作者・著者情報")
  author?: Author[];
  
  @doc("レーベル情報")
  label?: Label[];
  
  @doc("タイプ情報")
  type?: Type[];
  
  @doc("カラー情報")
  color?: Color[];
  
  @doc("サイズ情報")
  size?: Size[];
}

@doc("CD情報")
model CDInfo {
  @doc("アルバム、シングル")
  kind: string;
}

@doc("パンくずリスト情報")
model Directory {
  @doc("パンくずID")
  @example(783)
  id: int32;
  
  @doc("パンくず名")
  @example("J-POP等")
  name: string;
}

@doc("キャンペーン情報")
model Campaign {
  @doc("キャンペーン開始日時")
  @example("2023-05-01 10:00:00")
  date_begin: string;
  
  @doc("キャンペーン終了日時")
  @example("2023-05-31 23:59:59")
  date_end: string;
  
  @doc("キャンペーンタイトル")
  title: string;
}

@doc("商品情報")
model Item {
  @doc("サービスコード")
  @example("digital")
  service_code: string;
  
  @doc("サービス名")
  @example("動画")
  service_name: string;
  
  @doc("フロアコード")
  @example("videoa")
  floor_code: string;
  
  @doc("フロア名")
  @example("ビデオ")
  floor_name: string;
  
  @doc("カテゴリ名")
  @example("ビデオ (動画)")
  category_name: string;
  
  @doc("商品ID")
  @example("15dss00145")
  content_id: string;
  
  @doc("品番")
  @example("15dss00145dl")
  product_id: string;
  
  @doc("タイトル")
  @example("GET！！ 素人ナンパ Best100！！ 街角女子ベスト100人 8時間")
  title: string;
  
  @doc("収録時間 or ページ数")
  @example(350)
  volume?: int32;
  
  @doc("巻数")
  @example(3)
  number?: int32;
  
  @doc("レビュー情報")
  review?: Review;
  
  @doc("商品ページURL")
  @example("http://www.dmm.co.jp/digital/videoa/-/detail/=/cid=15dss00145/")
  URL: string;
  
  @doc("アフィリエイトリンクURL")
  @example("https://al.dmm.co.jp/?lurl=http%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F-%2Fdetail%2F%3D%2Fcid%3D15dss00145%2F&af_id=affiliate-990&ch=api")
  affiliateURL: string;
  
  @doc("画像URL情報")
  imageURL?: ImageURL;
  
  @doc("立ち読み情報")
  tachiyomi?: Tachiyomi;
  
  @doc("サンプル画像URL情報")
  sampleImageURL?: SampleImageURL;
  
  @doc("サンプル動画URL情報")
  sampleMovieURL?: SampleMovieURL;
  
  @doc("価格情報")
  prices?: Prices;
  
  @doc("発売日、配信開始日、貸出開始日")
  @example("2012/8/3 10:00")
  date: string;
  
  @doc("商品詳細情報")
  iteminfo?: ItemInfo;
  
  @doc("CD情報")
  cdinfo?: CDInfo;
  
  @doc("JANコード")
  @example("4988135965905")
  jancode?: string;
  
  @doc("メーカー品番")
  @example("10003-54653")
  maker_product?: string;
  
  @doc("ISBN")
  isbn?: string;
  
  @doc("在庫状況")
  @example("reserve")
  stock?: string;
  
  @doc("パンくずリスト")
  directory?: Directory[];
  
  @doc("キャンペーン情報")
  campaign?: Campaign[];
}

@doc("商品リストレスポンス")
model ItemListResponse {
  @doc("ステータスコード")
  @example(200)
  status: int32;
  
  @doc("取得件数")
  @example(20)
  result_count: int32;
  
  @doc("全体件数")
  @example(50000)
  total_count: int32;
  
  @doc("検索開始位置")
  @example(1)
  first_position: int32;
  
  @doc("商品情報リスト")
  items: Item[];
}
