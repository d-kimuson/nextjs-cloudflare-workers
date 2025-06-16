import "@typespec/http";
import "@typespec/openapi";

import "./lib/SharedResponse.tsp";
import "./features/Item.tsp";
import "./features/Floor.tsp";
import "./features/Actress.tsp";
import "./features/Genre.tsp";
import "./features/Maker.tsp";
import "./features/Series.tsp";
import "./features/Author.tsp";

using TypeSpec.Http;

@service(#{
  title: "DMM API",
})
@doc("DMM API methods for IoT devices")
@TypeSpec.OpenAPI.info(#{
  version: "3.0",
})
@TypeSpec.OpenAPI.externalDocs("https://affiliate.dmm.com/api/")
@server("https://api.dmm.com/affiliate/v3", "DMM API v3")
namespace DmmApi {
  @summary("商品情報API")
  @doc("DMM商品情報を取得するAPI。キーワード検索、カテゴリ絞り込み、ソート機能を提供します。")
  @get()
  @route("/ItemList")
  op itemList(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("一般（DMM.com）かアダルト（FANZA）かを指定")
    @query 
    @example("FANZA")
    site: "DMM.com" | "FANZA",
    
    @doc("フロアAPIから取得できるサービスコードを指定")
    @query 
    @example("digital")
    service?: string,
    
    @doc("フロアAPIから取得できるフロアコードを指定")
    @query 
    @example("videoa")
    floor?: string,
    
    @doc("取得件数（初期値：20、最大：100）")
    @query 
    @example(20)
    hits?: int32 = 20,
    
    @doc("検索開始位置（初期値：1、最大：50000）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("ソート順（初期値：rank）")
    @query 
    @example("rank")
    sort?: "rank" | "price" | "-price" | "date" | "review" | "match" = "rank",
    
    @doc("検索キーワード（UTF-8で指定）")
    @query 
    @example("上原亜衣")
    keyword?: string,
    
    @doc("商品に振られているcontent_id")
    @query 
    @example("15dss00145")
    cid?: string,
    
    @doc("絞り込み項目（女優：actress、作者：author、ジャンル：genre、シリーズ：series、メーカー：maker）")
    @query("article")
    article?: ("actress" | "author" | "genre" | "series" | "maker")[],
    
    @doc("絞り込み項目のID（各検索APIから取得可能）")
    @query("article_id")
    article_id?: string[],
    
    @doc("このパラメータで指定した日付以降に発売された商品を絞り込み（ISO8601形式）")
    @query 
    @example("2016-04-01T00:00:00")
    gte_date?: string,
    
    @doc("このパラメータで指定した日付以前に発売された商品を絞り込み（ISO8601形式）")
    @query 
    @example("2016-04-30T23:59:59")
    lte_date?: string,
    
    @doc("在庫絞り込み（通販サービスのみ指定可能）")
    @query 
    @example("stock")
    mono_stock?: "stock" | "reserve" | "reserve_empty" | "mono" | "dmp",
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    site: string;
    service?: string;
    floor?: string;
    hits?: int32;
    offset?: int32;
    sort?: string;
    keyword?: string;
    cid?: string;
    article?: string[];
    article_id?: string[];
    gte_date?: string;
    lte_date?: string;
    mono_stock?: string;
    output?: string;
    callback?: string;
  }, Item.ItemListResult>;

  @summary("フロア情報API")
  @doc("DMM APIで利用可能なサイト、サービス、フロア情報を取得するAPI。商品検索時のパラメータ指定に使用します。")
  @get()
  @route("/FloorList")
  op floorList(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    output?: string;
    callback?: string;
  }, Floor.FloorListResponse>;

  @summary("女優検索API")
  @doc("DMM女優情報を検索するAPI。名前、身体的特徴、生年月日等で絞り込み検索が可能です。")
  @get()
  @route("/ActressSearch")
  op actressSearch(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("頭文字（50音をUTF-8で指定）")
    @query 
    @example("あ")
    initial?: string,
    
    @doc("女優ID")
    @query 
    @example(15365)
    actress_id?: int32,
    
    @doc("検索キーワード（UTF-8で指定）")
    @query 
    @example("あさみ")
    keyword?: string,
    
    @doc("バスト下限（cm）")
    @query 
    @example(90)
    gte_bust?: int32,
    
    @doc("バスト上限（cm）")
    @query 
    @example(100)
    lte_bust?: int32,
    
    @doc("ウエスト下限（cm）")
    @query 
    @example(55)
    gte_waist?: int32,
    
    @doc("ウエスト上限（cm）")
    @query 
    @example(65)
    lte_waist?: int32,
    
    @doc("ヒップ下限（cm）")
    @query 
    @example(85)
    gte_hip?: int32,
    
    @doc("ヒップ上限（cm）")
    @query 
    @example(95)
    lte_hip?: int32,
    
    @doc("身長下限（cm）")
    @query 
    @example(155)
    gte_height?: int32,
    
    @doc("身長上限（cm）")
    @query 
    @example(165)
    lte_height?: int32,
    
    @doc("生年月日下限（yyyy-mm-dd形式）")
    @query 
    @example("1990-01-01")
    gte_birthday?: string,
    
    @doc("生年月日上限（yyyy-mm-dd形式）")
    @query 
    @example("1999-12-31")
    lte_birthday?: string,
    
    @doc("取得件数（初期値：20、最大：100）")
    @query 
    @example(20)
    hits?: int32 = 20,
    
    @doc("検索開始位置（初期値：1）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("ソート順")
    @query 
    @example("-name")
    sort?: "name" | "-name" | "bust" | "-bust" | "waist" | "-waist" | "hip" | "-hip" | "height" | "-height" | "birthday" | "-birthday" | "id" | "-id",
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    initial?: string;
    actress_id?: int32;
    keyword?: string;
    gte_bust?: int32;
    lte_bust?: int32;
    gte_waist?: int32;
    lte_waist?: int32;
    gte_hip?: int32;
    lte_hip?: int32;
    gte_height?: int32;
    lte_height?: int32;
    gte_birthday?: string;
    lte_birthday?: string;
    hits?: int32;
    offset?: int32;
    sort?: string;
    output?: string;
    callback?: string;
  }, Actress.ActressSearchResponse>;

  @summary("ジャンル検索API")
  @doc("DMM商品のジャンル情報を検索するAPI。フロア別のジャンル一覧を取得できます。")
  @get()
  @route("/GenreSearch")
  op genreSearch(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("フロア検索APIから取得可能なフロアID")
    @query 
    @example(25)
    floor_id: int32,
    
    @doc("頭文字（50音をUTF-8で指定）")
    @query 
    @example("あ")
    initial?: string,
    
    @doc("取得件数（初期値：100、最大：500）")
    @query 
    @example(100)
    hits?: int32 = 100,
    
    @doc("検索開始位置（初期値：1）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    floor_id: int32;
    initial?: string;
    hits?: int32;
    offset?: int32;
    output?: string;
    callback?: string;
  }, Genre.GenreSearchResponse>;

  @summary("メーカー検索API")
  @doc("DMM商品のメーカー情報を検索するAPI。フロア別のメーカー一覧を取得できます。")
  @get()
  @route("/MakerSearch")
  op makerSearch(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("フロア検索APIから取得可能なフロアID")
    @query 
    @example(43)
    floor_id: int32,
    
    @doc("頭文字（50音をUTF-8で指定）")
    @query 
    @example("あ")
    initial?: string,
    
    @doc("取得件数（初期値：100、最大：500）")
    @query 
    @example(100)
    hits?: int32 = 100,
    
    @doc("検索開始位置（初期値：1）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    floor_id: int32;
    initial?: string;
    hits?: int32;
    offset?: int32;
    output?: string;
    callback?: string;
  }, Maker.MakerSearchResponse>;

  @summary("シリーズ検索API")
  @doc("DMM商品のシリーズ情報を検索するAPI。フロア別のシリーズ一覧を取得できます。")
  @get()
  @route("/SeriesSearch")
  op seriesSearch(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("フロア検索APIから取得可能なフロアID")
    @query 
    @example(27)
    floor_id: int32,
    
    @doc("頭文字（50音をUTF-8で指定）")
    @query 
    @example("お")
    initial?: string,
    
    @doc("取得件数（初期値：100、最大：500）")
    @query 
    @example(100)
    hits?: int32 = 100,
    
    @doc("検索開始位置（初期値：1）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    floor_id: int32;
    initial?: string;
    hits?: int32;
    offset?: int32;
    output?: string;
    callback?: string;
  }, Series.SeriesSearchResponse>;

  @summary("作者検索API")
  @doc("DMM商品の作者情報を検索するAPI。フロア別の作者一覧を取得できます。")
  @get()
  @route("/AuthorSearch")
  op authorSearch(
    @doc("登録時に割り振られたAPIID")
    @query api_id: string,
    
    @doc("登録時に割り振られた990～999までのアフィリエイトID")
    @query 
    @example("affiliate-990")
    affiliate_id: string,
    
    @doc("フロア検索APIから取得可能なフロアID")
    @query 
    @example(27)
    floor_id: int32,
    
    @doc("読み仮名（作者名読み仮名をUTF-8で指定、前方一致検索）")
    @query 
    @example("う゛ぃくとる")
    initial?: string,
    
    @doc("取得件数（初期値：100、最大：500）")
    @query 
    @example(100)
    hits?: int32 = 100,
    
    @doc("検索開始位置（初期値：1）")
    @query 
    @example(1)
    offset?: int32 = 1,
    
    @doc("出力形式")
    @query 
    @example("json")
    output?: "json" | "xml" = "json",
    
    @doc("JSONP形式で出力する場合のコールバック関数名")
    @query 
    @example("callback")
    callback?: string
  ): SharedResponse.GetResponse<{
    @doc("リクエストパラメータ")
    api_id: string;
    affiliate_id: string;
    floor_id: int32;
    initial?: string;
    hits?: int32;
    offset?: int32;
    output?: string;
    callback?: string;
  }, Author.AuthorSearchResponse>;
}
