import type { DB } from "../../db/client";
import { genresRepository } from "./genres.repository";
import { ResultAsync } from "neverthrow";

export const genreService = (db: DB) => {
  const genresRepositoryClient = genresRepository(db);

  const getGenreById = ResultAsync.fromThrowable(async (genreId: number) => {
    return await genresRepositoryClient.findById(genreId);
  });

  const getAllGenresWithCounts = ResultAsync.fromThrowable(
    async (limit = 20, offset = 0) => {
      return await genresRepositoryClient.findAllWithCounts(limit, offset);
    },
  );

  return {
    getGenreById,
    getAllGenresWithCounts,
  };
};
