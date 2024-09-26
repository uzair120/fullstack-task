import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import JobPopup from "../../components/JobPopup.js"; // Adjust path as necessary
import { fetchJobById } from "../../utils/api.js"; // Mock this API function
import "@testing-library/jest-dom";

// Mock the API call
jest.mock("../../utils/api", () => ({
  fetchJobById: jest.fn()
}));

describe("JobPopup Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the job popup with the correct job ID", async () => {
    fetchJobById.mockResolvedValueOnce({
      jobId: "job1",
      status: "completed",
      result: "image-url"
    });

    render(<JobPopup jobId="job1" onClose={mockOnClose} />);

    expect(screen.getByTestId("job-popup")).toBeVisible();
    expect(screen.getByTestId("job-id-title")).toHaveTextContent(
      "Job ID: job1"
    );
  });

  test("displays a loading spinner while fetching the job details", async () => {
    fetchJobById.mockReturnValueOnce(new Promise(() => {})); // Simulate a pending fetch

    render(<JobPopup jobId="job1" onClose={mockOnClose} />);

    expect(screen.getByTestId("loading-spinner-dialog")).toBeVisible();
  });

  test("displays the job result image when the job is completed", async () => {
    fetchJobById.mockResolvedValueOnce({
      jobId: "job1",
      status: "completed",
      result: "image-url"
    });

    render(<JobPopup jobId="job1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("job-result-image")).toBeVisible();
      expect(screen.getByTestId("job-result-image")).toHaveAttribute(
        "src",
        "image-url"
      );
    });
  });

  test("does not display an image if the job status is not 'completed'", async () => {
    fetchJobById.mockResolvedValueOnce({ jobId: "job1", status: "pending" });

    render(<JobPopup jobId="job1" onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.queryByTestId("job-result-image")).not.toBeInTheDocument();
    });
  });
});
