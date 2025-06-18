import { hc } from "hono/client";
import type { HonoAppType } from "../../server/hono/app";
import type { RouteType } from "../../server/hono/route";

export const honoClient = hc<RouteType>("http://localhost:3001");
