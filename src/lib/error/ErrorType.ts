export const errorTypes = {
  ILLEGAL_STATE: {
    message: "予期せぬエラーが発生しました。",
    status: 500,
  },
  UNHANDLED: {
    message: "予期せぬエラーが発生しました。",
    status: 500,
  },
  BAD_REQUEST: {
    message: "リクエストが不正です",
    status: 400,
  },
  NOT_FOUND: {
    message: "リソースが見つかりませんでした",
    status: 404,
  },
  UNAUTHORIZED: {
    message: "権限がありません",
    status: 401,
  },
} as const satisfies Record<
  string,
  {
    message: string;
    status: number;
  }
>;

export type ErrorType = keyof typeof errorTypes;
