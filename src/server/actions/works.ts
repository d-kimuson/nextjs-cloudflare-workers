"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { worksRepository } from "../repositories/works.repository";
import type { WorkItem } from "../../components/works/WorksList";
import { transformToWorkItem, type RawWork } from "../utils/transformWorkItem";

// 作品詳細を取得するServer Action
export const getWorkById = cache(
  async (workId: string): Promise<WorkItem | null> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawWork = await worksRepo.findById(workId);

    if (!rawWork) {
      return null;
    }

    return transformToWorkItem(rawWork as RawWork);
  }
);

// ジャンルIDから作品一覧を取得するServer Action
export const getWorksByGenreId = cache(
  async (
    genreId: number,
    options?: { limit?: number; offset?: number }
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawData = await worksRepo.findByGenreId(genreId, options);

    return rawData
      .map((item) => item.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map((work) => transformToWorkItem(work as RawWork));
  }
);

// タイトルから作品を検索するServer Action
export const searchWorksByTitle = cache(
  async (
    searchTerm: string,
    options?: { limit?: number }
  ): Promise<WorkItem[]> => {
    const db = await getDb();
    const worksRepo = worksRepository(db);
    const rawWorks = await worksRepo.searchByTitle(searchTerm, options);

    return rawWorks.map((work) => transformToWorkItem(work as RawWork));
  }
);
