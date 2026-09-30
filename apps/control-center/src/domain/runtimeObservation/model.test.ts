import { describe, expect, it } from "vitest";
import { hasAuthorizedMutation, runtimeObservationFixture, visibleRuntimeObservations } from "./model";

describe("runtime observation projection", () => {
  it("keeps the OR-04 fixture read-only", () => {
    expect(runtimeObservationFixture).toHaveLength(1);
    expect(runtimeObservationFixture[0].adapterState).toBe("DEFERRED");
    expect(hasAuthorizedMutation(runtimeObservationFixture[0])).toBe(false);
  });

  it("preserves evidence refs and orders capabilities deterministically", () => {
    const [item] = visibleRuntimeObservations(runtimeObservationFixture);
    expect(item.evidenceRefs).toContain("docs/contracts/trama-runtime-adapter-contract-v0.md");
    expect(item.capabilities.map((capability) => capability.key)).toEqual(
      [...item.capabilities.map((capability) => capability.key)].sort(),
    );
  });
});
