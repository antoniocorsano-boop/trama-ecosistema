import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { selectGapEntries, type EcosystemGraphProjection } from "../../domain/ecosystem/model";
import { EcosystemStateList } from "./EcosystemStateList";

const graph: EcosystemGraphProjection = {
  schemaVersion: "trama.ecosystem.state/v0.3",
  asOf: "2026-10-17",
  sourceRef: "governance/access/trama-ecosystem-state-v0.3.json",
  authorityPolicy: {},
  legend: {},
  externalActors: [],
  nodes: [
    {
      id: "docente_os",
      label: "Docente OS",
      plane: "PROFESSIONAL",
      state: "REAL",
      targetState: "REAL",
      boundary: "Ambiente docente reale",
      authorityOwner: "docente-os",
      authorityRefs: ["path:docs/superpowers/specs/authority.md"],
      implementationOwners: ["docente-os"],
      maturityRef: "docente-os",
      evidenceRefs: ["path:docs/evidence/docente-os.md"],
      blockerRefs: [],
      gap: { summary: "none", missing: [] },
      target: { boundary: "Ambiente docente reale", value: "Operatività docente" },
      nextAllowedIntervention: { action: "NONE", preconditions: [], forbiddenUntil: [] },
      sourceRefs: ["path:docs/superpowers/specs/authority.md"],
      lastSignificantChange: null,
      decisionRefs: [],
      maturityContext: {
        confirmedLevel: 5,
        candidateLevel: 5,
        evidenceBindingStatus: "COMPLETE",
        nextTargetLevel: null,
        nextRequiredEvidenceTypes: [],
        interpretation: "BOUND_EVIDENCE_ONLY",
        sourceRef: "snapshot:areas/docente-os",
        authorityRef: "governance/maturity/trama-maturity-reconciliation-v1.json",
      },
    },
  ],
  flows: [],
  views: {},
  transitionPolicy: {},
};

describe("ecosystem final-review regressions", () => {
  it("treats only terminal REAL records as safeguards", () => {
    const incomplete = structuredClone(graph);
    incomplete.nodes[0].state = "PARTIAL";
    incomplete.nodes[0].targetState = "PARTIAL";
    incomplete.nodes[0].gap = { summary: "none", missing: [] };
    incomplete.nodes[0].nextAllowedIntervention = { action: "NONE", preconditions: [], forbiddenUntil: [] };

    expect(selectGapEntries(incomplete, true)).toEqual([]);
  });

  it("exposes resolved maturity context and provenance in the full-state view", () => {
    render(
      <EcosystemStateList
        graph={graph}
        selectedFlowId={null}
        onSelectFlow={vi.fn()}
      />,
    );

    expect(screen.getByText("L5 confermato", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/Candidato L5/)).toBeInTheDocument();
    expect(screen.getByText(/Evidenze COMPLETE/)).toBeInTheDocument();
    expect(screen.getByText(/snapshot:areas\/docente-os/)).toBeInTheDocument();
    expect(screen.getByText(/governance\/maturity\/trama-maturity-reconciliation-v1.json/)).toBeInTheDocument();
  });
});
