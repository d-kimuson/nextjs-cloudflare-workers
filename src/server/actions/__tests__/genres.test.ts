import { describe, it, expect, vi, beforeEach } from "vitest";
import { cache } from "react";
import { getDb } from "../../db/client";
import { genresRepository } from "../../repositories/genres.repository";
import { getAllGenresWithCounts, getGenreById } from "../genres";
import type { DB } from "../../db/client";
import type { GenresRepository } from "../../repositories/genres.repository";

// モック
vi.mock("react", () => ({
  cache: vi.fn((fn) => fn),
}));

vi.mock("../../db/client", () => ({
  getDb: vi.fn(),
}));

vi.mock("../../repositories/genres.repository", () => ({
  genresRepository: vi.fn(),
}));

const mockGetDb = vi.mocked(getDb);
const mockGenresRepository = vi.mocked(genresRepository);

describe("genres Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllGenresWithCounts", () => {
    it("should call genresRepository.findAllWithCounts with correct parameters", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockGenres = [
        { id: 1, name: "ジャンル1", createdAt: "2024-01-01", workCount: 10 },
        { id: 2, name: "ジャンル2", createdAt: "2024-01-02", workCount: 5 },
      ];

      const mockFindAllWithCounts = vi.fn().mockResolvedValue(mockGenres);
      const mockGenreRepo = {
        findAllWithCounts: mockFindAllWithCounts,
      } as Partial<GenresRepository> as GenresRepository;

      mockGetDb.mockResolvedValue(mockDb);
      mockGenresRepository.mockReturnValue(mockGenreRepo);

      // Act
      const result = await getAllGenresWithCounts(10, 0);

      // Assert
      expect(mockGetDb).toHaveBeenCalledOnce();
      expect(mockGenresRepository).toHaveBeenCalledWith(mockDb);
      expect(mockFindAllWithCounts).toHaveBeenCalledWith(10, 0);
      expect(result).toEqual(mockGenres);
    });

    it("should use default parameters when not provided", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockGenres: Array<{
        id: number;
        name: string;
        createdAt: string;
        workCount: number;
      }> = [];

      const mockFindAllWithCounts = vi.fn().mockResolvedValue(mockGenres);
      const mockGenreRepo = {
        findAllWithCounts: mockFindAllWithCounts,
      } as Partial<GenresRepository> as GenresRepository;

      mockGetDb.mockResolvedValue(mockDb);
      mockGenresRepository.mockReturnValue(mockGenreRepo);

      // Act
      const result = await getAllGenresWithCounts();

      // Assert
      expect(mockFindAllWithCounts).toHaveBeenCalledWith(20, 0);
      expect(result).toEqual(mockGenres);
    });
  });

  describe("getGenreById", () => {
    it("should call genresRepository.findById with correct genreId", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockGenre = {
        id: 1,
        name: "テストジャンル",
        createdAt: "2024-01-01",
        works: [],
      };

      const mockFindById = vi.fn().mockResolvedValue(mockGenre);
      const mockGenreRepo = {
        findById: mockFindById,
      } as Partial<GenresRepository> as GenresRepository;

      mockGetDb.mockResolvedValue(mockDb);
      mockGenresRepository.mockReturnValue(mockGenreRepo);

      // Act
      const result = await getGenreById(1);

      // Assert
      expect(mockGetDb).toHaveBeenCalledOnce();
      expect(mockGenresRepository).toHaveBeenCalledWith(mockDb);
      expect(mockFindById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGenre);
    });

    it("should return null when genre is not found", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockFindById = vi.fn().mockResolvedValue(null);
      const mockGenreRepo = {
        findById: mockFindById,
      } as Partial<GenresRepository> as GenresRepository;

      mockGetDb.mockResolvedValue(mockDb);
      mockGenresRepository.mockReturnValue(mockGenreRepo);

      // Act
      const result = await getGenreById(999);

      // Assert
      expect(result).toBeNull();
    });
  });
});
