import type { EcosystemSnapshot } from "../snapshot/types";

export type AssuranceReadiness={currentStatus?:string;targetStatus?:string;metEvidenceKinds?:string[];missingEvidenceKinds?:string[];metPrerequisites?:number;requiredPrerequisites?:number};
export type AssuranceClaim={
 requirementId:string;domain?:string;claimType?:string;scope?:string;status?:string;evidenceRefs?:string[];reviewAuthority?:string;assessor?:string|null;standardRef?:string|null;versionRef?:string|null;verifiedAt?:string|null;expiresAt?:string|null;limitations?:string[];externalCertificateRef?:string|null;targetStatus?:string;requiredEvidenceKinds?:string[];presentEvidenceKinds?:string[];readiness?:AssuranceReadiness
};
export type AssuranceModel={generatedAt:string;claims:AssuranceClaim[]};

export function toAssuranceModel(snapshot:EcosystemSnapshot):AssuranceModel{
 return {generatedAt:snapshot.generatedAt,claims:Array.isArray(snapshot.assuranceClaims)?snapshot.assuranceClaims as AssuranceClaim[]:[]};
}
export function statusLabel(value?:string){return String(value||"NON DICHIARATO").replaceAll("_"," ");}
export function hasFormalCertificate(claim:AssuranceClaim){return Boolean(claim.externalCertificateRef && claim.assessor);}
export function targetGapKinds(claim:AssuranceClaim){return claim.readiness?.missingEvidenceKinds ?? [];}
