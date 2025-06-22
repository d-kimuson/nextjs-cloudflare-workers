import { eq, sql } from "drizzle-orm";
import { getCurrentDate } from "../../../lib/date/currentDate";
import type { DB } from "../../db/client";
import { genresTable, workGenreTable } from "../../db/schema";

export interface CreateGenreInput {
  id: number;
  name: string;
}

export const genresRepository = (db: DB) => {
  const createIfNotExists = async (genre: CreateGenreInput) => {
    const currentTime = getCurrentDate().toISOString();
    await db
      .insert(genresTable)
      .values({
        ...genre,
        createdAt: currentTime,
      })
      .onConflictDoNothing();
  };

  const bulkCreateIfNotExists = async (
    genres: CreateGenreInput[]
  ): Promise<void> => {
    if (genres.length === 0) return;

    const currentTime = new Date().toISOString();
    const genresWithTimestamp = genres.map((genre) => ({
      ...genre,
      createdAt: currentTime,
    }));

    await db
      .insert(genresTable)
      .values(genresWithTimestamp)
      .onConflictDoNothing();
  };

  const findAllWithCounts = async (limit = 50, offset = 0) => {
    return await db
      .select({
        id: genresTable.id,
        name: genresTable.name,
        createdAt: genresTable.createdAt,
        workCount: sql<number>`count(${workGenreTable.workId})`.as(
          "work_count"
        ),
      })
      .from(genresTable)
      .leftJoin(workGenreTable, eq(genresTable.id, workGenreTable.genreId))
      .groupBy(genresTable.id)
      .orderBy(sql`work_count desc`)
      .limit(limit)
      .offset(offset);
  };

  const findById = async (id: number) => {
    return db.query.genresTable
      .findFirst({
        where: eq(genresTable.id, id),
        with: {
          works: {
            with: {
              work: true,
            },
          },
        },
      })
      .then((genre) => {
        if (genre === null || genre === undefined) {
          return null;
        }

        return {
          ...genre,
          works: genre.works
            .map((work) => work.work)
            .filter((work) => work !== null),
        };
      });
  };

  return {
    createIfNotExists,
    bulkCreateIfNotExists,
    findAllWithCounts,
    findById,
  };
};

export type GenresRepository = ReturnType<typeof genresRepository>;
