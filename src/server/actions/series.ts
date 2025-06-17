"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { seriesRepository } from "../repositories/series.repository";

// シリーズ詳細を取得するServer Action
export const getSeriesById = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  return await seriesRepo.findByIdWithWorks(seriesId);
});

// シリーズの基本情報のみ取得するServer Action
export const getSeriesBasicById = cache(async (seriesId: number) => {
  const db = await getDb();
  const seriesRepo = seriesRepository(db);
  return await seriesRepo.findById(seriesId);
});
