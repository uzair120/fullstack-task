import fileRepository from "../common/repositories/file.repository.js";
import unsplashService from "../common/services/unsplash.service.js";
import { logError, logInfo } from "../common/utils/logger.util.js";
import { status } from "../constants.js";

export const handlePendingJobs = async () => {
  logInfo(`Checking any pending jobs`);

  const pendingJobs = await fileRepository.getAllPendingJobs();
  pendingJobs.forEach(async (job) => {
    const { fileName, creationTime, delay } = job;
    const jobId = fileName.split("_")[0];
    const currentTime = new Date().getTime();
    const jobCreationTime = new Date(creationTime).getTime();

    const elapsedTime = currentTime - jobCreationTime;
    const remainingTime = delay - elapsedTime;

    if (remainingTime <= 0) {
      logInfo(`Executing overdue job ${jobId} immediately.`);
      await executeJobImmediately(jobId);
    } else {
      logInfo(`Scheduling job ${jobId} to run in ${remainingTime}ms.`);
      setTimeout(() => executeJobImmediately(jobId), remainingTime);
    }
  });
};

// Function to execute a job immediately
const executeJobImmediately = async (jobId) => {
  try {
    const imageUrl = await unsplashService.getRandomFoodImg();
    const newJobFileName = `${jobId}_${status.COMPLETED}.json`;

    await fileRepository.renameJobFile(
      `${jobId}_${status.PENDING}.json`,
      newJobFileName
    );

    await fileRepository.saveJob(newJobFileName, {
      status: status.COMPLETED,
      result: imageUrl,
      timestamp: new Date().toISOString()
    });

    logInfo(`Job ${jobId} completed successfully after restart.`);
  } catch (error) {
    logError(`Error processing job ${jobId}: ${error.message}`);
    await handleJobError(jobId, error);
  }
};

// Function to handle job errors
const handleJobError = async (jobId, error) => {
  const errorJobFileName = `${jobId}_${status.ERROR}.json`;
  const errorData = {
    status: status.ERROR,
    errorMessage: error.message,
    timestamp: new Date().toISOString()
  };

  try {
    await fileRepository.renameJobFile(
      `${jobId}_${status.PENDING}.json`,
      errorJobFileName
    );
    await fileRepository.saveJob(errorJobFileName, errorData);
    logInfo(`Error details for job ${jobId} saved to ${errorJobFileName}`);
  } catch (fileError) {
    logError(
      `Failed to write error details for job ${jobId}: ${fileError.message}`
    );
  }
};
