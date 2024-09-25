import { handlePendingJobs } from "../src/services/jobScheduler.service.js";
import fileRepository from "../src/common/repositories/file.repository.js";
import unsplashService from "../src/common/services/unsplash.service.js";
import { status } from "../src/constants.js";

jest.mock("../src/common/repositories/file.repository.js");
jest.mock("../src/common/services/unsplash.service.js");
jest.mock("../src/common/utils/logger.util.js");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Job Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handlePendingJobs", () => {
    beforeAll(() => {
      jest.setTimeout(10000);
    });
    it("should execute overdue jobs immediately", async () => {
      const mockPendingJobs = [
        {
          fileName: `1_${status.PENDING}.json`,
          creationTime: new Date(Date.now() - 2000).toISOString(),
          delay: 1000
        }
      ];

      fileRepository.getAllPendingJobs.mockResolvedValue(mockPendingJobs);
      unsplashService.getRandomFoodImg.mockResolvedValue("mockImageUrl");

      await handlePendingJobs();

      await delay(2000);

      expect(fileRepository.renameJobFile).toHaveBeenCalledWith(
        `1_${status.PENDING}.json`,
        `1_${status.COMPLETED}.json`
      );
      expect(fileRepository.saveJob).toHaveBeenCalledWith(
        `1_${status.COMPLETED}.json`,
        expect.objectContaining({
          status: status.COMPLETED,
          result: "mockImageUrl",
          timestamp: expect.any(String)
        })
      );
    });
  });
});
