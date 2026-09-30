import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MaturityView } from "./MaturityPage";
import type { MaturitySnapshot } from "../../domain/maturity/model";

const model: MaturitySnapshot = {
  schemaVersion: "1.6.0",
  generatedAt: "2026-09-30T08:00:00Z",
  areas: [
    {
      id: "governance",
      name: "Governance e authority",
      ownerDomain: "TRAMA",
      confirmedLevel: 4,
      candidateLevel: 4,
      evidenceBindingStatus: "PARTIAL",
      nextTargetLevel: 5,
      nextRequiredEvidenceTypes: ["REGRESSION_HISTORY"],
    },
  ],
  components: [
    {
      componentId: "ATLAS.RELATION_EXPLORER.FAMILY",
      product: "ATLAS",
      target: "src/components/atlas/relation-explorer.tsx",
      lifecycle: "PROPOSED",
      sourceClass: "PRODUCT_OWNED",
      maturity: {
        confirmedStage: "REGISTERED" as const,
        candidateStage: "ACCESSIBILITY" as const,
        remainingEvidenceTypes: ["ISOLATED", "ACCESSIBILITY"],
      },
      evidenceStatus: {
        ISOLATED: {
          type: "ISOLATED",
          status: "PRESENT",
          sourcePlane: "LIVE_VERIFIED",
        },
        ACCESSIBILITY: {
          type: "ACCESSIBILITY",
          status: "PARTIAL",
        },
      },
      sourceRef: "governance/ui-development/trama-component-evidence-registry-v1.json",
    },
    {
      componentId: "ARENA.TABS.GOVERNED",
      product: "ARENA",
      target: "src/components/ui/Tabs.tsx",
      lifecycle: "TRIAL",
      sourceClass: "PRODUCT_OWNED",
      maturity: {
        confirmedStage: "ACCESSIBILITY" as const,
        candidateStage: "ACCESSIBILITY" as const,
        remainingEvidenceTypes: [],
      },
      evidenceStatus: {
        ACCESSIBILITY: { type: "ACCESSIBILITY", status: "PRESENT" },
      },
    },
  ],
  sourceState: {
    "component-evidence-registry": { status: "FRESH" },
  },
};

describe("MaturityView", () => {
  it("keeps live evidence, lifecycle and candidate maturity semantically distinct", () => {
    render(
      <MaturityView
        model={model}
        product="ALL"
        onProductChange={() => {}}
        selectedId="ATLAS.RELATION_EXPLORER.FAMILY"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("Presente · live verificata")).toBeInTheDocument();
    expect(screen.getByText("Proposto")).toBeInTheDocument();
    expect(screen.getAllByText("Registrato").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Accessibilità").length).toBeGreaterThan(0);
  });

  it("exposes product filters as pressed buttons", () => {
    const onProductChange = vi.fn();

    render(
      <MaturityView
        model={model}
        product="ALL"
        onProductChange={onProductChange}
        selectedId={null}
        onSelect={() => {}}
      />,
    );

    const filters = screen.getByRole("group", { name: "Filtra componenti per prodotto" });
    fireEvent.click(within(filters).getByRole("button", { name: "Atlas" }));
    expect(onProductChange).toHaveBeenCalledWith("ATLAS");
  });
});
