import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/visual-factory/execute/route";
import { createMuseoZeroPilotProject } from "./canonical/museo-zero";
import { getMuseoZeroReferenceIntent } from "./canonical/museo-zero-visual-intents";
import {
  assertExactCanonicalVisualPreflightBoundPlan,
} from "./visual-factory-execution-contract";
import {
  compileReferenceJobs,
  createInitialVisualFactoryState,
  type VisualGenerationPlan,
} from "./visual-factory";
import {
  createVisualPreflightReceipt,
  type VisualPreflightReceipt,
} from "./visual-preflight";

const DIGEST = "a".repeat(64);

function issuedReferenceFixture(): {
  plan: VisualGenerationPlan;
  receipt: VisualPreflightReceipt;
} {
  const project = createMuseoZeroPilotProject();
  const spec = { ...getMuseoZeroReferenceIntent("lia"), packageDigest: DIGEST };
  const receipt = createVisualPreflightReceipt({
    spec,
    providerFamily: "FLUX2_KLEIN_4B",
    semanticCritic: { mode: "NOT_AVAILABLE", result: "NOT_RUN", findings: [] },
    humanPreflightDecision: "PASS",
    createdAt: "2026-10-06T03:10:00.000Z",
  });
  const state = {
    ...createInitialVisualFactoryState(DIGEST),
    referenceLocks: ["omar", "teo", "sala-zero", "cabina-regia"].map((subjectRef) => ({
      subjectRef,
      assetId: `${subjectRef}-locked`,
      assetUrl: `https://assets.invalid/${subjectRef}.png`,
      packageDigest: DIGEST,
      lockedAt: "2026-10-06T03:10:00.000Z",
    })),
  };
  return {
    receipt,
    plan: compileReferenceJobs(project, DIGEST, state, [receipt]),
  };
}

test("exact execution admission cannot synthesize Human Preflight PASS", () => {
  const { plan, receipt } = issuedReferenceFixture();

  assert.throws(
    () => assertExactCanonicalVisualPreflightBoundPlan(plan, []),
    /VISUAL_PREFLIGHT_EVIDENCE_REQUIRED/,
  );
  assert.doesNotThrow(() => assertExactCanonicalVisualPreflightBoundPlan(plan, [receipt]));
});

test("HTTP execution route stays inert without a trusted persisted preflight evidence directory", async () => {
  const { plan } = issuedReferenceFixture();
  const previous = process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR;
  delete process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR;

  try {
    const response = await POST(new Request("http://localhost/api/visual-factory/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(plan),
    }));

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { error: "PREFLIGHT_EVIDENCE_UNAVAILABLE" });
  } finally {
    if (previous === undefined) delete process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR;
    else process.env.VISUAL_FACTORY_PREFLIGHT_EVIDENCE_DIR = previous;
  }
});
