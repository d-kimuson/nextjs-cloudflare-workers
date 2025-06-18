import { Hono } from "hono";
import { handle } from "hono/vercel";
import { honoApp } from "../../../server/hono/app";
import { registerRoutes } from "../../../server/hono/route";

export const runtime = "edge";

registerRoutes(honoApp);

export const GET = handle(honoApp);
export const POST = handle(honoApp);
export const PUT = handle(honoApp);
export const PATCH = handle(honoApp);
export const DELETE = handle(honoApp);
