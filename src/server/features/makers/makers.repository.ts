import { count, desc, eq, sql } from "drizzle-orm";
import type { DB } from "../../db/client";
import { makersTable, workMakerTable } from "../../db/schema";
import { getCurrentDate } from "../../../lib/date/currentDate";

export interface CreateMakerInput {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  externalUrl?: string;
}

export const makersRepository = (db: DB) => {
  const createIfNotExists = async (maker: CreateMakerInput) => {
    const currentTime = getCurrentDate().toISOString();

    const newAuthor = {
      ...maker,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    await db.insert(makersTable).values(newAuthor).onConflictDoNothing();
  };

  const findById = async (id: number) => {
    return db.query.makersTable.findFirst({
      where: eq(makersTable.id, id),
      with: {
        works: {
          with: {
            work: true,
          },
        },
      },
    });
  };

  const findAll = async (limit = 50, offset = 0) => {
    return await db
      .select({
        id: makersTable.id,
        name: makersTable.name,
        createdAt: makersTable.createdAt,
        updatedAt: makersTable.updatedAt,
        workCount: sql<number>`count(${workMakerTable.workId})`.as(
          "work_count",
        ),
      })
      .from(makersTable)
      .leftJoin(workMakerTable, eq(makersTable.id, workMakerTable.makerId))
      .groupBy(makersTable.id)
      .orderBy(sql`work_count desc`)
      .limit(limit)
      .offset(offset);
  };

  const countAll = async () => {
    const result = await db.select({ count: count() }).from(makersTable);

    return result[0]?.count ?? 0;
  };

  return {
    createIfNotExists,
    findById,
    findAll,
    countAll,
  };
};

export type MakersRepository = ReturnType<typeof makersRepository>;
