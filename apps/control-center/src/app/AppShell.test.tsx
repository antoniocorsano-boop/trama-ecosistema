import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("keeps the candidate explicitly read-only and progressively navigable", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell><p>contenuto</p></AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Control Center" })).toBeInTheDocument();
    expect(screen.getByLabelText("Modalità sola lettura")).toHaveTextContent("READ_ONLY");
    expect(screen.getByText(/runtime pubblico legacy resta invariato/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maturità" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ecosistema" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Evidenze" })).toBeInTheDocument();
    expect(screen.getByText("Operazioni")).toHaveAttribute("aria-disabled", "true");
  });
});
