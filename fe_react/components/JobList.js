import React, { useEffect, useState, useCallback } from "react";
import { fetchJobs } from "../utils/api";
import { CircularProgress, Alert, Pagination, Typography } from "@mui/material";
import JobPopup from "./JobPopup";
import JobTable from "./JobTable";
import { Grid2 } from "@mui/material";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 10;

  const loadJobs = useCallback(
    async (page) => {
      try {
        setError(null);
        const response = await fetchJobs(page, jobsPerPage);
        setLoading(false);
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
      } catch (err) {
        setLoading(false);
        setError("Failed to load jobs. Please try again later.");
      }
    },
    [jobsPerPage]
  );

  useEffect(() => {
    setLoading(true);
    loadJobs(page);

    const interval = setInterval(() => {
      loadJobs(page);
    }, 5000);

    return () => clearInterval(interval); //cleanup interval
  }, [page, loadJobs]);

  const handleJobClick = (job) => {
    if (job.status === "completed") {
      setSelectedJob(job);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div>
      {loading ? (
        <CircularProgress data-testid="loading-spinner" />
      ) : error ? (
        <Alert severity="error" data-testid="error-alert">
          {error}
        </Alert>
      ) : (
        <div>
          <JobTable jobs={jobs} onJobClick={handleJobClick} />
          {jobs.length === 0 ? (
            <Typography
              variant="h6"
              align="center"
              pt={10}
              gutterBottom
              data-testid="no-jobs-message"
            >
              No jobs found.
            </Typography>
          ) : (
            <Grid2
              container
              justifyContent="center"
              style={{ marginTop: "20px" }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                data-testid="pagination-control"
              />
            </Grid2>
          )}
        </div>
      )}

      {selectedJob && (
        <JobPopup
          jobId={selectedJob.jobId}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default JobList;
