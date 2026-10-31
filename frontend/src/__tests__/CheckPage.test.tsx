import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { CheckPage } from "../pages/CheckPage";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";

describe("CheckPage", () => {
  it("returns the rejected-library decision for a matching text and the empty message otherwise", async () => {
    render(
      <OriginalCommentProvider>
        <CheckPage />
      </OriginalCommentProvider>
    );

    const textarea = screen.getByTestId("idea-textarea");
    const checkBtn = screen.getByTestId("check-history-btn");

    // Case 1: Matching text containing "library"
    fireEvent.change(textarea, {
      target: { value: "Should we use an external library like tenacity?" },
    });
    fireEvent.click(checkBtn);

    await waitFor(
      () => {
        expect(screen.getByTestId("check-matches-container")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText("Something like this came up before.")).toBeInTheDocument();
    expect(screen.getByText("Use an outside retry library")).toBeInTheDocument();
    expect(screen.getByTestId("status-pill-rejected")).toBeInTheDocument();

    // Case 2: Non-matching text
    fireEvent.change(textarea, {
      target: { value: "Let us rename the local variable from count to counter." },
    });
    fireEvent.click(checkBtn);

    await waitFor(
      () => {
        expect(screen.getByTestId("check-no-match")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(
      screen.getByText("Nothing similar was found in the discussions we looked at.")
    ).toBeInTheDocument();
  });
});
