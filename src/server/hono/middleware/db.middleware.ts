import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../app";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "../../db/client";

export const dbMiddleware = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const { env } = await getCloudflareContext<{
    DB: D1Database;
  }>({
    async: true,
  });

  const db = getDb(env.DB);
  c.set("db", db);

  await next();
});
