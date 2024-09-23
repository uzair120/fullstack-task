import { text } from "express";
import { promises as fs } from "fs";
import path from "path";
import { status } from "../../constants.js";

// FOlder for saving jobs
const jobsDir = path.resolve(process.env.JOBS_PATH);

// Save or update a job
const saveJob = async (fileName, jobData) => {
  const filePath = path.join(jobsDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
};

// Get all job files
const getAllJobFiles = async () => {
  return await fs.readdir(jobsDir);
};

// Get job by id
const getJobById = async (jobId) => {
  try {
    // Read all files in the directory
    const files = await fs.readdir(jobsDir);

    // Create a regex to match the jobId + _ + one of the allowed strings
    const regex = new RegExp(
      `^${jobId}_(${status.PENDING}|${status.COMPLETED}|${status.ERROR})\\.json$`
    );

    // Filter the files that match the regex
    const matchingFiles = files.filter((file) => regex.test(file));

    // Ensure that there is only one or zero matching files
    if (matchingFiles.length === 0) {
      throw new Error(`No job found for ID: ${jobId}`);
    } else if (matchingFiles.length > 1) {
      throw new Error(
        `Multiple job files found for ID: ${jobId}. This should not happen.`
      );
    }

    // Get the file name
    const fileName = matchingFiles[0];
    const filePath = path.join(jobsDir, fileName);

    // Read the job file
    const job = await fs.readFile(filePath, "utf-8");
    return JSON.parse(job);
  } catch (error) {
    console.error(`Error getting job by ID ${jobId}:`, error.message);
    return null;
  }
};

// Rename job file (used for updating status in file name)
const renameJobFile = async (oldFileName, newFileName) => {
  const oldFilePath = path.join(jobsDir, oldFileName);
  const newFilePath = path.join(jobsDir, newFileName);
  await fs.rename(oldFilePath, newFilePath);
};

export default {
  saveJob,
  getAllJobFiles,
  getJobById,
  renameJobFile,
};
