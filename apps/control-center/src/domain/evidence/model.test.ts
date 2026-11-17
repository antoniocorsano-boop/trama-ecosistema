import { describe, expect, it } from "vitest";
import { evidenceProvenance, freshnessState, linkedCapabilities, recordedEvidenceLabel, toEvidenceModel } from "./model";

describe("evidence domain", () => {
  it("computes freshness only from governed policy and timestamps", () => {
    const item={id:"EV",freshness:{policy:"TIME_BOUND",expiresAt:"2026-09-29T00:00:00Z"}};
    expect(freshnessState(item,"2026-09-30T00:00:00Z")).toBe("EXPIRED");
  });

  it("resolves linked capabilities without inventing associations", () => {
    const model=toEvidenceModel({
      schemaVersion:"1.6.0",
      generatedAt:"2026-09-30T00:00:00Z",
      evidence:[{id:"EV",binding:{capabilityRef:"ECO-01"}}],
      integrityChecks:[],
      capabilities:[{id:"ECO-01",evidenceRefs:["EV"]}],
    });
    expect(linkedCapabilities(model,"EV")).toEqual(["ECO-01"]);
  });
});

describe("QF-03B recorded evidence presentation", () => {
  it.each([
    ["PASS", "Verifica registrata con esito positivo"],
    ["FAIL", "Verifica non superata"],
    ["PARTIAL", "Riscontro parziale"],
    ["IN_PROGRESS", "Verifica in corso"],
    ["NOT_APPLICABLE", "Controllo non pertinente"],
    ["NOT_RUN", "Esito non verificabile"],
    ["BLOCKED", "Esito non verificabile"],
    [undefined, "Esito non verificabile"],
  ])("keeps recorded outcome %s bounded to its source", (status, label) => {
    expect(recordedEvidenceLabel(status)).toBe(label);
  });

  it("shows only declared provenance and does not invent a release or decision", () => {
    const item={id:"EV",source:{repository:"example/product",runId:42},binding:{exactHead:"a".repeat(40),releaseRef:null,eventRef:"event:example"}};
    expect(evidenceProvenance(item)).toEqual([
      {label:"Repository",value:"example/product"},
      {label:"Esecuzione",value:"42"},
      {label:"Riferimento evento",value:"event:example"},
    ]);
    expect(item.binding.releaseRef).toBeNull();
  });

  it("preserves release, area and decision references when declared", () => {
    expect(evidenceProvenance({id:"EV",source:{decisionRef:"decision:example"},binding:{releaseRef:"release:example",areaRef:"area:example"}})).toEqual([
      {label:"Versione di rilascio",value:"release:example"},
      {label:"Riferimento decisione",value:"decision:example"},
      {label:"Ambito associato",value:"area:example"},
    ]);
  });

  it("does not fabricate evidence metadata from missing or empty fields", () => {
    expect(evidenceProvenance({id:"EV",source:{repository:" ",runId:0},binding:null})).toEqual([]);
    expect(evidenceProvenance({id:"EV"})).toEqual([]);
  });
});
