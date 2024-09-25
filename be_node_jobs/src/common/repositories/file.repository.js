import { promises as fs } from "fs";
import path from "path";
import { status } from "../../constants.js";

// FOlder for saving jobs
const jobsDir = path.resolve(process.env.JOBS_PATH || "jobs");

const saveJob = async (fileName, jobData) => {
  const filePath = path.join(jobsDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
};
const getAllJobFiles = async () => {
  const files = await fs.readdir(jobsDir);

  // Map files to an array of objects with filename and creation datetime
  const filesWithStats = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(jobsDir, file);
      const stats = await fs.stat(filePath); // file stats
      return { file, birthtime: stats.birthtime };
    })
  );

  // Sort the files by birthtime (creation time)
  filesWithStats.sort((a, b) => b.birthtime - a.birthtime); // sorting by creation date cpmparison.

  // Return only the filenames in sorted order
  return filesWithStats.map((fileWithStats) => fileWithStats.file);
};

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

    if (matchingFiles.length === 0) {
      throw new Error(`No job found for ID: ${jobId}`);
    } else if (matchingFiles.length > 1) {
      throw new Error(
        `Multiple job files found for ID: ${jobId}. This should not happen.`
      );
    }

    const fileName = matchingFiles[0];
    const filePath = path.join(jobsDir, fileName);

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

const getAllPendingJobs = async () => {};

export default {
  saveJob,
  getAllJobFiles,
  getJobById,
  renameJobFile,
  getAllPendingJobs
};
