import type { PathwayProject } from "./model";
import { digestAuthoringState } from "./production";
import { canonicalDigest } from "./visual-preflight";
import { planProjectVisualReferences } from "./visual-project-profile";

export const PROJECT_CANDIDATE_SCHEMA = "atlas.visual-project-source-candidate/v0.1";
export const PROJECT_APPROVAL_SCHEMA = "atlas.visual-project-source-approval/v0.1";
export const MAX_PROJECT_SOURCE_BYTES = 16 * 1024 * 1024;

/** A local candidate is not a server approval. Preserve the authoring revision
 * and its exact digest; discard unrelated cached production/preview copies. */
export async function createProjectSourceCandidate(project: PathwayProject, confirmed: boolean) {
  if (confirmed !== true || project.archived !== false ||
      !Number.isSafeInteger(project.revision) || project.revision < 1) throw Error("PROJECT_CONFIRMATION_REQUIRED");
  const snapshot = JSON.parse(JSON.stringify(project)) as PathwayProject;
  delete snapshot.lastPreviewSnapshot;
  delete snapshot.lastProductionReceipt;
  delete snapshot.lastProductionRequest;
  const packageDigest = await digestAuthoringState(snapshot);
  const plan = planProjectVisualReferences(snapshot, packageDigest, true).references;
  if (plan.decision !== "REFERENCE_GENERATION_READY" || plan.jobs.length === 0) throw Error("PROJECT_PLAN_NOT_READY");
  const candidate = {schemaVersion:PROJECT_CANDIDATE_SCHEMA, decision:"PENDING_OPERATOR_REVIEW" as const,
    project:snapshot, projectDigest:canonicalDigest(snapshot), packageDigest, planDigest:canonicalDigest(plan)};
  if (new TextEncoder().encode(JSON.stringify(candidate)).byteLength > MAX_PROJECT_SOURCE_BYTES) throw Error("PROJECT_SOURCE_TOO_LARGE");
  return candidate;
}
