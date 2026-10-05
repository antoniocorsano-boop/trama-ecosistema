import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createMuseoZeroPilotProject } from "../lib/canonical/museo-zero";
import { digestAuthoringState } from "../lib/production";
import {
  compileReferenceJobs,
  createInitialVisualFactoryState,
} from "../lib/visual-factory";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

async function main() {
  const output = argument("--output");
  if (!output) throw new Error("VF_CANONICAL_PLAN_OUTPUT_REQUIRED");

  const project = createMuseoZeroPilotProject();
  const packageDigest = await digestAuthoringState(project);
  const state = createInitialVisualFactoryState(packageDigest);
  const plan = compileReferenceJobs(project, packageDigest, state);

  if (plan.decision !== "REFERENCE_GENERATION_READY" || plan.jobs.length !== 5) {
    throw new Error("VF_CANONICAL_REFERENCE_PLAN_NOT_READY");
  }

  const outputPath = resolve(output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "VF_CANONICAL_PLAN_UNKNOWN_ERROR";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
