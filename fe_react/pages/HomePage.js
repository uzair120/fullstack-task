import { Grid2, Box } from "@mui/material";
import JobList from "../components/JobList";
import JobForm from "../components/JobForm";
import { useState } from "react";

const HomePage = () => {
  const handleJobCreated = (newJob) => {
    console.log("New Job Created:", newJob);
  };

  return (
    <div style={{ width: "70%", margin: "0 auto" }}>
      <Grid2 container justifyContent="center">
        <Grid2 item="true" xs={12} textAlign="center">
          <h1 data-testid="homepage-title">Job Manager</h1>
        </Grid2>
      </Grid2>
      <Grid2 container justifyContent="flex-end">
        <Grid2 item="true">
          <JobForm data-testid="job-form" onJobCreated={handleJobCreated} />
        </Grid2>
      </Grid2>
      <Box sx={{ m: 2 }} />
      <JobList data-testid="job-list" />
    </div>
  );
};

export default HomePage;
