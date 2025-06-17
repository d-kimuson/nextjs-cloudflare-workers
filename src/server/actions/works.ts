"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";

// 作品詳細を取得するServer Action
export const getWorkById = cache(async (workId: string) => {
  const db = await getDb();
  const workRepo = worksRepository(db);
  return await workRepo.findById(workId);
});
