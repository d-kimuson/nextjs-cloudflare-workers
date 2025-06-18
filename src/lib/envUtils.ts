const requiredEnvKeys = [
  "ENVIRONMENT",
  "DMM_AFFILIATE_ID",
  "DMM_API_ID",
  "AUTH_SECRET",
  "JOSE_SECRET",
] as const;
const optionalEnvKeys = ["DUMMY"] as const;

type RequiredEnvKeys = (typeof requiredEnvKeys)[number];
type OptionalEnvKeys = (typeof optionalEnvKeys)[number];

const typedIncludes = <const T>(
  array: readonly T[],
  value: unknown,
): value is T => (array as unknown[]).includes(value);

export const envUtils = {
  getEnv: <
    K extends RequiredEnvKeys | OptionalEnvKeys,
    Ret = K extends RequiredEnvKeys ? string : string | undefined,
  >(
    key: K,
  ): Ret => {
    const value = process.env[key];
    if (typedIncludes(requiredEnvKeys, key)) {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
      return value as Ret;
    }

    return value as Ret;
  },
};
