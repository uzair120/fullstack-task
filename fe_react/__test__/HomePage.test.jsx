import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../pages/HomePage.js";
import "@testing-library/jest-dom";

jest.mock("../components/JobForm.js", () => (props) => (
  <div data-testid="job-form-mock">
    <button
      onClick={() => props.onJobCreated({ jobId: "123", status: "pending" })}
    >
      Create Job
    </button>
  </div>
));

jest.mock("../components/JobList", () => () => (
  <div data-testid="job-list-mock">Job List</div>
));

describe("HomePage Component", () => {
  test("renders the homepage title", () => {
    render(<HomePage />);

    // Check  title 'Job Manager' is rendered
    expect(screen.getByTestId("homepage-title")).toBeInTheDocument();
    expect(screen.getByTestId("homepage-title")).toHaveTextContent(
      "Job Manager"
    );
  });

  test("renders the JobForm component", () => {
    render(<HomePage />);

    expect(screen.getByTestId("job-form-mock")).toBeInTheDocument();
  });

  test("renders the JobList component", () => {
    render(<HomePage />);

    expect(screen.getByTestId("job-list-mock")).toBeInTheDocument();
    expect(screen.getByTestId("job-list-mock")).toHaveTextContent("Job List");
  });

  test("handles job creation via JobForm", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(<HomePage />);

    fireEvent.click(screen.getByText("Create Job"));

    expect(consoleSpy).toHaveBeenCalledWith("New Job Created:", {
      jobId: "123",
      status: "pending"
    });

    consoleSpy.mockRestore();
  });
});
