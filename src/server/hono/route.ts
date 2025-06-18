import type { HonoAppType } from "./app";
import {
  sessionBodySchema,
  sessionHandler,
  sessionMiddleware,
} from "./middleware/session.middleware";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ulid } from "ulid";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";
import { transformToWorkItem, type RawWork } from "../utils/transformWorkItem";

export const registerRoutes = (app: HonoAppType) => {
  app.use(sessionMiddleware);

  return (
    app
      // セッション取得
      .get("/session", async (c) => {
        return c.json({
          session: c.get("session") ?? null,
        });
      })
      // セッション作成 (同意と同時に叩かれる、同意 = セッションが存在)
      .post("/session", async (c) => {
        const { upsertSession } = await sessionHandler(c);
        await upsertSession({
          userId: ulid(),
          favorite: {
            works: [],
            makers: [],
            series: [],
          },
        });
        return c.json({ success: true, session: c.get("session") });
      })
      // セッション更新
      .put("/session", zValidator("json", sessionBodySchema), async (c) => {
        const session = c.get("session");

        if (session === null) {
          return c.json(
            { success: false, error: "User not allowed using Cookie" },
            403
          );
        }

        const { upsertSession } = await sessionHandler(c);
        const body = c.req.valid("json");
        await upsertSession({
          userId: session.userId,
          ...body,
        });
        return c.json({ success: true, session: c.get("session") });
      })
      // セッション削除(同意解除)
      .delete("/session", async (c) => {
        const { resetSession } = await sessionHandler(c);
        await resetSession();
        return c.json({ success: true, session: c.get("session") });
      })
      // お気に入り作品取得
      .get("/favorites/works", async (c) => {
        const session = c.get("session");

        if (session === null) {
          return c.json(
            { success: false, error: "User not allowed using Cookie" },
            403
          );
        }

        const db = await getDb();
        const repository = worksRepository(db);

        const favoriteWorkIds = session.favorite.works;
        const rawWorks = await repository.findByIds(favoriteWorkIds);

        // WorkItem形式に変換
        const works = rawWorks.map((rawWork) =>
          transformToWorkItem(rawWork as RawWork)
        );

        return c.json({
          success: true,
          works,
        });
      })
  );
};

export type RouteType = ReturnType<typeof registerRoutes>;
