import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { POST } from "../app/api/attivita/importa/route";
import { sha256 } from "./activity-intake";

const REPO = "antoniocorsano-boop/" + ["Curri", "culum-Atlas"].join("");
const API = "https://api.github.com/repos/" + REPO;
const COMMIT = "a".repeat(40);
const ROOT = "content/staging/attivita-test/";
const SOURCE_URL = "https://github.com/" + REPO + "/pull/84";

async function fixture() {
  const rawPrefix = "https://raw.githubusercontent.com/" + REPO + "/" + COMMIT + "/";
  const responses = new Map<string, string | Uint8Array>();
  const assets: Array<{ id: string; path: string; type: string; format?: string; sha256: string; bytes: number }> = [];
  for (let i = 1; i <= 8; i++) {
    const path = "media/illustrazione-" + i + ".webp";
    const body = Uint8Array.from(await sharp({create:{width:16,height:16,channels:3,background:{r:i,g:20,b:30}}}).webp().toBuffer());
    assets.push({ id: "illustrazione-" + i, path, type: "IMAGE", format: "image/webp", sha256: sha256(body), bytes: body.length });
    responses.set(rawPrefix + ROOT + path, body);
  }
  const experience = "<!doctype html><html lang='it'><head><title>Prova</title></head><body>Esperienza originale</body></html>";
  const guide = "<!doctype html><html lang='it'><head><title>Guida</title></head><body>Guida originale</body></html>";
  assets.push({ id: "experience", path: "experience.html", type: "INTERACTIVE_HTML", sha256: sha256(new TextEncoder().encode(experience)), bytes: experience.length });
  assets.push({ id: "guide", path: "teacher/guida.html", type: "TEACHER_GUIDE", sha256: sha256(new TextEncoder().encode(guide)), bytes: guide.length });
  responses.set(rawPrefix + ROOT + "experience.html", experience);
  responses.set(rawPrefix + ROOT + "teacher/guida.html", guide);
  const manifest = {
    contract: "trama.activity-intake/v0.1",
    activityId: "attivita-test",
    version: "0.1.0-draft",
    title: "Attività di prova",
    kind: "INTERACTIVE_ESCAPE_ROOM",
    assets,
    experience: { entrypoint: "experience.html", entrypointSha256: assets[8].sha256 },
    review: { status: "DRAFT_PENDING_HUMAN_REVIEW" },
  };
  responses.set(API + "/pulls/84", JSON.stringify({ head: { sha: COMMIT, repo: { full_name: REPO } } }));
  responses.set(API + "/pulls/84/files?per_page=100&page=1", JSON.stringify([{ filename: ROOT + "intake.json" }]));
  responses.set(rawPrefix + ROOT + "intake.json", JSON.stringify(manifest));
  return { responses, rawPrefix };
}

async function runFixture(responses: Map<string, string | Uint8Array>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const value = responses.get(input.toString());
    return new Response(typeof value==="string"?value:value?Uint8Array.from(value):"not found", { status: value === undefined ? 404 : 200 });
  };
  try {
    return await POST(new Request("http://localhost/api/attivita/importa", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: SOURCE_URL }),
    }));
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("generic PR intake imports exactly eight images, experience and guide without loss", async () => {
  const { responses } = await fixture();
  const response = await runFixture(responses);
  assert.equal(response.status, 200);
  const result = await response.json() as { verified: number; draft: { files: Array<{ path: string; base64: string }>; status: string; source: { commitSha: string } } };
  assert.equal(result.verified, 10);
  assert.equal(result.draft.files.length, 10);
  assert.equal(result.draft.status, "DRAFT_PENDING_HUMAN_REVIEW");
  assert.equal(result.draft.source.commitSha, COMMIT);
  assert.equal(Buffer.from(result.draft.files[8].base64, "base64").toString(), responses.get("https://raw.githubusercontent.com/" + REPO + "/" + COMMIT + "/" + ROOT + "experience.html"));
});

test("tampered media fails closed and never returns an incomplete draft", async () => {
  const { responses, rawPrefix } = await fixture();
  responses.set(rawPrefix + ROOT + "media/illustrazione-5.webp", "changed");
  const response = await runFixture(responses);
  assert.equal(response.status, 422);
  const result = await response.json() as { draft?: unknown; error?: string };
  assert.equal(result.draft, undefined);
  assert.match(result.error ?? "", /impronta/i);
});

test("invalid manifest metadata rejected before any draft is returned", async()=>{
  const {responses,rawPrefix}=await fixture();
  const path=rawPrefix+ROOT+"intake.json";
  const manifest=JSON.parse(String(responses.get(path)));
  manifest.learning={objectives:[{}]};
  responses.set(path,JSON.stringify(manifest));
  const response=await runFixture(responses);
  assert.equal(response.status,422);assert.equal((await response.json()).draft,undefined);
});
