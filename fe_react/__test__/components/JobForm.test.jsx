import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobForm from "../../components/JobForm.js";
import { createJob } from "../../utils/api.js";

// Mock the API call
jest.mock("../../utils/api.js", () => ({
  createJob: jest.fn()
}));

describe("JobForm Component", () => {
  const mockOnJobCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the "Create Job" button', () => {
    render(<JobForm onJobCreated={mockOnJobCreated} />);

    const createButton = screen.getByTestId("create-job-button");
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent("Create Job");
  });

  test('opens the dialog when "Create Job" button is clicked', () => {
    render(<JobForm onJobCreated={mockOnJobCreated} />);

    fireEvent.click(screen.getByTestId("create-job-button"));
    expect(screen.getByTestId("job-dialog")).toBeVisible();
  });

  test("displays error message when job creation fails", async () => {
    createJob.mockRejectedValueOnce(new Error("API Error"));

    render(<JobForm onJobCreated={mockOnJobCreated} />);

    fireEvent.click(screen.getByTestId("create-job-button"));
    fireEvent.click(screen.getByTestId("confirm-button"));

    await waitFor(() => {
      const errorAlert = screen.getByTestId("error-alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(
        "Failed to create the job. Please try again."
      );
    });
  });

  test("calls onJobCreated when job is successfully created", async () => {
    const mockJob = { id: 1 };
    createJob.mockResolvedValueOnce(mockJob);

    render(<JobForm onJobCreated={mockOnJobCreated} />);

    fireEvent.click(screen.getByTestId("create-job-button"));
    fireEvent.click(screen.getByTestId("confirm-button"));

    await waitFor(() => expect(mockOnJobCreated).toHaveBeenCalledWith(mockJob));
  });
});
