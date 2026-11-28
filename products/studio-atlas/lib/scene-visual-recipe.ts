import type { PathwayScene } from "./model";

/** Authoring-only recipe; no runtime/publication authority or remote assets. */
export const MATERIAL_PRESETS = {
  original: { label: "Originale", roughness: 0.76, metalness: 0 },
  stone: { label: "Pietra", roughness: 0.38, metalness: 0.16 },
  bronze: { label: "Bronzo", roughness: 0.24, metalness: 0.78 },
  obsidian: { label: "Ossidiana", roughness: 0.29, metalness: 0.38 },
  frame: { label: "Cornice", roughness: 0.31, metalness: 0.45 },
} as const;
export type SceneVisualRecipe = {
  schema: "atlas.scene.visual-recipe/v1";
  material: keyof typeof MATERIAL_PRESETS;
  light: "reference" | "balanced";
  orbit: number;
  motion: "none" | "reveal";
  media: "none" | "local-video";
};
export const DEFAULT_RECIPE: SceneVisualRecipe = Object.freeze({
  schema: "atlas.scene.visual-recipe/v1", material: "original", light: "balanced", orbit: 0, motion: "none", media: "none"
});
export function parseVisualRecipe(input: unknown): SceneVisualRecipe | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const v = input as Record<string, unknown>;
  if (Object.keys(v).length !== 6 || v.schema !== DEFAULT_RECIPE.schema ||
    typeof v.material !== "string" || !Object.hasOwn(MATERIAL_PRESETS, v.material) ||
    (v.light !== "reference" && v.light !== "balanced") ||
    typeof v.orbit !== "number" || !Number.isFinite(v.orbit) || v.orbit < -.3 || v.orbit > .3 ||
    (v.motion !== "none" && v.motion !== "reveal") ||
    (v.media !== "none" && v.media !== "local-video")) return undefined;
  return {schema: DEFAULT_RECIPE.schema,material:v.material as SceneVisualRecipe["material"],light:v.light,orbit:v.orbit,motion:v.motion,media:v.media};
}
export function updateSceneVisualRecipe(scenes: PathwayScene[], id: string, recipe: SceneVisualRecipe | undefined): PathwayScene[] {
  const validated = recipe === undefined ? undefined : parseVisualRecipe(recipe);
  if (recipe !== undefined && !validated) throw Error("INVALID_VISUAL_RECIPE");
  if (scenes.filter(s => s.sceneId === id).length !== 1) throw Error("VISUAL_RECIPE_SCENE_NOT_FOUND");
  return scenes.map(s => s.sceneId === id ? {...s, visualRecipe: validated} : s);
}
/** Experimental fields are never serialized into the learner transport. */
export function withoutVisualRecipe(scene: PathwayScene): Omit<PathwayScene,"visualRecipe"> {
  const {visualRecipe, ...rest} = scene; void visualRecipe; return rest;
}
