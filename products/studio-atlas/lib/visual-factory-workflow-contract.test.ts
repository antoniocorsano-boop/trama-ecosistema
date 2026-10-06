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

test("live orchestrator binds a configurable Cloudflare timeout instead of hard-coding a larger timeout", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");

  assert.match(workflow, /VISUAL_FACTORY_CLOUDFLARE_TIMEOUT_MS:\s*\$\{\{\s*vars\.VISUAL_FACTORY_CLOUDFLARE_TIMEOUT_MS\s*\}\}/);
  assert.doesNotMatch(workflow, /^\s*VISUAL_FACTORY_CLOUDFLARE_TIMEOUT_MS:\s*["']?180000["']?\s*$/m);
});
