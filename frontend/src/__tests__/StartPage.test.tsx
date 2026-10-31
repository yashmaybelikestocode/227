import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StartPage } from "../pages/StartPage";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";

describe("StartPage", () => {
  it("rejects an invalid GitHub link with a friendly message", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </OriginalCommentProvider>
    );

    // Select the "Paste a GitHub link" radio
    const pasteRadio = screen.getByLabelText("Paste a GitHub link");
    fireEvent.click(pasteRadio);

    // Enter an invalid link
    const input = screen.getByLabelText("GitHub repository link");
    fireEvent.change(input, { target: { value: "not-a-valid-link" } });

    // Submit form
    const submitBtn = screen.getByText("Show me the history");
    fireEvent.click(submitBtn);

    // Friendly error message should be displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          "Please enter a valid GitHub repository link in the format github.com/owner/name."
        )
      ).toBeInTheDocument();
    });
  });
});
