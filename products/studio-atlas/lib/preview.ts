import type { PathwayProject, StudioAtlasPreviewSnapshot } from "./model";
import { digestAuthoringState, getProductionBlockers } from "./production";

export function getPreviewBlockers(project: PathwayProject) {
  return getProductionBlockers(project);
}

export async function buildStudioAtlasPreviewSnapshot(
  project: PathwayProject,
): Promise<StudioAtlasPreviewSnapshot> {
  const blockers = getPreviewBlockers(project);
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
