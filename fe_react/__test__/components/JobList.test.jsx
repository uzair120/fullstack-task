import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobList from "../../components/JobList.js"; // Adjust the path as necessary
import { fetchJobs } from "../../utils/api.js"; // Mock this API function
import "@testing-library/jest-dom";

// Mock the API call
jest.mock("../../utils/api", () => ({
  fetchJobs: jest.fn()
}));

describe("JobList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays loading spinner while fetching jobs", async () => {
    fetchJobs.mockReturnValueOnce(new Promise(() => {})); // Mock a pending fetch

    render(<JobList />);

    expect(screen.getByTestId("loading-spinner")).toBeVisible();
  });

  test("displays error message on failed fetch", async () => {
    fetchJobs.mockRejectedValueOnce(new Error("Failed to load jobs"));

    render(<JobList />);

    await waitFor(() => {
      expect(screen.getByTestId("error-alert")).toBeVisible();
    });

    expect(screen.getByTestId("error-alert")).toHaveTextContent(
      "Failed to load jobs. Please try again later."
    );
  });

  test("displays 'No jobs found' message when job list is empty", async () => {
    fetchJobs.mockResolvedValueOnce({ jobs: [], totalPages: 1 });

    render(<JobList />);

    await waitFor(() => {
      expect(screen.getByTestId("no-jobs-message")).toBeVisible();
    });

    expect(screen.getByTestId("no-jobs-message")).toHaveTextContent(
      "No jobs found."
    );
  });

  test("displays job table when jobs are available", async () => {
    const mockJobs = [
      { jobId: "job1", status: "completed" },
      { jobId: "job2", status: "pending" }
    ];

    fetchJobs.mockResolvedValueOnce({ jobs: mockJobs, totalPages: 1 });

    render(<JobList />);

    await waitFor(() => {
      expect(screen.getByTestId("job-table")).toBeVisible();
      expect(screen.getByText("job1")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("job2")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
  });

  test("pagination works correctly", async () => {
    fetchJobs.mockResolvedValueOnce({
      jobs: [{ jobId: "job1", status: "completed" }],
      totalPages: 5
    });

    render(<JobList />);

    await waitFor(() => {
      expect(screen.getByTestId("pagination-control")).toBeVisible();
    });

    // Simulate page change
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

    await waitFor(() => {
      expect(fetchJobs).toHaveBeenCalledWith(2, 10); // Assuming 10 jobs per page
    });
  });
});
