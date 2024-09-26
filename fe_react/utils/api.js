import axios from "axios";
import { GET_A_JOB, GET_JOBS, POST_JOB } from "./jobs.url.js";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

export const fetchJobs = async (page, perPage) => {
  try {
    const response = await api.get(GET_JOBS, {
      params: {
        page,
        perPage
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const fetchJobById = async (jobId) => {
  try {
    const response = await api.get(`${GET_A_JOB}${jobId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

export const createJob = async () => {
  try {
    const response = await api.post(POST_JOB);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
};
