import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from "@mui/material";
import { ArrowRight } from "@mui/icons-material";

const JobTable = ({ jobs, onJobClick }) => {
  const getStatusChip = (status) => {
    let color = "default";
    let label = "";

    switch (status.toLowerCase()) {
      case "completed":
        color = "success";
        label = "Completed";
        break;
      case "error":
        color = "error";
        label = "Error";
        break;
      case "pending":
        color = "primary";
        label = "Pending";
        break;
      default:
        label = status;
    }

    return <Chip label={label} color={color} />;
  };

  return (
    <TableContainer component={Paper}>
      <Table data-testid="job-table">
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                fontWeight: "bold"
              }}
            >
              Job ID
            </TableCell>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                fontWeight: "bold"
              }}
            >
              Status
            </TableCell>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                fontWeight: "bold"
              }}
            ></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs &&
            jobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell data-testid={`job-id-${job.jobId}`} align="center">
                  {job.jobId.slice(0, 8)}
                </TableCell>
                <TableCell
                  align="center"
                  data-testid={`status-chip-${job.jobId}`}
                >
                  {getStatusChip(job.status)}
                </TableCell>
                <TableCell align="center">
                  <Button
                    onClick={() => onJobClick(job)}
                    endIcon={<ArrowRight />}
                    disabled={job.status !== "completed"}
                    data-testid={`btn-detail-${job.jobId}`}
                  >
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JobTable;
