import { Hono } from "hono";

export const honoApp = new Hono().basePath("/api");

export type HonoAppType = typeof honoApp;
