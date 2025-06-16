import { eq } from "drizzle-orm";
import { getCurrentDate } from "../../lib/date/currentDate";
import type { DB } from "../db/client";
import { seriesTable } from "../db/schema";

export interface CreateSeriesInput {
  id: number;
  name: string;
  description?: string;
}

export const seriesRepository = (db: DB) => {
  const findById = async (id: number) => {
    return await db.query.seriesTable.findFirst({
      where: eq(seriesTable.id, id),
    });
  };

  const createIfNotExists = async (series: CreateSeriesInput) => {
    const currentTime = getCurrentDate().toISOString();

    await db
      .insert(seriesTable)
      .values({
        ...series,
        createdAt: currentTime,
      })
      .onConflictDoNothing();
  };

  return {
    createIfNotExists,
    findById,
  };
};

export type SeriesRepository = ReturnType<typeof seriesRepository>;
