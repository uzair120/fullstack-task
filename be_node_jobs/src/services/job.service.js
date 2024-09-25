import { v4 as uuidv4 } from "uuid";
import fileRepository from "../common/repositories/file.repository.js";
import UnsplashService from "../common/services/unsplash.service.js";
import { logInfo, logError } from "../common/utils/logger.util.js";
import { status } from "../constants.js";
const createJob = async () => {
  const jobId = uuidv4();
  const jobFileName = `${jobId}_${status.PENDING}.json`;

  logInfo(`Creating new job with ID: ${jobId}`);

  const minSec = process.env.JOB_MIN_INTERVAL || 5;
  const maxSec = process.env.JOB_MAX_INTERVAL || 300;
  // Simulate a delay between X seconds and Y minutes
  const delay =
    (Math.floor(Math.random() * (maxSec / minSec - 1 + 1)) + 1) *
    (minSec * 1000);

  const creationTime = new Date().toISOString();

  // Save the job with status and delay
  await fileRepository.saveJob(jobFileName, {
    status: status.PENDING,
    creationTime,
    delay
  });

  // setImmediate Return job ID immediately first and then process the job
  setImmediate(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));

      const imageUrl = await UnsplashService.getRandomFoodImg();

      const newJobFileName = `${jobId}_${status.COMPLETED}.json`;
      await fileRepository.renameJobFile(jobFileName, newJobFileName);
      await fileRepository.saveJob(newJobFileName, {
        status: status.COMPLETED,
        result: imageUrl,
        timestamp: new Date().toISOString()
      });

      logInfo(`Job ${jobId} completed successfully.`);
    } catch (error) {
      logError(`Error processing job ${jobId}: ${error.message}`);

      const errorJobFileName = `${jobId}_${status.ERROR}.json`;
      const errorData = {
        status: status.ERROR,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      };

      try {
        await fileRepository.renameJobFile(jobFileName, errorJobFileName);
        await fileRepository.saveJob(errorJobFileName, errorData);
        logInfo(`Error details for job ${jobId} saved to ${errorJobFileName}`);
      } catch (fileError) {
        logError(
          `Failed to write error details for job ${jobId}: ${fileError.message}`
        );
      }
    }
  });

  return jobId;
};

// Get all jobs based on filenames (job ID and status in file names)
const getAllJobs = async (page = 1, perPage = 10) => {
  logInfo(`Getting all jobs ${page},${perPage}`);

  const files = await fileRepository.getAllJobFiles();

  const totalJobs = files.length;

  const totalPages = Math.ceil(totalJobs / perPage);

  const startIndex = (page - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalJobs);

  const paginatedFiles = files.slice(startIndex, endIndex);

  // Map the job files to structure (remove .json and return as Id and status separately)
  const jobs = paginatedFiles.map((fileName) => {
    const [jobId, status] = fileName.replace(".json", "").split("_");
    return { jobId, status };
  });

  return {
    jobs,
    totalPages,
    currentPage: page,
    perPage,
    totalJobs
  };
};

// Get job by ID from filename
const getJobById = async (jobId) => {
  logInfo(`Getting a job by ID: ${jobId}`);
  // const fileName = `${jobId}_${status.COMPLETED}.json`;
  return await fileRepository.getJobById(jobId);
};

export default {
  createJob,
  getAllJobs,
  getJobById
};
