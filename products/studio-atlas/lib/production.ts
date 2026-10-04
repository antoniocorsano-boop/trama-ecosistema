import type { PathwayProject } from "./model";

export type VisualProductionRequest = {
  schemaVersion: "atlas.visual-production-request/v0.1";
  requestId: string;
  pathwayId: string;
  packageDigest: string;
  operation: "GENERATE";
  sceneRefs: string[];
  qualityProfile: "Q4";
  productForm: "illustrated-sequence";
  computePolicyRef: "TRAMA Compute Policy v0.1";
  paidComputeAuthorized: false;
  allowQualityDowngrade: false;
  maxAttempts: 4;
  requestedAt: string;
};

export function canPrepareProduction(project: PathwayProject) {
  return project.sceneRefs.length > 0;
}

export function buildVisualProductionRequest(
  project: PathwayProject,
  packageDigest: string,
): VisualProductionRequest {
  if (!canPrepareProduction(project)) {
    throw new Error("PRODUCTION_REQUIRES_SCENES");
  }
  if (!/^[0-9a-f]{64}$/.test(packageDigest)) {
    throw new Error("INVALID_PACKAGE_DIGEST");
  }

  return {
    schemaVersion: "atlas.visual-production-request/v0.1",
    requestId: crypto.randomUUID(),
    pathwayId: project.projectId,
    packageDigest,
    operation: "GENERATE",
    sceneRefs: [...project.sceneRefs],
    qualityProfile: "Q4",
    productForm: "illustrated-sequence",
    computePolicyRef: "TRAMA Compute Policy v0.1",
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    maxAttempts: 4,
    requestedAt: new Date().toISOString(),
  };
}
