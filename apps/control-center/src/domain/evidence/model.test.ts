import { describe, expect, it } from "vitest";
import { freshnessState, linkedCapabilities, toEvidenceModel } from "./model";

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
