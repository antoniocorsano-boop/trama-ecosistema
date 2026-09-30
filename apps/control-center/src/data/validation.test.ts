import { describe, expect, it } from "vitest";
import currentSnapshot from "../../../../control-center/data/ecosystem-snapshot.json";
import { SnapshotValidationError, parseEcosystemSnapshot } from "./validation";

describe("governed snapshot validation", () => {
  it("accepts the current governed ecosystem snapshot", () => {
    const parsed = parseEcosystemSnapshot(currentSnapshot);
    expect(parsed.schemaVersion).toBe(currentSnapshot.schemaVersion);
  });

  it("fails closed on an invalid object", () => {
    expect(() => parseEcosystemSnapshot({ schemaVersion: "invalid" })).toThrow(SnapshotValidationError);
  });
});
