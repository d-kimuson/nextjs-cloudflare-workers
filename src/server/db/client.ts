import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

export const getDb = async () => {
  const { env } = await getCloudflareContext<{
    DB: D1Database;
  }>({
    async: true,
  });

  return drizzle(env.DB, { schema });
};

export type DB = Awaited<ReturnType<typeof getDb>>;
