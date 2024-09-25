import jobService from "../services/job.service.js";

/**
 * POST /jobs
 * Create a new job
 * @param req
 * @return {JobId}
 */

const createJob = async (req, res) => {
  try {
    const jobId = await jobService.createJob();
    res.status(201).json({ jobId });
  } catch (error) {
    res.status(500).json({ error: "Error creating a job" });
  }
};

/**
 * GET /jobs
 * Get list of all jobs
 * @param req
 * @return {List}
 */

const getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs(
      req.query && req.query.page && parseInt(req.query.page),
      req.query && req.query.perPage && parseInt(req.query.perPage)
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

/**
 * GET /jobs/:id
 * Get a specific job by ID.
 * @param {JobId} req
 * @return {status}
 * @return {url}
 */

const getJobById = async (req, res) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Error fetchin job" });
  }
};

export default {
  createJob,
  getAllJobs,
  getJobById
};
