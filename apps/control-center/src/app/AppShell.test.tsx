import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("keeps the candidate explicitly read-only and isolated", () => {
    render(<AppShell><p>contenuto</p></AppShell>);

    expect(screen.getByRole("heading", { name: "Control Center" })).toBeInTheDocument();
    expect(screen.getByLabelText("Modalità sola lettura")).toHaveTextContent("READ_ONLY");
    expect(screen.getByText(/legacy resta l’unico runtime di produzione/i)).toBeInTheDocument();
  });
});
