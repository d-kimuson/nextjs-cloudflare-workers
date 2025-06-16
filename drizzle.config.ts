import { defineConfig } from "drizzle-kit";

const requiredEnv = (key: string) => {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return value;
};

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: requiredEnv("CLOUDFLARE_ACCOUNT_ID"),
    databaseId: requiredEnv("CLOUDFLARE_DATABASE_ID"),
    token: requiredEnv("CLOUDFLARE_D1_TOKEN"),
  },
});
