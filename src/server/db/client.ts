import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

export const getDb = cache(() => {
  const { env } = getCloudflareContext<{
    DB: D1Database;
  }>();

  return drizzle(env.DB, { schema });
});

export type DB = ReturnType<typeof getDb>;
