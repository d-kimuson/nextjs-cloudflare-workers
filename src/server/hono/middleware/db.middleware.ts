import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createMiddleware } from "hono/factory";
import { getDb } from "../../db/client";
import type { HonoVariables } from "../app";

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
