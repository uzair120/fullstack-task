import jobService from "../src/services/job.service.js";
import fileRepository from "../src/common/repositories/file.repository.js";
import UnsplashService from "../src/common/services/unsplash.service.js";
import { v4 as uuidv4 } from "uuid";
import { status } from "../src/constants.js";

jest.mock("uuid");
jest.mock("../src/common/repositories/file.repository.js");
jest.mock("../src/common/services/unsplash.service.js");

beforeAll((done) => {
  process.env.JOB_MIN_INTERVAL = 0;
  process.env.JOB_MAX_INTERVAL = 0;
  done();
});

describe("Job Service", () => {
  jest.useFakeTimers();

  it("should create a new job and return the job ID immediately", async () => {
    const mockJobId = "mock-job-id";
    const mockImageUrl = "http://mock-image-url.com";

    jest.spyOn(require("uuid"), "v4").mockReturnValue(mockJobId);

    UnsplashService.getRandomFoodImg.mockResolvedValue(mockImageUrl);

    const jobId = await jobService.createJob();

    expect(fileRepository.saveJob).toHaveBeenCalledWith(
      expect.stringContaining(`${mockJobId}_${status.PENDING}.json`),
      expect.objectContaining({ status: status.PENDING })
    );

    jest.advanceTimersByTime(10000);

    await Promise.resolve();

    expect(UnsplashService.getRandomFoodImg).toHaveBeenCalled();
  });

  describe("getAllJobs", () => {
    it("should return paginated jobs", async () => {
      const mockFiles = ["123_PENDING.json", "456_COMPLETED.json"];
      fileRepository.getAllJobFiles.mockResolvedValue(mockFiles);

      const result = await jobService.getAllJobs(1, 2);

      expect(result.jobs.length).toBe(2);
      expect(result.jobs[0].jobId).toBe("123");
      expect(fileRepository.getAllJobFiles).toHaveBeenCalled();
    });
  });

  describe("getJobById", () => {
    it("should return job by ID", async () => {
      const mockJob = { jobId: "123", status: "COMPLETED" };
      fileRepository.getJobById.mockResolvedValue(mockJob);

      const result = await jobService.getJobById("123");

      expect(result).toEqual(mockJob);
      expect(fileRepository.getJobById).toHaveBeenCalledWith("123");
    });
  });
});
