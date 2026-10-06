import assert from "node:assert/strict";
import test from "node:test";
import { compileCanonicalVisualPreflight } from "../scripts/compile-canonical-visual-preflight";

test("offline canonical preflight emits five bound reference bundles and zero execution evidence", async () => {
  const result = await compileCanonicalVisualPreflight({
    mode: "references",
    humanPreflightPass: true,
    createdAt: "2026-10-06T02:40:00.000Z",
  });

  assert.equal(result.schemaVersion, "atlas.visual-preflight-qualification/v0.1");
  assert.equal(result.mode, "references");
  assert.equal(result.providerCallCount, 0);
  assert.equal(result.sourceSpecs.length, 5);
  assert.equal(result.receipts.length, 5);
  assert.equal(result.compiledPromptDigests.length, 5);
  assert.ok(result.receipts.every((receipt) => receipt.finalState === "PREFLIGHT_PASS"));
  assert.ok(result.compiledPromptDigests.every((digest) => /^[0-9a-f]{64}$/.test(digest)));
  assert.ok(result.receipts.every((receipt) => receipt.humanPreflightDecision === "PASS"));
  assert.equal(JSON.stringify(result).includes("atlas.visual-execution-receipt"), false);
  assert.equal(JSON.stringify(result).includes("selectedProvider"), false);
});

test("offline canonical preflight never infers PASS when the semantic critic is unavailable", async () => {
  const result = await compileCanonicalVisualPreflight({
    mode: "references",
    humanPreflightPass: false,
    createdAt: "2026-10-06T02:40:00.000Z",
  });

  assert.equal(result.providerCallCount, 0);
  assert.ok(result.receipts.every((receipt) => receipt.semanticCritic.mode === "NOT_AVAILABLE"));
  assert.ok(result.receipts.every((receipt) => receipt.finalState === "PREFLIGHT_REVISE"));
  assert.ok(result.receipts.every((receipt) => receipt.humanPreflightDecision === undefined));
});
