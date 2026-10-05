import type { VisualAssetPurpose, VisualGenerationJob } from "./visual-factory";

export type ProviderNeutralGenerationSpec = {
  schemaVersion: "atlas.provider-neutral-generation-spec/v0.1";
  jobId: string;
  purpose: VisualAssetPurpose;
  subjectRef?: string;
  shotId?: string;
  sceneRef?: string;
  workflowFamily: "flux2-klein-4b/v0.2";
  prompt: string;
  negativePrompt: string;
  referenceInputs: string[];
  aspectRatio: "3:4" | "4:3";
  maxVariants: number;
};

export function compileProviderNeutralGenerationSpec(
  job: VisualGenerationJob,
): ProviderNeutralGenerationSpec {
  return {
    schemaVersion: "atlas.provider-neutral-generation-spec/v0.1",
    jobId: job.jobId,
    purpose: job.purpose,
    subjectRef: job.subjectRef,
    shotId: job.shotId,
    sceneRef: job.sceneRef,
    workflowFamily: job.workflowFamily as ProviderNeutralGenerationSpec["workflowFamily"],
    prompt: job.prompt.trim(),
    negativePrompt: job.negativeConstraints
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", "),
    referenceInputs: [...job.referenceInputs],
    aspectRatio: job.aspectRatio as ProviderNeutralGenerationSpec["aspectRatio"],
    maxVariants: job.maxVariants,
  };
}
