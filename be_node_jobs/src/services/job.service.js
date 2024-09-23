import { v4 as uuidv4 } from "uuid";
import fileRepository from "../common/repositories/file.repository.js";
import UnsplashService from "../common/services/unsplash.service.js";
import { logInfo, logError } from "../common/utils/logger.util.js";
import { status } from "../constants.js";

// Create a new job for a request
const createJob = async () => {
  const jobId = uuidv4();
  const jobFileName = `${jobId}_${status.PENDING}.json`;

  // Log job creation
  logInfo(`Creatin new job with ID: ${jobId}`);

  // Save the job as pending
  await fileRepository.saveJob(jobFileName, { status: status.PENDING });

  // for immediate return of job ID using setImmediate
  setImmediate(async () => {
    try {
      // Simulate dely of 5 second to 5 minutes. (randomly)
      const delay = Math.random() * (300000 - 5000) + 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Get the image from Unsplash API
      const imageUrl = await UnsplashService.getRandomFoodImg();

      // Update the job file as completed
      const newJobFileName = `${jobId}_${status.COMPLETED}.json`;
      await fileRepository.renameJobFile(jobFileName, newJobFileName);
      await fileRepository.saveJob(newJobFileName, {
        status: status.COMPLETED,
        result: imageUrl,
        timestamp: new Date().toISOString(),
      });

      logInfo(`Job ${jobId} completed successfully.`);
    } catch (error) {
      logError(`ErroR processing job ${jobId}: ${error.message}`);

      // Write the error details to an error file
      const errorJobFileName = `${jobId}_${status.ERROR}.json`;
      const errorData = {
        status: status.ERROR,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      };

      try {
        // Save the error to a new job-specific error file
        await fileRepository.renameJobFile(jobFileName, errorJobFileName);

        await fileRepository.saveJob(errorJobFileName, errorData);
        logInfo(`Error details for job ${jobId} saved to ${errorJobFileName}`);
      } catch (fileError) {
        // Log an additional error if saving the error file fails
        logError(
          `Failed to write error details for job ${jobId}: ${fileError.message}`
        );
      }
    }
  });

  return jobId;
};

// Get all jobs based on filenames (job ID and status in file names)
const getAllJobs = async () => {
  logInfo(`Getting all job`);
  const files = await fileRepository.getAllJobFiles();
  return files.map((fileName) => {
    const [jobId, status] = fileName.replace(".json", "").split("_");
    return { jobId, status };
  });
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
  getJobById,
};
