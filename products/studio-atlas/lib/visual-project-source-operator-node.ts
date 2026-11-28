import { open, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import type { PathwayProject } from "./model";
import { canonicalDigest } from "./visual-preflight";
import { createProjectSourceCandidate, MAX_PROJECT_SOURCE_BYTES, PROJECT_APPROVAL_SCHEMA } from "./visual-project-source";
import { planProjectVisualReferences } from "./visual-project-profile";
import { verifyApprovedProjectPlan } from "./visual-project-admission-node";

export async function readProjectSourceFile(path: string): Promise<unknown> {
  const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size < 1 || info.size > MAX_PROJECT_SOURCE_BYTES) throw Error("PROJECT_SOURCE_INVALID");
    const bytes = Buffer.alloc(info.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const {bytesRead} = await file.read(bytes,used,bytes.length-used,used);
      if (!bytesRead) break;
      used += bytesRead;
    }
    if (used !== info.size) throw Error("PROJECT_SOURCE_INVALID");
    return JSON.parse(bytes.subarray(0,used).toString("utf8"));
  } finally { await file.close(); }
}
export async function inspectProjectSourceCandidate(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("PROJECT_SOURCE_INVALID");
  const project=(raw as {project?:PathwayProject}).project;
  if (!project) throw Error("PROJECT_SOURCE_INVALID");
  const rebuilt=await createProjectSourceCandidate(project,true);
  const digest=canonicalDigest(rebuilt);
  if(canonicalDigest(raw)!==digest) throw Error("PROJECT_SOURCE_INVALID");
  return {candidate:rebuilt,digest,summary:{projectId:project.projectId,revision:project.revision,sceneCount:project.scenes.length,
    packageDigest:rebuilt.packageDigest,planDigest:rebuilt.planDigest,candidateDigest:digest}};
}

/** Called only by the local operator CLI, never by an HTTP route.
 * The digest is an explicit review guard, not an authentication mechanism. */
export async function approveProjectSourceFile(input: string, output: string, reviewedDigest: string) {
  const {candidate,digest}=await inspectProjectSourceCandidate(await readProjectSourceFile(input));
  if (reviewedDigest !== digest) throw Error("PROJECT_REVIEW_DIGEST_MISMATCH");
  const approved={...candidate,schemaVersion:PROJECT_APPROVAL_SCHEMA,decision:"APPROVED_FOR_REFERENCE_PLAN_QUALIFICATION"};
  const plan=planProjectVisualReferences(candidate.project,candidate.packageDigest,true).references;
  if(await verifyApprovedProjectPlan(plan,approved)!=="PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED") throw Error("PROJECT_SOURCE_INVALID");
  const content=JSON.stringify(approved);
  if(Buffer.byteLength(content)>MAX_PROJECT_SOURCE_BYTES) throw Error("PROJECT_SOURCE_TOO_LARGE");
  await writeFile(output,content,{flag:"wx",mode:0o600});
  return {candidateDigest:digest,executionAuthorized:false,providerCallCount:0};
}
