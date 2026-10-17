import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EcosystemView } from "./EcosystemPage";
import type { EcosystemModel, EcosystemGraphProjection } from "../../domain/ecosystem/model";

const graph: EcosystemGraphProjection = {
  schemaVersion: "trama.ecosystem.state/v0.3", asOf: "2026-10-17",
  sourceRef: "governance/access/trama-ecosystem-state-v0.3.json", authorityPolicy: {}, legend: {},
  externalActors: [{ id: "public", label: "Pubblico", kind: "HUMAN_ACTOR" }],
  nodes: [
    { id:"trama_access",label:"TRAMA Access",plane:"PROFESSIONAL",state:"PARTIAL",targetState:"REAL",boundary:"Runtime parziale",authorityOwner:"trama",authorityRefs:["A"],implementationOwners:["trama"],maturityRef:null,evidenceRefs:["E"],blockerRefs:[],gap:{summary:"Manca la prova live end-to-end",missing:["sessione live"]},target:{boundary:"Login e launcher professionale canonico",value:"Ingresso professionale"},nextAllowedIntervention:{action:"Completare il pilota live limitato",preconditions:[],forbiddenUntil:[]},sourceRefs:["S"],lastSignificantChange:"2026-10-17",decisionRefs:[] },
    { id:"docente_os",label:"Docente OS",plane:"PROFESSIONAL",state:"REAL",targetState:"REAL",boundary:"Ambiente docente reale",authorityOwner:"docente-os",authorityRefs:["A"],implementationOwners:["docente-os"],maturityRef:"docente-os",evidenceRefs:["E"],blockerRefs:[],gap:{summary:"none",missing:[]},target:{boundary:"Ambiente docente reale",value:"Operatività docente"},nextAllowedIntervention:{action:"NONE",preconditions:[],forbiddenUntil:[]},sourceRefs:["S"],lastSignificantChange:null,decisionRefs:[],maturityContext:{confirmedLevel:5,candidateLevel:5,evidenceBindingStatus:"COMPLETE",nextTargetLevel:null,nextRequiredEvidenceTypes:[],interpretation:"BOUND_EVIDENCE_ONLY",sourceRef:"snapshot:areas/docente-os",authorityRef:"governance/maturity/trama-maturity-reconciliation-v1.json"} },
  ],
  flows: [
    { id:"trama_access_to_docente_os",from:"trama_access",to:"docente_os",kind:"AUTHENTICATION",state:"DESIGNED",targetState:"REAL",boundary:"Federazione non implementata",authorityOwner:null,authorityRefs:["A"],implementationOwners:["trama","docente-os"],maturityRef:null,evidenceRefs:["E"],blockerRefs:[],gap:{summary:"Federazione non implementata",missing:["pilota Access qualificato"]},target:{boundary:"Federazione professionale limitata",value:"Accesso professionale"},nextAllowedIntervention:{action:"Dopo il pilota Access, qualificare il primo pilot di federazione",preconditions:[],forbiddenUntil:[]},sourceRefs:["S"],lastSignificantChange:null,decisionRefs:[] },
  ],
  views:{},transitionPolicy:{},
};

const model: EcosystemModel = {
  generatedAt:"2026-10-17T10:00:00Z", ecosystemGraph:graph,
  capabilities:[{id:"DOS-A1",label:"Runtime Adapter",ownerDomain:"Docente OS",state:"DEFERRED",runtimeState:"DEFERRED"}],
  dependencies:[{id:"LEGACY-D",from:"Docente OS",to:"Atlas",kind:"FUTURE_NOT_AUTHORIZED",status:"NOT_AUTHORIZED"}],
};

describe("EcosystemView v0.3",()=>{
  it("uses the canonical graph as primary full-state view",()=>{
    render(<EcosystemView model={model} />);
    expect(screen.getByRole("button",{name:"Mappa governata"})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByRole("button",{name:"AS IS → GAP → TO BE"})).toBeInTheDocument();
    expect(screen.getByText("TRAMA Access")).toBeInTheDocument();
    expect(screen.getByText("PARTIAL",{exact:true})).toBeInTheDocument();
    expect(screen.queryByText("15 nodi",{exact:false})).not.toBeInTheDocument();
  });

  it("derives AS IS → GAP → TO BE from the same canonical graph",()=>{
    render(<EcosystemView model={model} />);
    fireEvent.click(screen.getByRole("button",{name:"AS IS → GAP → TO BE"}));
    for (const label of ["AS IS","GAP","TO BE","NEXT"]) {
      expect(screen.getAllByText(label,{exact:true}).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("Manca la prova live end-to-end")).toBeInTheDocument();
    expect(screen.getByText("TRAMA Access → Docente OS")).toBeInTheDocument();
    expect(screen.getByText("Federazione non implementata")).toBeInTheDocument();
  });

  it("shows terminal safeguards only on explicit request",()=>{
    render(<EcosystemView model={model} />);
    fireEvent.click(screen.getByRole("button",{name:"AS IS → GAP → TO BE"}));
    expect(screen.queryByText("Nessun intervento ecosistemico ammesso")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox",{name:"Mostra elementi da non riaprire"}));
    expect(screen.getByText("Nessun intervento ecosistemico ammesso")).toBeInTheDocument();
  });
});
