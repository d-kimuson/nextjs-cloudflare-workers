import type { HonoAppType } from "./app";

export const registerRoutes = (app: HonoAppType) => {
  app.get("/api/hello", (c) => {
    return c.json({
      message: "Hello Next.js!",
    });
  });
};

export type RouteType = ReturnType<typeof registerRoutes>;
