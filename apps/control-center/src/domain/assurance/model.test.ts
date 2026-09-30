import {describe,expect,it} from "vitest";
import {hasFormalCertificate,targetGapKinds,toAssuranceModel} from "./model";

describe("assurance domain",()=>{
 it("does not infer formal certification from a target",()=>{
  const model=toAssuranceModel({
   schemaVersion:"1.6.0",generatedAt:"2026-09-30T09:00:00Z",
   assuranceClaims:[{requirementId:"A",status:"TO_VERIFY",targetStatus:"FORMALLY_CERTIFIED",externalCertificateRef:null,assessor:null,readiness:{missingEvidenceKinds:["EXTERNAL_CERTIFICATE"]}}]
  });
  expect(hasFormalCertificate(model.claims[0])).toBe(false);
  expect(targetGapKinds(model.claims[0])).toEqual(["EXTERNAL_CERTIFICATE"]);
 });
 it("requires certificate and assessor for recorded formal certification evidence",()=>{
  expect(hasFormalCertificate({requirementId:"A",externalCertificateRef:"cert:1",assessor:"Independent body"})).toBe(true);
 });
});
