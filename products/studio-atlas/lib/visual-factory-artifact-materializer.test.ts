import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { VisualExecutionReceipt } from "./visual-factory";
import { materializeReviewAssets } from "./visual-factory-artifact-materializer";

function succeededReceipt(url: string, sha256: string): VisualExecutionReceipt {
  return {
    schemaVersion: "atlas.visual-execution-receipt/v0.1",
    receiptId: "receipt-review-assets",
    packageDigest: "a".repeat(64),
    status: "SUCCEEDED",
    costClass: "FREE_ONLY",
    assets: [{
      assetId: "lia-1-candidate",
      subjectRef: "lia",
      purpose: "CHARACTER_REFERENCE",
      url,
      sha256,
      modelRef: "black-forest-labs/FLUX.2-klein-4B",
      workflowRef: "hf-zerogpu.flux2-klein-4b/v0.1",
      createdAt: "2026-10-05T17:07:50Z",
      packageDigest: "a".repeat(64),
      provenanceStatus: "RECORDED",
    }],
    paidComputeAuthorized: false,
    allowQualityDowngrade: false,
    runtimeAuthorized: false,
    publicationAuthorityGranted: false,
  };
}

test("materializes authenticated review assets and verifies their receipt digest", async () => {
  const bytes = new TextEncoder().encode("governed-webp-candidate");
  const digest = createHash("sha256").update(bytes).digest("hex");
  const output = await mkdtemp(join(tmpdir(), "vf-review-assets-"));
  try {
    const files = await materializeReviewAssets(
      succeededReceipt("https://studio-atlas-visual-factory-v02.hf.space/gradio_api/file=candidate.webp", digest),
      output,
      {
        token: "hf_test_token",
        fetchImpl: (async (_url: string | URL | Request, init?: RequestInit) => {
          assert.equal(new Headers(init?.headers).get("authorization"), "Bearer hf_test_token");
          return new Response(bytes, { status: 200, headers: { "content-type": "image/webp" } });
        }) as typeof fetch,
      },
    );
    assert.equal(files.length, 1);
    assert.deepEqual(new Uint8Array(await readFile(files[0])), bytes);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("fails closed when a downloaded candidate does not match receipt provenance", async () => {
  const output = await mkdtemp(join(tmpdir(), "vf-review-assets-"));
  try {
    await assert.rejects(
      materializeReviewAssets(
        succeededReceipt("https://studio-atlas-visual-factory-v02.hf.space/gradio_api/file=candidate.webp", "b".repeat(64)),
        output,
        {
          token: "hf_test_token",
          fetchImpl: (async () => new Response("different-bytes", {
            status: 200,
            headers: { "content-type": "image/webp" },
          })) as typeof fetch,
        },
      ),
      /VF_ORCH_ASSET_DIGEST_MISMATCH/,
    );
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("rejects a succeeded receipt with no reviewable assets", async () => {
  const receipt = succeededReceipt("https://studio-atlas-visual-factory-v02.hf.space/gradio_api/file=candidate.webp", "c".repeat(64));
  receipt.assets = [];
  await assert.rejects(
    materializeReviewAssets(receipt, tmpdir(), { token: "hf_test_token" }),
    /VF_ORCH_SUCCEEDED_WITHOUT_ASSETS/,
  );
});

test("never forwards the HF token to an untrusted candidate host", async () => {
  const receipt = succeededReceipt("https://example.invalid/candidate.webp", "d".repeat(64));
  await assert.rejects(
    materializeReviewAssets(receipt, tmpdir(), { token: "hf_test_token" }),
    /VF_ORCH_ASSET_HOST_NOT_ALLOWED/,
  );
});
