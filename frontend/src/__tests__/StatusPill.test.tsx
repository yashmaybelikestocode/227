import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { StatusPill } from "../components/StatusPill";

describe("StatusPill component", () => {
  it("renders Decided for accepted status with check mark icon", () => {
    render(<StatusPill status="accepted" />);
    const pill = screen.getByTestId("status-pill-accepted");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("Decided");
    expect(pill.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Decided against for rejected status with cross icon", () => {
    render(<StatusPill status="rejected" />);
    const pill = screen.getByTestId("status-pill-rejected");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("Decided against");
    expect(pill.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Postponed for deferred status with clock icon", () => {
    render(<StatusPill status="deferred" />);
    const pill = screen.getByTestId("status-pill-deferred");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("Postponed");
    expect(pill.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Still open for unresolved status with question mark icon", () => {
    render(<StatusPill status="unresolved" />);
    const pill = screen.getByTestId("status-pill-unresolved");
    expect(pill).toBeInTheDocument();
    expect(pill).toHaveTextContent("Still open");
    expect(pill.querySelector("svg")).toBeInTheDocument();
  });
});
