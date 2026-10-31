import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";
import { SourceButton } from "../components/SourceButton";
import { OriginalCommentPanel } from "../components/OriginalCommentPanel";
import { MOCK_POSTS } from "../mock/data";

describe("SourceButton and OriginalCommentPanel", () => {
  it("clicking a source button opens the panel and highlights the sentence with the matching id, and only that sentence", async () => {
    render(
      <OriginalCommentProvider>
        <div>
          <SourceButton evidenceId="p176_1.s2" posts={MOCK_POSTS} />
          <OriginalCommentPanel />
        </div>
      </OriginalCommentProvider>
    );

    // Initial state: panel not open
    expect(screen.queryByTestId("original-comment-panel")).not.toBeInTheDocument();

    // Click source button
    const sourceBtn = screen.getByTestId("source-button-p176_1.s2");
    fireEvent.click(sourceBtn);

    // Panel should now be open
    expect(screen.getByTestId("original-comment-panel")).toBeInTheDocument();
    expect(screen.getByText(/The original comment/i)).toBeInTheDocument();
    expect(screen.getByText(/You clicked:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Priya, 14 Mar").length).toBeGreaterThan(0);

    // Check highlighted sentence
    const highlighted = screen.getByTestId("highlighted-sentence");
    expect(highlighted).toBeInTheDocument();
    expect(highlighted).toHaveTextContent(
      "We decided to wait longer after each failed try, starting at half a second and doubling each time to spread load."
    );

    // Non-highlighted sentences should not have the highlight class or testid
    const nonHighlighted1 = screen.getByTestId("sentence-p176_1.s1");
    expect(nonHighlighted1).toBeInTheDocument();
    expect(nonHighlighted1).not.toHaveClass("bg-[#EDB8C4]/65");
  });

  it("Escape closes the panel and returns focus to the button", async () => {
    const user = userEvent.setup();

    render(
      <OriginalCommentProvider>
        <div>
          <SourceButton evidenceId="p176_1.s2" posts={MOCK_POSTS} />
          <OriginalCommentPanel />
        </div>
      </OriginalCommentProvider>
    );

    const sourceBtn = screen.getByTestId("source-button-p176_1.s2");
    sourceBtn.focus();
    expect(document.activeElement).toBe(sourceBtn);

    // Open panel
    await user.click(sourceBtn);
    expect(screen.getByTestId("original-comment-panel")).toBeInTheDocument();

    // Wait for focus to be in panel
    await waitFor(() => {
      expect(screen.getByLabelText("Close comment panel")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

    // Panel should close
    await waitFor(() => {
      expect(screen.queryByTestId("original-comment-panel")).not.toBeInTheDocument();
    });

    // Focus returns to the trigger button
    expect(document.activeElement).toBe(sourceBtn);
  });
});
