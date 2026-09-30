import { describe, expect, it } from "vitest";
import { evidenceDisplayLabel, stageIndex } from "./model";

describe("maturity domain semantics", () => {
  it("keeps confirmed and candidate stages distinct", () => {
    expect(stageIndex("REGISTERED")).toBe(0);
    expect(stageIndex("ACCESSIBILITY")).toBe(4);
  });

  it("labels live verified evidence without promoting its status", () => {
    expect(evidenceDisplayLabel({
      type: "ISOLATED",
      status: "PRESENT",
      sourcePlane: "LIVE_VERIFIED",
    })).toBe("Presente · live verificata");
  });

  it("does not add the live qualifier to governed evidence", () => {
    expect(evidenceDisplayLabel({
      type: "BEHAVIOURAL",
      status: "PRESENT",
    })).toBe("Presente");
  });
});
