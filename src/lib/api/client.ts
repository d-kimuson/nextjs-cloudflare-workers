import { hc } from "hono/client";
import type { RouteType } from "../../server/hono/route";

export const honoClient = hc<RouteType>(process.env.NEXT_BASE_URL ?? "/");
