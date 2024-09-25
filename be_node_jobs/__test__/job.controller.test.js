import request from "supertest";
import { app } from "../app.js";
import jobService from "../src/services/job.service.js";
import http from "http";

jest.mock("../src/services/job.service.js");

let server;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(done);
});

afterAll((done) => {
  server.close(done);
});

describe("Job Controller", () => {
  describe("POST /jobs", () => {
    it("should create a new job and return job ID", async () => {
      const mockJobId = "123";
      jobService.createJob.mockResolvedValue(mockJobId);

      const response = await request(server).post("/jobs");

      expect(response.status).toBe(201);
      expect(response.body.jobId).toBe(mockJobId);
      expect(jobService.createJob).toHaveBeenCalled();
    });

    it("should return 500 if job creation fails", async () => {
      jobService.createJob.mockRejectedValue(new Error("Error"));

      const response = await request(server).post("/jobs");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error creating a job");
    });
  });

  describe("GET /jobs", () => {
    it("should return all jobs", async () => {
      const mockJobs = { jobs: [], totalPages: 1, currentPage: 1, perPage: 10 };
      jobService.getAllJobs.mockResolvedValue(mockJobs);

      const response = await request(server).get("/jobs");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJobs);
      expect(jobService.getAllJobs).toHaveBeenCalled();
    });

    it("should return 500 if fetching jobs fails", async () => {
      jobService.getAllJobs.mockRejectedValue(new Error("Error"));

      const response = await request(server).get("/jobs");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error fetching jobs");
    });
  });

  describe("GET /jobs/:id", () => {
    it("should return job by ID", async () => {
      const mockJob = { jobId: "123", status: "COMPLETED" };
      jobService.getJobById.mockResolvedValue(mockJob);

      const response = await request(server).get("/jobs/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockJob);
      expect(jobService.getJobById).toHaveBeenCalledWith("123");
    });

    it("should return 404 if job is not found", async () => {
      jobService.getJobById.mockResolvedValue(null);

      const response = await request(server).get("/jobs/123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Job not found");
    });

    it("should return 500 if fetching job fails", async () => {
      jobService.getJobById.mockRejectedValue(new Error("Error"));

      const response = await request(server).get("/jobs/123");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error fetchin job");
    });
  });
});
