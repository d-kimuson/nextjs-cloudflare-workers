import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../../db/client";
import type { DB } from "../../db/client";
import { worksRepository } from "../../repositories/works.repository";
import type { WorksRepository } from "../../repositories/works.repository";
import { getWorkById } from "../works";

// モックの設定
vi.mock("../../db/client");
vi.mock("../../repositories/works.repository");

const mockGetDb = vi.mocked(getDb);
const mockWorksRepository = vi.mocked(worksRepository);

describe("works Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWorkById", () => {
    it("should call worksRepository.findById with correct workId", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockWork = {
        id: "test-work-id",
        title: "Test Work",
        price: 1000,
        releaseDate: "2024-01-01",
        genres: [],
        makers: [],
        series: [],
        sampleLargeImages: [],
        sampleSmallImages: [],
      };

      const mockFindById = vi.fn().mockResolvedValue(mockWork);
      const mockWorkRepo = {
        findById: mockFindById,
      } as Partial<WorksRepository> as WorksRepository;

      mockGetDb.mockReturnValue(mockDb);
      mockWorksRepository.mockReturnValue(mockWorkRepo);

      // Act
      const result = await getWorkById("test-work-id");

      // Assert
      expect(mockGetDb).toHaveBeenCalledOnce();
      expect(mockWorksRepository).toHaveBeenCalledWith(mockDb);
      expect(mockFindById).toHaveBeenCalledWith("test-work-id");
      expect(result).toEqual(mockWork);
    });

    it("should return null when work is not found", async () => {
      // Arrange
      const mockDb = {} as DB;
      const mockFindById = vi.fn().mockResolvedValue(null);
      const mockWorkRepo = {
        findById: mockFindById,
      } as Partial<WorksRepository> as WorksRepository;

      mockGetDb.mockReturnValue(mockDb);
      mockWorksRepository.mockReturnValue(mockWorkRepo);

      // Act
      const result = await getWorkById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });
});
