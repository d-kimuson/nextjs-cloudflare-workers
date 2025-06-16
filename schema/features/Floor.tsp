namespace Floor;

@doc("フロア情報")
model Floor {
  @doc("フロアID")
  @example(6)
  id: int32;
  
  @doc("フロア名")
  @example("映画・ドラマ")
  name: string;
  
  @doc("フロアコード")
  @example("cinema")
  code: string;
}

@doc("サービス情報")
model Service {
  @doc("サービス名")
  @example("動画")
  name: string;
  
  @doc("サービスコード")
  @example("digital")
  code: string;
  
  @doc("フロア情報リスト")
  floor: Floor[];
}

@doc("サイト情報")
model Site {
  @doc("サイト名")
  @example("DMM.com（一般）")
  name: string;
  
  @doc("サイトコード")
  @example("DMM.com")
  code: string;
  
  @doc("サービス情報リスト")
  service: Service[];
}

@doc("フロアリストレスポンス")
model FloorListResponse {
  @doc("サイト情報リスト")
  site: Site[];
} 