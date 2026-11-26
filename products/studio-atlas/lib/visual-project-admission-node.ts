import { open } from "node:fs/promises";
import type { PathwayProject } from "./model";
import { digestAuthoringState } from "./production";
import type { VisualGenerationPlan } from "./visual-factory";
import { canonicalDigest } from "./visual-preflight";
import { planProjectVisualReferences, usesCanonicalVisualExecutor } from "./visual-project-profile";

const MAX_APPROVAL_BYTES = 16 * 1024 * 1024;
const HEX = /^[0-9a-f]{64}$/;
export const PROJECT_APPROVAL_SCHEMA = "atlas.visual-project-source-approval/v0.1";
export type ProjectAdmissionResult =
  | "PROJECT_SOURCE_UNAVAILABLE"
  | "PROJECT_SOURCE_INVALID"
  | "PROJECT_PLAN_MISMATCH"
  | "PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED";

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function hex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

/** Qualification only. The approval must originate from an operator-controlled
 * server file, never from the request or browser storage. No provider calls,
 * asset creation, or execution/publication authority are granted here. */
export async function verifyApprovedProjectPlan(
  plan: VisualGenerationPlan,
  source: unknown,
): Promise<ProjectAdmissionResult> {
  try {
    if (usesCanonicalVisualExecutor(plan.pathwayId) || !record(source) ||
        Object.keys(source).sort().join(",") !==
          "decision,packageDigest,planDigest,project,projectDigest,schemaVersion" ||
        source.schemaVersion !== PROJECT_APPROVAL_SCHEMA ||
        source.decision !== "APPROVED_FOR_REFERENCE_PLAN_QUALIFICATION" ||
        !record(source.project) || !hex(source.projectDigest) ||
        !hex(source.packageDigest) || !hex(source.planDigest)) {
      return "PROJECT_SOURCE_INVALID";
    }
    const project = source.project as unknown as PathwayProject;
    if (!Number.isSafeInteger(project.revision) || project.revision < 1 ||
        project.archived !== false || typeof project.projectId !== "string" ||
        canonicalDigest(project) !== source.projectDigest ||
        await digestAuthoringState(project) !== source.packageDigest) {
      return "PROJECT_SOURCE_INVALID";
    }
    if (plan.pathwayId !== project.projectId || plan.packageDigest !== source.packageDigest ||
        plan.planType !== "REFERENCE_GENERATION") return "PROJECT_PLAN_MISMATCH";
    const rebuilt = planProjectVisualReferences(project, source.packageDigest, true).references;
    if (rebuilt.decision !== "REFERENCE_GENERATION_READY" || rebuilt.jobs.length === 0 ||
        canonicalDigest(rebuilt) !== source.planDigest) return "PROJECT_SOURCE_INVALID";
    if (canonicalDigest(plan) !== source.planDigest) return "PROJECT_PLAN_MISMATCH";
    return "PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED";
  } catch {
    return "PROJECT_SOURCE_INVALID";
  }
}

/** The path is set by the server operator. Request data never selects a file.
 * Read a bounded regular file and fail closed on missing/malformed evidence. */
export async function checkServerProjectPlan(
  plan: VisualGenerationPlan,
  approvalFile: string | undefined,
): Promise<ProjectAdmissionResult> {
  if (!approvalFile?.trim()) return "PROJECT_SOURCE_UNAVAILABLE";
  let handle;
  try {
    handle = await open(approvalFile, "r");
    const info = await handle.stat();
    if (!info.isFile() || info.size < 1 || info.size > MAX_APPROVAL_BYTES) return "PROJECT_SOURCE_INVALID";
    const bytes = Buffer.alloc(info.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const { bytesRead } = await handle.read(bytes, used, bytes.length - used, used);
      if (!bytesRead) break;
      used += bytesRead;
    }
    if (used !== info.size) return "PROJECT_SOURCE_INVALID";
    return await verifyApprovedProjectPlan(plan, JSON.parse(bytes.subarray(0, used).toString("utf8")));
  } catch (error) {
    return (error as NodeJS.ErrnoException)?.code === "ENOENT"
      ? "PROJECT_SOURCE_UNAVAILABLE" : "PROJECT_SOURCE_INVALID";
  } finally {
    if (handle) await handle.close().catch(() => {});
  }
}
