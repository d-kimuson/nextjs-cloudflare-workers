"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { genresRepository } from "../repositories/genres.repository";

// ジャンル一覧を作品数とセットで取得するServer Action
export const getAllGenresWithCounts = cache(async (limit = 20, offset = 0) => {
  const db = await getDb();
  return await genresRepository(db).findAllWithCounts(limit, offset);
});

// ジャンル詳細を取得するServer Action
export const getGenreById = cache(async (genreId: number) => {
  const db = await getDb();
  const genreRepo = genresRepository(db);
  return await genreRepo.findById(genreId);
});
