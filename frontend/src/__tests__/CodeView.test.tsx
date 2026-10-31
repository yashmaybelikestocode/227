import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { CodePage } from "../pages/CodePage";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";

describe("Code view", () => {
  it("the 'Show only lines with a discussion' toggle hides plain code blocks", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/code/src/retry.py"]}>
          <Routes>
            <Route path="/code/*" element={<CodePage />} />
          </Routes>
        </MemoryRouter>
      </OriginalCommentProvider>
    );

    // Wait for file view to load
    await waitFor(
      () => {
        expect(screen.getByText("retry.py")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Initially, plain code blocks are rendered
    const plainBlocks = screen.getAllByTestId("plain-code-block");
    expect(plainBlocks.length).toBeGreaterThan(0);
    expect(screen.queryByTestId("plain-code-collapsed")).not.toBeInTheDocument();

    // Click toggle button
    const toggleBtn = screen.getByTestId("toggle-discussion-lines-btn");
    fireEvent.click(toggleBtn);

    // Plain code blocks are hidden and replaced with collapsed indicators
    await waitFor(() => {
      expect(screen.queryByTestId("plain-code-block")).not.toBeInTheDocument();
      expect(screen.getAllByTestId("plain-code-collapsed").length).toBeGreaterThan(0);
    });

    // Discussion blocks still present
    expect(screen.getByTestId("thread-block")).toBeInTheDocument();
  });

  it("a thread with a reversed later note shows 'Undone later'", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/code/src/retry.py"]}>
          <Routes>
            <Route path="/code/*" element={<CodePage />} />
          </Routes>
        </MemoryRouter>
      </OriginalCommentProvider>
    );

    await waitFor(
      () => {
        expect(screen.getByText("retry.py")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // The later note with effect: "reversed" should display "Undone later"
    const undoneLaterPill = screen.getByTestId("effect-pill-reversed");
    expect(undoneLaterPill).toBeInTheDocument();
    expect(undoneLaterPill).toHaveTextContent("Undone later");
    expect(screen.getByText(/Health check retry was removed/i)).toBeInTheDocument();
  });
});
