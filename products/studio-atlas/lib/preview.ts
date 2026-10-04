import type { PathwayProject, StudioAtlasPreviewSnapshot } from "./model";
import { digestAuthoringState, getProductionBlockers } from "./production";

const REVIEW_ONLY_BLOCKERS = new Set([
  "PRODUCT_REVIEW_NOT_PASS",
  "WORLD_REVIEW_NOT_PASS",
  "STORYBOARD_NOT_READY",
]);

export function getPreviewBlockers(project: PathwayProject) {
  return getProductionBlockers(project);
}

export function getReviewPreviewBlockers(project: PathwayProject) {
  return getProductionBlockers(project).filter((blocker) => !REVIEW_ONLY_BLOCKERS.has(blocker));
}

async function buildSnapshot(
  project: PathwayProject,
  blockers: string[],
  purpose: "LEARNER" | "HUMAN_PRODUCT_REVIEW",
): Promise<StudioAtlasPreviewSnapshot> {
  void purpose;
  if (blockers.length > 0) {
    throw new Error(`PREVIEW_BLOCKED:${blockers.join(",")}`);
  }

  return {
    schemaVersion: "studio-atlas.preview-snapshot/v0.1",
    snapshotId: crypto.randomUUID(),
    packageDigest: await digestAuthoringState(project),
    pathwayId: project.projectId,
    version: `0.1.0-preview.${project.revision}`,
    title: project.title,
    description: project.idea,
    runtimeAuthorized: false,
    studentAuthorized: false,
    scenes: project.scenes.map((scene) => ({ ...scene })),
  };
}

export async function buildStudioAtlasPreviewSnapshot(
  project: PathwayProject,
): Promise<StudioAtlasPreviewSnapshot> {
  return buildSnapshot(project, getPreviewBlockers(project), "LEARNER");
}

export async function buildStudioAtlasReviewPreviewSnapshot(
  project: PathwayProject,
): Promise<StudioAtlasPreviewSnapshot> {
  return buildSnapshot(project, getReviewPreviewBlockers(project), "HUMAN_PRODUCT_REVIEW");
}
