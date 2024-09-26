import React, { useEffect, useState } from "react";
import { fetchJobById } from "../utils/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from "@mui/material";

const JobPopup = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true); // Track the open state

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      const fetchedJob = await fetchJobById(jobId);
      setJob(fetchedJob);
      setLoading(false);
    };

    loadJob();
  }, [jobId]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="job-popup"
    >
      <DialogTitle data-testid="job-id-title">Job ID: {jobId}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress data-testid="loading-spinner-dialog" />
        ) : (
          <div>
            {job?.status === "completed" && (
              <img
                src={job?.result}
                alt="Job Result"
                style={{ width: "100%" }}
                data-testid="job-result-image"
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobPopup;
