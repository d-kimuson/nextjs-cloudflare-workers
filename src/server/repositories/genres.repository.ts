import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../db/client";
import { genresTable } from "../db/schema";

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
    genres: CreateGenreInput[],
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

  return {
    createIfNotExists,
    bulkCreateIfNotExists,
  };
};

export type GenresRepository = ReturnType<typeof genresRepository>;
