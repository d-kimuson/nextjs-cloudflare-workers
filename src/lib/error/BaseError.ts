import { type ErrorType, errorTypes } from "./ErrorType";

export class BaseError<
  const Type extends ErrorType,
  const Code extends string,
> extends Error {
  public readonly isBaseErrorExtended = true;
  public readonly status: number;

  constructor(
    /**
     * エラーコード
     */
    public readonly code: Code,
    /**
     * エラーカテゴリ
     */
    public readonly type: Type,
    options: ErrorOptions & {
      message?: string;
    } = {},
  ) {
    super(options.message ?? errorTypes[type].message);
    this.name = BaseError.name;
    this.cause = options.cause;
    this.status = errorTypes[type].status;

    if (options.cause instanceof Error && options.cause.stack !== undefined) {
      this.stack = options.cause.stack;
    }
  }
}

export const isBaseError = (
  error: unknown,
): error is BaseError<ErrorType, string> => {
  // Instance ならもちろん OK
  if (error instanceof BaseError) return true;

  // クラサバだとシリアライズされちゃうので
  return (
    typeof error === "object" &&
    error !== null &&
    "isBaseErrorExtended" in error &&
    typeof error.isBaseErrorExtended === "boolean" &&
    error.isBaseErrorExtended
  );
};
