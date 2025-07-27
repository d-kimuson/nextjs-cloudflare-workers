import { and, desc, eq } from "drizzle-orm";
import { getCurrentDate } from "../../../lib/date/currentDate";
import type { DB } from "../../db/client";
import { curatedMakersTable, makersTable } from "../../db/schema";

export interface CreateCuratedMakerInput {
  makerId: number;
  priority?: number;
  isActive?: boolean;
  description?: string;
}

export interface UpdateCuratedMakerInput {
  priority?: number;
  isActive?: boolean;
  description?: string;
}

export const curatedMakersRepository = (db: DB) => {
  const create = async (input: CreateCuratedMakerInput) => {
    const currentTime = getCurrentDate().toISOString();

    const newCuratedMaker = {
      ...input,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    await db.insert(curatedMakersTable).values(newCuratedMaker);
  };

  const createByMakerName = async (
    makerName: string,
    input: Omit<CreateCuratedMakerInput, "makerId">,
  ) => {
    // 作者名から作者IDを取得
    const maker = await db.query.makersTable.findFirst({
      where: eq(makersTable.name, makerName),
    });

    if (!maker) {
      throw new Error(`Maker not found: ${makerName}`);
    }

    await create({
      ...input,
      makerId: maker.id,
    });

    return maker;
  };

  const findAll = async () => {
    return await db.query.curatedMakersTable.findMany({
      with: {
        maker: true,
      },
      orderBy: [
        desc(curatedMakersTable.priority),
        desc(curatedMakersTable.createdAt),
      ],
    });
  };

  const findActive = async () => {
    return await db.query.curatedMakersTable.findMany({
      where: eq(curatedMakersTable.isActive, true),
      with: {
        maker: true,
      },
      orderBy: [
        desc(curatedMakersTable.priority),
        desc(curatedMakersTable.createdAt),
      ],
    });
  };

  const findByMakerId = async (makerId: number) => {
    return await db.query.curatedMakersTable.findFirst({
      where: eq(curatedMakersTable.makerId, makerId),
      with: {
        maker: true,
      },
    });
  };

  const update = async (id: number, input: UpdateCuratedMakerInput) => {
    const currentTime = getCurrentDate().toISOString();

    await db
      .update(curatedMakersTable)
      .set({
        ...input,
        updatedAt: currentTime,
      })
      .where(eq(curatedMakersTable.id, id));
  };

  const deleteById = async (id: number) => {
    await db.delete(curatedMakersTable).where(eq(curatedMakersTable.id, id));
  };

  const deleteByMakerId = async (makerId: number) => {
    await db
      .delete(curatedMakersTable)
      .where(eq(curatedMakersTable.makerId, makerId));
  };

  return {
    create,
    createByMakerName,
    findAll,
    findActive,
    findByMakerId,
    update,
    deleteById,
    deleteByMakerId,
  };
};

export type CuratedMakersRepository = ReturnType<
  typeof curatedMakersRepository
>;
