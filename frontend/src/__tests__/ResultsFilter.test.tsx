import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { ResultsPage } from "../pages/ResultsPage";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";

describe("ResultsPage filters", () => {
  it("the keyword results filters reduce the list and update the count", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/results?q=exponential%20backoff&range=Last%206%20months&type=all"]}>
          <ResultsPage />
        </MemoryRouter>
      </OriginalCommentProvider>
    );

    // Wait for mock search to finish
    await waitFor(
      () => {
        expect(screen.getByTestId("results-title")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Initial count is total mock results
    const initialTitle = screen.getByTestId("results-title").textContent;
    expect(initialTitle).toContain("discussions found in");

    // Filter by type: Pull requests only
    const pullFilter = screen.getByTestId("filter-type-pull");
    fireEvent.click(pullFilter);

    // Count in title should update
    await waitFor(() => {
      const updatedTitle = screen.getByTestId("results-title").textContent;
      expect(updatedTitle).not.toBe(initialTitle);
    });

    // Filter by 5 or more comments
    const sizeFilter = screen.getByTestId("filter-size-five-plus");
    fireEvent.click(sizeFilter);

    await waitFor(() => {
      const furtherUpdatedTitle = screen.getByTestId("results-title").textContent;
      expect(furtherUpdatedTitle).toContain("discussions found");
    });
  });
});
