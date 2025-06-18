"use server";

import { cache } from "react";
import { getDb } from "../db/client";
import { makersRepository } from "../repositories/makers.repository";
import type { WorkItem } from "../../components/works/WorksList";

// 制作者詳細を取得するServer Action
export const getMakerById = cache(async (makerId: number) => {
  const db = await getDb();
  const makerRepo = makersRepository(db);
  const rawMaker = await makerRepo.findById(makerId);

  if (!rawMaker) {
    return null;
  }

  return {
    ...rawMaker,
    works: rawMaker.works
      .map((workRelation) => workRelation.work)
      .filter((work): work is NonNullable<typeof work> => work !== null)
      .map(
        (work): WorkItem => ({
          id: work.id,
          title: work.title,
          price: work.price,
          listPrice: work.listPrice,
          listImageUrl: work.listImageUrl,
          largeImageUrl: work.largeImageUrl,
          affiliateUrl: work.affiliateUrl,
          releaseDate: work.releaseDate,
          volume: work.volume,
          reviewCount: work.reviewCount,
          reviewAverageScore: work.reviewAverageScore,
          genres: [], // 制作者ページでは基本情報のみ
          makers: [],
          series: [],
        })
      ),
  };
});

// 制作者一覧を取得するServer Action
export const getAllMakers = cache(async (limit = 50, offset = 0) => {
  const db = await getDb();
  return await makersRepository(db).findAll(limit, offset);
});
