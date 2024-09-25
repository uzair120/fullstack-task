import { promises as fs } from "fs";
import fileRepository from "../src/common/repositories/file.repository.js";
import path from "path";
import { status } from "../src/constants.js";
jest.mock("fs/promises");

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    rename: jest.fn(),
    readFile: jest.fn()
  }
}));

beforeAll((done) => {
  process.env.JOBS_PATH = "jobs";
  done();
});

const mockJobDir = path.resolve(process.env.JOBS_PATH || "jobs");

describe("File Repository", () => {
  describe("saveJob", () => {
    it("should save job to the file system", async () => {
      const fileName = "job1.json";
      const jobData = { status: status.PENDING };

      await fileRepository.saveJob(fileName, jobData);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockJobDir, fileName),
        JSON.stringify(jobData, null, 2)
      );
    });
  });

  describe("getAllJobFiles", () => {
    it("should return all job files", async () => {
      const mockFiles = ["job1.json", "job2.json"];
      fs.readdir.mockResolvedValue(mockFiles);
      fs.stat.mockResolvedValue({ birthtime: new Date() });

      const result = await fileRepository.getAllJobFiles();

      expect(result).toEqual(mockFiles);
      expect(fs.readdir).toHaveBeenCalledWith(mockJobDir);
    });
  });

  describe("getJobById", () => {
    it("should return job by ID", async () => {
      const mockJob = { status: status.COMPLETED };
      const jobId = "job1";
      const fileName = `${jobId}_${status.COMPLETED}.json`;

      fs.readdir.mockResolvedValue([fileName]);
      fs.readFile.mockResolvedValue(JSON.stringify(mockJob));

      const result = await fileRepository.getJobById(jobId);

      expect(result).toEqual(mockJob);
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(mockJobDir, fileName),
        "utf-8"
      );
    });
  });

  describe("renameJobFile", () => {
    it("should rename job file", async () => {
      const oldFileName = "job1_PENDING.json";
      const newFileName = "job1_COMPLETED.json";

      await fileRepository.renameJobFile(oldFileName, newFileName);

      expect(fs.rename).toHaveBeenCalledWith(
        path.join(mockJobDir, oldFileName),
        path.join(mockJobDir, newFileName)
      );
    });
  });

  describe("getAllPendingJobs", () => {
    it("should return all pending jobs", async () => {
      const mockFiles = [
        "job1_pending.json",
        "job2_pending.json",
        "job3_completed.json"
      ];
      const mockJobData = [
        { jobId: "job1", status: status.PENDING },
        { jobId: "job2", status: status.PENDING }
      ];

      fs.readdir.mockResolvedValue(mockFiles);

      fs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockJobData[0]))
        .mockResolvedValueOnce(JSON.stringify(mockJobData[1]));

      const pendingJobs = await fileRepository.getAllPendingJobs();

      expect(fs.readdir).toHaveBeenCalledWith(mockJobDir);
      expect(pendingJobs).toHaveLength(2);
      expect(pendingJobs[0]).toEqual(
        expect.objectContaining({ jobId: "job1", status: status.PENDING })
      );
      expect(pendingJobs[1]).toEqual(
        expect.objectContaining({ jobId: "job2", status: status.PENDING })
      );
    });
  });
});
