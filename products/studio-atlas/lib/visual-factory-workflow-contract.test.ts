import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const WORKFLOW = new URL("../../../.github/workflows/visual-factory-orchestrator-v0.1.yml", import.meta.url);

test("live orchestrator binds Cloudflare credentials and explicit Workers Free admission", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");

  assert.match(workflow, /CLOUDFLARE_API_TOKEN:\s*\$\{\{\s*secrets\.CLOUDFLARE_API_TOKEN\s*\}\}/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID:\s*\$\{\{\s*vars\.CLOUDFLARE_ACCOUNT_ID\s*\}\}/);
  assert.match(workflow, /CLOUDFLARE_WORKERS_FREE_ADMITTED:\s*\$\{\{\s*vars\.CLOUDFLARE_WORKERS_FREE_ADMITTED\s*\}\}/);
  assert.doesNotMatch(workflow, /^\s*CLOUDFLARE_WORKERS_FREE_ADMITTED:\s*["']?true["']?\s*$/m);
});

test("reference workflow can scope one canonical reference without weakening preflight", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");

  assert.match(workflow, /reference_subject:/);
  for (const subject of ["all", "lia", "omar", "teo", "sala-zero", "cabina-regia"]) {
    assert.match(workflow, new RegExp(`- ${subject.replace("-", "\\-")}`));
  }
  assert.match(workflow, /REFERENCE_SUBJECT:\s*\$\{\{\s*inputs\.reference_subject\s*\}\}/);
  assert.match(workflow, /--subject\s+"\$REFERENCE_SUBJECT"/);
});

test("workflow derives the canonical HF reserve from the governed plan type", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");

  assert.doesNotMatch(
    workflow,
    /VISUAL_FACTORY_UNFINISHED_CANONICAL_REFERENCES:\s*\$\{\{\s*inputs\.mode\s*==\s*'shots'\s*&&\s*'0'\s*\|\|\s*'5'\s*\}\}/,
  );
  assert.match(workflow, /PLAN_TYPE=.*visual-generation-plan\.json/);
  assert.match(workflow, /REFERENCE_GENERATION\)[\s\S]*VISUAL_FACTORY_UNFINISHED_CANONICAL_REFERENCES=5/);
  assert.match(workflow, /SHOT_GENERATION\)[\s\S]*VISUAL_FACTORY_UNFINISHED_CANONICAL_REFERENCES=0/);
  assert.match(workflow, /UNSUPPORTED_VISUAL_GENERATION_PLAN_TYPE/);
});

test("supplied governed plans cannot be silently re-scoped by reference_subject", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");

  assert.match(workflow, /if \[ -n "\$PLAN_PATH" \] && \[ "\$REFERENCE_SUBJECT" != "all" \]; then/);
  assert.match(workflow, /PLAN_PATH_REQUIRES_REFERENCE_SUBJECT_ALL/);
});
