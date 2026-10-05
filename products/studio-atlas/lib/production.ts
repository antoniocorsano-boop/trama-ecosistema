import type {
  PathwayProject,
  SceneWorldState,
  VisualProductionReceipt,
  VisualProductionRequest,
} from "./model";

function hasValidWorldState(world: SceneWorldState | undefined) {
  if (!world) return true;
  if (!world.place.trim() || !world.status.trim() || world.signals.length < 1) return false;
  const ids = new Set<string>();
  return world.signals.every((signal) => {
    if (!signal.id.trim() || !signal.label.trim() || ids.has(signal.id)) return false;
    ids.add(signal.id);
    return true;
  });
}

export function getProductionBlockers(project: PathwayProject) {
  const blockers: string[] = [];

  if (project.storyReview.decision !== "PASS") blockers.push("STORY_REVIEW_NOT_PASS");
  if (project.productReview && project.productReview.decision !== "PASS") {
    blockers.push("PRODUCT_REVIEW_NOT_PASS");
  }
  if (project.worldReview.decision !== "PASS") blockers.push("WORLD_REVIEW_NOT_PASS");
  if (!project.experience.grammar) blockers.push("EXPERIENCE_NOT_SELECTED");
  if (!project.storyboardReady) blockers.push("STORYBOARD_NOT_READY");
  if (project.scenes.length < 1) blockers.push("NO_SCENES");
  if (!project.scenes.some((scene) => scene.kind === "TRANSFER")) {
    blockers.push("TRANSFER_SCENE_REQUIRED");
  }

  const incompleteScene = project.scenes.some(
    (scene) =>
      !scene.visibleSituation.trim() ||
      !scene.learnerAction.trim() ||
      !scene.consequence.trim(),
  );
  if (incompleteScene) blockers.push("INCOMPLETE_SCENES");

  const invalidChoice = project.scenes.some(
    (scene) =>
      scene.interaction === "CHOICE" &&
      (
        scene.choices.length < 2 ||
        scene.choices.some(
          (choice) =>
            !choice.label.trim() ||
            !choice.feedback.trim() ||
            !choice.targetSceneId.trim() ||
            !project.scenes.some((candidate) => candidate.sceneId === choice.targetSceneId),
        ) ||
        new Set(scene.choices.map((choice) => choice.targetSceneId)).size < 2
      ),
  );
  if (invalidChoice) blockers.push("INCOMPLETE_CHOICES");

  const invalidWorldState = project.scenes.some(
    (scene) =>
      !hasValidWorldState(scene.world) ||
      scene.choices.some((choice) => !hasValidWorldState(choice.worldAfter)),
  );
  if (invalidWorldState) blockers.push("INCOMPLETE_WORLD_STATE");

  const terminalChoice = project.scenes.at(-1)?.interaction === "CHOICE";
  if (terminalChoice) blockers.push("TERMINAL_CHOICE_NEEDS_CLOSURE");

  return blockers;
}

export function canPrepareProduction(project: PathwayProject) {
  return getProductionBlockers(project).length === 0;
}

export async function prepareWaitingProduction(project: PathwayProject) {
  const blockers = getProductionBlockers(project);
  if (blockers.length) {
    throw new Error(`PRODUCTION_BLOCKED:${blockers.join(",")}`);
  }

  const packageDigest = await digestAuthoringState(project);

  const request: VisualProductionRequest = {
    schemaVersion: "atlas.visual-production-request/v0.1",
    requestId: crypto.randomUUID(),
    pathwayId: project.projectId,
    packageDigest,
    operation: "GENERATE",
    sceneRefs: project.scenes.map((scene) => scene.sceneId),
    qualityProfile: "Q4",
    productForm: "illustrated-sequence",
    computePolicyRef: "TRAMA Compute Policy v0.1",
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    maxAttempts: 4,
    requestedAt: new Date().toISOString(),
  };

  const receipt: VisualProductionReceipt = {
    schemaVersion: "atlas.visual-production-receipt/v0.1",
    receiptId: crypto.randomUUID(),
    requestId: request.requestId,
    status: "WAITING_FOR_COMPUTE",
    qualityProfile: "Q4",
    effectiveCostClass: "UNKNOWN",
    costClass: "FREE_ONLY",
    attempts: 0,
    failureCategory: "NO_FREE_PROVIDER",
    failureDetail: "NO_SKYPILOT_FREE_ONLY_PROVIDER_BOUND",
    publicationAuthorityGranted: false,
  };

  return { request, receipt };
}

export async function digestAuthoringState(project: PathwayProject) {
  const canonical = JSON.stringify({
    pathwayId: project.projectId,
    title: project.title,
    idea: project.idea,
    ageBand: project.ageBand,
    story: project.story,
    storyReview: project.storyReview,
    world: project.world,
    worldReview: project.worldReview,
    productReview: project.productReview,
    experience: project.experience,
    scenes: project.scenes,
    storyboardReady: project.storyboardReady,
    revision: project.revision,
  });
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
