type ReplacePathname<T extends string> =
  T extends `${infer I2}[${string}]${infer I4}`
    ? `${I2}[${string}]${"" extends I4 ? "" : ReplacePathname<I4>}`
    : string;

export const urlObjectToString = <P extends string>(urlObject: {
  pathname: P;
  query?: Record<string, unknown>;
  hash?: string;
  path: string;
}): ReplacePathname<P> => {
  return (urlObject.query === undefined
    ? urlObject.pathname
    : Object.entries(urlObject.query).reduce(
        (s: string, [k, v]) => s.replace(`[${k}]`, String(v)),
        urlObject.pathname,
      )) as unknown as ReplacePathname<P>;
};
