import type { ProviderNeutralGenerationSpec } from "./visual-factory-prompt-compiler";

export type VisualModelCapability = "TEXT_TO_IMAGE" | "IMAGE_INPUT" | "MULTI_REFERENCE";

export type VisualModelRoute = {
  modelPolicy: "CANONICAL_FLUX2_KLEIN_4B";
  workflowFamily: "flux2-klein-4b/v0.2";
  requiredCapabilities: VisualModelCapability[];
};

export function routeVisualModel(spec: ProviderNeutralGenerationSpec): VisualModelRoute {
  if (spec.workflowFamily !== "flux2-klein-4b/v0.2") {
    throw new Error("MODEL_NOT_ALLOWLISTED");
  }

  const requiredCapabilities: VisualModelCapability[] = ["TEXT_TO_IMAGE"];
  if (spec.referenceInputs.length > 0) requiredCapabilities.push("IMAGE_INPUT");
  if (spec.referenceInputs.length > 1) requiredCapabilities.push("MULTI_REFERENCE");

  return {
    modelPolicy: "CANONICAL_FLUX2_KLEIN_4B",
    workflowFamily: "flux2-klein-4b/v0.2",
    requiredCapabilities,
  };
}
