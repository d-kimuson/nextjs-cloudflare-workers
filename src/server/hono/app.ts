import { Hono } from "hono";
import type { DB } from "../db/client";
import type { SessionData } from "./middleware/session.middleware";

export type HonoVariables = {
  session: SessionData | null;
  db: DB;
};

export const honoApp = new Hono<{
  Variables: HonoVariables;
}>().basePath("/api");

export type HonoAppType = typeof honoApp;
