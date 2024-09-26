import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert
} from "@mui/material";
import { createJob } from "../utils/api";
import AddIcon from "@mui/icons-material/Add";

const JobForm = ({ onJobCreated }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleClickOpen = () => {
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateJob = async () => {
    try {
      setError(null);
      const job = await createJob();
      onJobCreated(job);
      setOpen(false);
    } catch (err) {
      setError("Failed to create the job. Please try again.");
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ marginLeft: "16px" }}
        data-testid="create-job-button"
      >
        Create Job
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        data-testid="job-dialog"
      >
        <DialogTitle id="alert-dialog-title">{"Create a new Job?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to create a new job? This action will start a
            new job process.
          </DialogContentText>
          {error && (
            <Alert
              data-testid="error-alert"
              severity="error"
              sx={{ marginTop: "16px" }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateJob}
            color="primary"
            autoFocus
            data-testid="confirm-button"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobForm;
