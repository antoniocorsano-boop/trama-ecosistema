import currentSnapshot from "../../../../../control-center/data/ecosystem-snapshot.json";
import { describe, expect, it } from "vitest";
import { toOverviewModel } from "./model";

describe("overview orientation model", () => {
  it("does not create artificial blocking decisions", () => {
    const model = toOverviewModel(currentSnapshot);
    expect(model.openDecisions).toHaveLength(0);
  });

  it("identifies the next planned phase when there is no active phase", () => {
    const model = toOverviewModel(currentSnapshot);
    expect(model.currentFocus).toHaveLength(0);
    expect(model.nextPlanned?.id).toBe("R4");
  });

  it("reports governed source freshness without score semantics", () => {
    const model = toOverviewModel(currentSnapshot);
    expect(model.freshSources).toBe(model.totalSources);
    expect(model.totalSources).toBeGreaterThan(0);
  });
});
