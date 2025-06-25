import { zValidator } from "@hono/zod-validator";
import { ulid } from "ulid";
import { worksRepository } from "../features/works/works.repository";
import { transformToWorkItem } from "../features/works/works.transform";
import type { HonoAppType } from "./app";
import {
  sessionBodySchema,
  sessionHandler,
  sessionMiddleware,
} from "./middleware/session.middleware";
import { dmmApiClient } from "../lib/dmmApi/client";
import { worksService } from "../features/works/works.service";
import { genreService } from "../features/genres/genres.service";
import { makersService } from "../features/makers/makers.service";
import { seriesService } from "../features/series/series.service";
import z from "zod";
import { dbMiddleware } from "./middleware/db.middleware";
import { dmmService } from "../features/dmm/dmm.service";

export const registerRoutes = (app: HonoAppType) => {
  app.use(dbMiddleware);
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
            403,
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
            403,
          );
        }

        const repository = worksRepository(c.get("db"));

        const favoriteWorkIds = session.favorite.works;
        const rawWorks = await repository.findByIds(favoriteWorkIds);

        // WorkItem形式に変換
        const works = rawWorks.map((rawWork) => transformToWorkItem(rawWork));

        return c.json({
          success: true,
          works,
        });
      })

      // dmm api proxy
      .get("/dmm/daily-ranking", async (c) => {
        const dailyRanking = await dmmService().getDmmDailyRanking();

        if (dailyRanking.isErr()) {
          return c.json(
            { success: false, error: "Failed to get daily ranking" },
            500,
          );
        }

        return c.json({
          dailyRanking: dailyRanking.value,
        });
      })

      .get("/dmm/ranking", async (c) => {
        const ranking = await dmmService().getDmmRanking({ hits: 20 });

        if (ranking.isErr()) {
          return c.json(
            { success: false, error: "Failed to get ranking" },
            500,
          );
        }

        return c.json({ ranking: ranking.value });
      })

      // works
      .get("/works/:workId", async (c) => {
        const workId = c.req.param("workId");
        const worksServiceClient = worksService(c.get("db"));

        const work = await worksServiceClient.getWorkById(workId);

        if (work.isErr()) {
          return c.json({ success: false, error: "Failed to get work" }, 500);
        }

        return c.json({ work: work.value });
      })

      .get(
        "/works",
        zValidator(
          "query",
          z.object({
            title: z.string().optional(),
            makerId: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseInt(val) : undefined)),
            genreId: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseInt(val) : undefined)),
            seriesId: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseInt(val) : undefined)),
            minPrice: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseInt(val) : undefined)),
            maxPrice: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseInt(val) : undefined)),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            minRating: z
              .string()
              .optional()
              .transform((val) => (val ? Number.parseFloat(val) : undefined)),
            sortBy: z
              .enum([
                "newest",
                "oldest",
                "rating-high",
                "rating-low",
                "price-high",
                "price-low",
              ])
              .optional(),
          }),
        ),
        async (c) => {
          const worksServiceClient = worksService(c.get("db"));

          const query = c.req.valid("query");
          const works = await worksServiceClient.search(
            {
              title: query.title,
              makerId: query.makerId,
              genreId: query.genreId,
              seriesId: query.seriesId,
              minPrice: query.minPrice,
              maxPrice: query.maxPrice,
              startDate: query.startDate,
              endDate: query.endDate,
              minRating: query.minRating,
              sortBy: query.sortBy,
            },
            {
              page: 1,
              limit: 20,
            },
          );

          if (works.isErr()) {
            return c.json(
              { success: false, error: "Failed to get works" },
              500,
            );
          }

          return c.json({
            works: works.value.works,
            pagination: works.value.pagination,
          });
        },
      )

      // genres
      .get("/genres", async (c) => {
        const genresServiceClient = genreService(c.get("db"));
        const genres = await genresServiceClient.getAllGenresWithCounts();

        if (genres.isErr()) {
          return c.json({ success: false, error: "Failed to get genres" }, 500);
        }

        return c.json({ genres: genres.value });
      })

      .get("/genres/:genreId", async (c) => {
        const genreId = c.req.param("genreId");
        const genresServiceClient = genreService(c.get("db"));
        const genre = await genresServiceClient.getGenreById(
          Number.parseInt(genreId),
        );

        if (genre.isErr()) {
          return c.json({ success: false, error: "Failed to get genre" }, 500);
        }

        return c.json({ genre: genre.value });
      })

      .get("/genres/:genreId/works", async (c) => {
        const genreId = c.req.param("genreId");
        const worksServiceClient = worksService(c.get("db"));
        const works = await worksServiceClient.getWorksByGenreId(
          Number.parseInt(genreId),
        );

        if (works.isErr()) {
          return c.json({ success: false, error: "Failed to get works" }, 500);
        }

        return c.json({
          works: works.value.works,
          pagination: works.value.pagination,
        });
      })

      // makers
      .get("/makers", async (c) => {
        const makersServiceClient = makersService(c.get("db"));
        const makers = await makersServiceClient.getMakers();

        if (makers.isErr()) {
          return c.json({ success: false, error: "Failed to get makers" }, 500);
        }

        return c.json({ makers: makers.value });
      })

      .get("/makers/:makerId", async (c) => {
        const makerId = c.req.param("makerId");
        const makersServiceClient = makersService(c.get("db"));
        const maker = await makersServiceClient.getMakerById(
          Number.parseInt(makerId),
        );

        if (maker.isErr()) {
          return c.json({ success: false, error: "Failed to get maker" }, 500);
        }

        return c.json({ maker: maker.value });
      })

      .get("/makers/:makerId/works", async (c) => {
        const makerId = c.req.param("makerId");
        const worksServiceClient = worksService(c.get("db"));
        const works = await worksServiceClient.getWorksByMakerId(
          Number.parseInt(makerId),
        );

        if (works.isErr()) {
          return c.json({ success: false, error: "Failed to get works" }, 500);
        }

        return c.json({
          works: works.value.works,
          pagination: works.value.pagination,
        });
      })

      .get("/makers-ranking", async (c) => {
        const makersServiceClient = makersService(c.get("db"));
        const ranking = await makersServiceClient.getMakersRanking();

        if (ranking.isErr()) {
          console.error(ranking.error);
          return c.json(
            { success: false, error: "Failed to get makers ranking" },
            500,
          );
        }

        return c.json({ ranking: ranking.value });
      })

      // series
      .get("/series/:seriesId", async (c) => {
        const seriesId = c.req.param("seriesId");
        const seriesServiceClient = seriesService(c.get("db"));
        const series = await seriesServiceClient.getSeriesById(
          Number.parseInt(seriesId),
        );

        if (series.isErr()) {
          return c.json({ success: false, error: "Failed to get series" }, 500);
        }

        return c.json({ series: series.value });
      })

      .get("/series/:seriesId/works", async (c) => {
        const seriesId = c.req.param("seriesId");
        const worksServiceClient = worksService(c.get("db"));
        const works = await worksServiceClient.getWorksBySeriesId(
          Number.parseInt(seriesId),
        );

        if (works.isErr()) {
          return c.json({ success: false, error: "Failed to get works" }, 500);
        }

        return c.json({
          works: works.value.works,
          pagination: works.value.pagination,
        });
      })

      // others
      .get("/recent-works-by-top-makers", async (c) => {
        const worksServiceClient = worksService(c.get("db"));
        const works = await worksServiceClient.getRecentWorksByTopMakers();

        if (works.isErr()) {
          return c.json(
            { success: false, error: "Failed to get works" } as const,
            500,
          );
        }

        return c.json({ works: works.value } as const);
      })
  );
};

export type RouteType = ReturnType<typeof registerRoutes>;
