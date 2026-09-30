import { describe, expect, it } from "vitest";
import { relationKindLabel, relationTone, toEcosystemModel } from "./model";

describe("ecosystem domain", () => {
  it("preserves governed relation kinds and authorization state", () => {
    const model=toEcosystemModel({
      schemaVersion:"1.6.0",
      generatedAt:"2026-09-30T09:00:00Z",
      capabilities:[{id:"DOS-A1",label:"Automation",runtimeState:"DEFERRED"}],
      dependencies:[{id:"D1",from:"Docente OS",to:"Atlas",kind:"FUTURE_NOT_AUTHORIZED",status:"NOT_AUTHORIZED"}],
    });
    expect(model.dependencies[0].status).toBe("NOT_AUTHORIZED");
    expect(relationKindLabel(model.dependencies[0].kind)).toBe("Futuro non autorizzato");
    expect(relationTone(model.dependencies[0].kind)).toBe("future");
  });
});
