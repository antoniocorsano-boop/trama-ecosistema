import { describe, expect, it } from "vitest";
import { relationKindLabel, relationTone, selectGapEntries, toEcosystemModel } from "./model";

const canonicalGraph = {
  schemaVersion: "trama.ecosystem.state/v0.3",
  asOf: "2026-10-17",
  sourceRef: "governance/access/trama-ecosystem-state-v0.3.json",
  authorityPolicy: {},
  legend: {},
  externalActors: [{ id: "public", label: "Pubblico", kind: "HUMAN_ACTOR" }],
  nodes: [
    {
      id: "trama_access", label: "TRAMA Access", plane: "PROFESSIONAL", state: "PARTIAL", targetState: "REAL",
      boundary: "runtime parziale", authorityOwner: "trama", authorityRefs: ["A"], implementationOwners: ["trama"],
      maturityRef: null, evidenceRefs: ["E"], blockerRefs: [],
      gap: { summary: "Manca prova live", missing: ["sessione live"] },
      target: { boundary: "login professionale canonico", value: "ingresso professionale" },
      nextAllowedIntervention: { action: "Completare pilota", preconditions: [], forbiddenUntil: [] },
      sourceRefs: ["S"], lastSignificantChange: "2026-10-17", decisionRefs: [],
    },
    {
      id: "docente_os", label: "Docente OS", plane: "PROFESSIONAL", state: "REAL", targetState: "REAL",
      boundary: "ambiente docente reale", authorityOwner: "docente-os", authorityRefs: ["A"], implementationOwners: ["docente-os"],
      maturityRef: "docente-os", evidenceRefs: ["E"], blockerRefs: [],
      gap: { summary: "none", missing: [] },
      target: { boundary: "ambiente docente reale", value: "operatività docente" },
      nextAllowedIntervention: { action: "NONE", preconditions: [], forbiddenUntil: [] },
      sourceRefs: ["S"], lastSignificantChange: null, decisionRefs: [],
      maturityContext: { confirmedLevel: 5, candidateLevel: 5, evidenceBindingStatus: "COMPLETE", nextTargetLevel: null, nextRequiredEvidenceTypes: [], interpretation: "BOUND_EVIDENCE_ONLY", sourceRef: "snapshot:areas/docente-os", authorityRef: "governance/maturity/trama-maturity-reconciliation-v1.json" },
    },
  ],
  flows: [
    {
      id: "trama_access_to_docente_os", from: "trama_access", to: "docente_os", kind: "AUTHENTICATION",
      state: "DESIGNED", targetState: "REAL", boundary: "federazione non implementata", authorityOwner: null,
      authorityRefs: ["A"], implementationOwners: ["trama", "docente-os"], maturityRef: null, evidenceRefs: ["E"], blockerRefs: [],
      gap: { summary: "Federazione non implementata", missing: ["pilota Access qualificato"] },
      target: { boundary: "federazione limitata", value: "accesso professionale" },
      nextAllowedIntervention: { action: "Dopo pilota Access", preconditions: [], forbiddenUntil: [] },
      sourceRefs: ["S"], lastSignificantChange: null, decisionRefs: [],
    },
  ],
  views: {}, transitionPolicy: {},
};

describe("ecosystem domain", () => {
  it("preserves governed relation kinds and authorization state", () => {
    const model=toEcosystemModel({
      schemaVersion:"1.7.0",
      generatedAt:"2026-10-17T09:00:00Z",
      capabilities:[{id:"DOS-A1",label:"Automation",runtimeState:"DEFERRED"}],
      dependencies:[{id:"D1",from:"Docente OS",to:"Atlas",kind:"FUTURE_NOT_AUTHORIZED",status:"NOT_AUTHORIZED"}],
      ecosystemGraph: canonicalGraph,
    });
    expect(model.dependencies[0].status).toBe("NOT_AUTHORIZED");
    expect(relationKindLabel(model.dependencies[0].kind)).toBe("Futuro non autorizzato");
    expect(relationTone(model.dependencies[0].kind)).toBe("future");
  });

  it("preserves canonical graph nodes and flows without synthesizing legacy dependencies", () => {
    const model=toEcosystemModel({
      schemaVersion:"1.7.0", generatedAt:"2026-10-17T09:00:00Z",
      capabilities:[{id:"LEGACY",label:"Legacy"}],
      dependencies:[{id:"LEGACY-D",from:"X",to:"Y",kind:"DATA_FLOW",status:"GOVERNED"}],
      ecosystemGraph: canonicalGraph,
    });
    expect(model.ecosystemGraph.nodes.map((item)=>item.id)).toEqual(["trama_access","docente_os"]);
    expect(model.ecosystemGraph.flows.map((item)=>item.id)).toEqual(["trama_access_to_docente_os"]);
    expect(model.ecosystemGraph.flows.some((item)=>item.id==="LEGACY-D")).toBe(false);
  });

  it("derives GAP entries only from the canonical graph", () => {
    const gaps=selectGapEntries(canonicalGraph);
    expect(gaps.map((item)=>item.id)).toEqual(["node:trama_access","flow:trama_access_to_docente_os"]);
    expect(gaps.find((item)=>item.id==="node:trama_access")).toMatchObject({currentState:"PARTIAL",targetState:"REAL"});
    expect(gaps.find((item)=>item.id==="flow:trama_access_to_docente_os")).toMatchObject({currentState:"DESIGNED",targetState:"REAL"});
    expect(gaps.some((item)=>item.id==="node:docente_os")).toBe(false);
  });

  it("includes terminal NONE safeguards only when explicitly requested", () => {
    const gaps=selectGapEntries(canonicalGraph,true);
    expect(gaps.find((item)=>item.id==="node:docente_os")).toMatchObject({
      currentState:"REAL", targetState:"REAL", nextAction:"NONE", safeguard:true,
    });
  });
});
