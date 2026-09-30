import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

function Bomb(): never {
  throw new Error("TEST_ROUTE_FAILURE");
}

describe("RouteErrorBoundary", () => {
  it("isolates a specialist route failure into an accessible fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <RouteErrorBoundary label="Ecosistema">
        <Bomb />
      </RouteErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Ecosistema non è disponibile");
    expect(screen.getByText(/navigazione principale resta attiva/i)).toBeInTheDocument();
  });
});
