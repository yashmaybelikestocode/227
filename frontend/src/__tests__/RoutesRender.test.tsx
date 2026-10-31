import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { OriginalCommentProvider } from "../context/OriginalCommentContext";
import { AppContent } from "../App";

describe("All route smoke tests", () => {
  it("renders Start page at /", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    expect(screen.getByText("Find out why your code is the way it is")).toBeInTheDocument();
  });

  it("renders Results page at /results", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/results?q=retry"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId("results-title")).toBeInTheDocument();
    });
  });

  it("renders Answer page at /answer/ans_httpcache_retry", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/answer/ans_httpcache_retry"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Why do we retry failed requests?")).toBeInTheDocument();
    });
  });

  it("renders Code file list at /code", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/code"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Project Code Files")).toBeInTheDocument();
    });
  });

  it("renders Code file detail at /code/src/retry.py", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/code/src/retry.py"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("retry.py")).toBeInTheDocument();
    });
  });

  it("renders Pull requests list at /pulls", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/pulls"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Pull Requests")).toBeInTheDocument();
    });
  });

  it("renders Pull request detail at /pull/176", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/pull/176"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Implement exponential backoff retry for transient network timeouts")).toBeInTheDocument();
    });
  });

  it("renders Check page at /check", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/check"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    expect(screen.getByText("Check a new idea against the history")).toBeInTheDocument();
  });

  it("renders Evaluate page at /evaluate", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/evaluate"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Blind test")).toBeInTheDocument();
    });
  });

  it("renders Help page at /help", async () => {
    render(
      <OriginalCommentProvider>
        <MemoryRouter initialEntries={["/help"]}>
          <AppContent />
        </MemoryRouter>
      </OriginalCommentProvider>
    );
    expect(screen.getByText("Help & Guide")).toBeInTheDocument();
  });
});
