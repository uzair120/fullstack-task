import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JobTable from "../../components/JobTable.js"; // Adjust path as necessary
import "@testing-library/jest-dom";

describe("JobTable Component", () => {
  const mockJobs = [
    { jobId: "job1", status: "completed" },
    { jobId: "job2", status: "pending" },
    { jobId: "job3", status: "error" }
  ];
  const mockOnJobClick = jest.fn();

  beforeEach(() => {
    render(<JobTable jobs={mockJobs} onJobClick={mockOnJobClick} />);
  });

  test("renders job table with correct job data", () => {
    expect(screen.getByTestId("job-table")).toBeInTheDocument();

    mockJobs.forEach((job) => {
      expect(screen.getByTestId(`job-id-${job.jobId}`)).toHaveTextContent(
        job.jobId.slice(0, 8)
      );
      expect(
        screen.getByTestId(`status-chip-${job.jobId}`)
      ).toBeInTheDocument();
    });
  });

  test("calls onJobClick when 'Detail' button for a completed job is clicked", () => {
    const completedJob = mockJobs.find((job) => job.status === "completed");

    fireEvent.click(screen.getByTestId(`btn-detail-${completedJob.jobId}`));

    expect(mockOnJobClick).toHaveBeenCalledWith(completedJob);
  });

  test("disables 'Detail' button for jobs that are not completed", () => {
    const pendingJob = mockJobs.find((job) => job.status === "pending");
    const errorJob = mockJobs.find((job) => job.status === "error");

    expect(screen.getByTestId(`btn-detail-${pendingJob.jobId}`)).toBeDisabled();
    expect(screen.getByTestId(`btn-detail-${errorJob.jobId}`)).toBeDisabled();
  });
});
