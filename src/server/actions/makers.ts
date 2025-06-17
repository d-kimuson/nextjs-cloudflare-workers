"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { makersRepository } from "../repositories/makers.repository";

// 制作者詳細を取得するServer Action
export const getMakerById = cache(async (makerId: number) => {
  const db = await getDb();
  const makerRepo = makersRepository(db);
  return await makerRepo.findById(makerId);
});

// 制作者一覧を取得するServer Action
export const getAllMakers = cache(async (limit = 50, offset = 0) => {
  const db = await getDb();
  return await makersRepository(db).findAll(limit, offset);
});
