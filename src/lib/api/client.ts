import { hc } from "hono/client";
import type { HonoAppType } from "../../server/hono/app";

export const honoClient = hc<HonoAppType>("http://localhost:3001");
