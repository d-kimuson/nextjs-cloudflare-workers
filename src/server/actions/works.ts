"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";

// 作品詳細を取得するServer Action
export const getWorkById = cache(async (workId: string) => {
  const db = await getDb();
  const worksRepo = worksRepository(db);
  return await worksRepo.findById(workId);
});

// ジャンルIDから作品一覧を取得するServer Action
export const getWorksByGenreId = cache(
  async (genreId: number, options?: { limit?: number; offset?: number }) => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    return await worksRepo.findByGenreId(genreId, options);
  }
);
