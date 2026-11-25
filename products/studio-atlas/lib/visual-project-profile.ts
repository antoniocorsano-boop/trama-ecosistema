import type { PathwayProject } from "./model";
import { compileProfileReferenceJobs, compileProfileShotJobs, createInitialVisualFactoryState, resolveCanonicalVisualProductionProfile, validateVisualProductionProfile, type VisualProductionProfile } from "./visual-factory";
import { createVisualPreflightReceipt, runDeterministicPreflight, hasPreflightErrors, type VisualIntentSpec } from "./visual-preflight";

export function usesCanonicalVisualExecutor(projectId: string): boolean {
  try { resolveCanonicalVisualProductionProfile(projectId); return true; }
  catch (error) {
    if (error instanceof Error && error.message === "VISUAL_FACTORY_UNSUPPORTED_PATHWAY") return false;
    throw error;
  }
}

/** Draft planning only: one location reference and one frame per authored scene.
 * No generated assets, persisted locks, execution admission or publication authority.
 */
export function buildProjectVisualProfile(project: PathwayProject, packageDigest: string): VisualProductionProfile {
  if (usesCanonicalVisualExecutor(project.projectId)) throw Error("CANONICAL_VISUAL_PROFILE_REQUIRED");
  if (project.archived || !project.projectId.trim() || !project.experience.grammar || project.scenes.length < 1 || project.scenes.length > 6 ||
      new Set(project.scenes.map(scene => scene.sceneId)).size !== project.scenes.length) throw Error("VISUAL_PROJECT_SCOPE_UNSUPPORTED");
  const artDirectionVersion = "project-scene-planning/v1";
  const references: VisualIntentSpec[] = [];
  const shots: VisualIntentSpec[] = [];
  for (const scene of project.scenes) {
    const focus = scene.stage?.locations?.find(location => location.id === scene.stage?.focusLocationId);
    const place = (focus?.label ?? scene.world?.place ?? "").trim();
    const situation = scene.visibleSituation.trim();
    if (!scene.sceneId.trim() || !scene.title.trim() || !place || !situation || !scene.learnerAction.trim()) throw Error("VISUAL_PROJECT_SCENE_INCOMPLETE");
    const subject = "scene-place:" + scene.sceneId;
    const facts = [place, ...(focus?.detail.trim() ? [focus.detail.trim()] : [])];
    const reference: VisualIntentSpec = {
      schemaVersion: "atlas.visual-intent-spec/v0.1",
      specId: "reference:" + scene.sceneId, pathwayId: project.projectId, packageDigest, artDirectionVersion,
      purpose: "ENVIRONMENT_REFERENCE", subjectRefs: [subject],
      narrativeFunction: "Rendere riconoscibile il luogo della scena: " + scene.title,
      requiredVisualFacts: facts, worldAnchors: [place], identityAnchors: [],
      composition: { dominantSubject: place, foreground: [], midground: [], background: [], spatialRelation: "Rendere leggibili le relazioni documentate nella scena; non aggiungere elementi non verificati." },
      camera: { shotScale: "campo d'insieme", viewpoint: "da definire nella revisione visiva", lensLanguage: "prospettiva leggibile" },
      lightingMood: "da definire nella revisione visiva", materialTextureLanguage: [],
      continuityRefs: [], negativeConstraints: ["elementi non documentati", "marchi e filigrane"], forbiddenTextPatterns: ["watermark"],
      qualityCriteria: ["Coerenza con il luogo e con il progetto", "Leggibilità didattica"], targetAspectRatio: "16:9",
    };
    references.push(reference);
    shots.push({ ...reference, specId: "frame:" + scene.sceneId, purpose: "SCENE_FRAME", sceneRef: scene.sceneId, shotId: "frame:" + scene.sceneId,
      narrativeFunction: scene.learnerAction, requiredVisualFacts: [...facts, situation], continuityRefs: [subject] });
  }
  const result = { pathwayId: project.projectId, artDirectionVersion, references, shots };
  validateVisualProductionProfile(result);
  return result;
}

/** Compile only the reference plan after an explicit teacher decision.
 * Shots remain blocked without accepted references. This never calls an executor.
 */
export function planProjectVisualReferences(project: PathwayProject, packageDigest: string, humanApproved: boolean) {
  const profile = buildProjectVisualProfile(project, packageDigest);
  const state = createInitialVisualFactoryState(packageDigest, profile);
  const findings = [...profile.references, ...profile.shots].flatMap(runDeterministicPreflight);
  const receipts = humanApproved && !hasPreflightErrors(findings)
    ? profile.references.map(spec => createVisualPreflightReceipt({
        spec, providerFamily: "FLUX2_KLEIN_4B", semanticCritic: {mode:"NOT_AVAILABLE", result:"NOT_RUN", findings:[]}, humanPreflightDecision:"PASS",
      }))
    : [];
  return {
    profile, findings,
    references: compileProfileReferenceJobs(project, packageDigest, state, receipts, profile),
    shots: compileProfileShotJobs(project, packageDigest, state, [], profile),
  };
}
