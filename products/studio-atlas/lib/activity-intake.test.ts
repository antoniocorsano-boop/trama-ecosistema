import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  parseAtlasPrUrl,
  safeIntakePath,
  sha256,
  validateActivityManifest,
  verifyAsset,
} from "./activity-intake";

const body = new TextEncoder().encode("<html>attività</html>");
const digest = sha256(body);
const blob = createHash("sha1").update(Buffer.from("blob " + body.byteLength + "\0")).update(body).digest("hex");

function sample() {
  return {
    contract: "trama.activity-intake/v0.1",
    activityId: "attivita-test",
    version: "0.1.0-draft",
    title: "Attività con materiali originali",
    kind: "INTERACTIVE_ESCAPE_ROOM",
    assets: [
      { id: "experience", path: "experience.html", type: "INTERACTIVE_HTML", sha256: digest, gitBlob: blob, bytes: body.length },
    ],
    experience: { entrypoint: "experience.html", entrypointSha256: digest },
    review: { status: "DRAFT_PENDING_HUMAN_REVIEW" },
  };
}

test("accepts only GitHub pull requests in the authorized Atlas repository", () => {
  const reviewUrl = "https://github.com/antoniocorsano-boop/" + ["Curri", "culum-Atlas"].join("") + "/pull/84";
  assert.equal(parseAtlasPrUrl(reviewUrl), 84);
  assert.throws(() => parseAtlasPrUrl("https://github.com/evil/repo/pull/84"));
  assert.throws(() => parseAtlasPrUrl(reviewUrl + "?x=y"));
  assert.throws(() => parseAtlasPrUrl(reviewUrl.replace("https:", "http:")));
});

test("accepts a valid general manifest and checks the exact original bytes", () => {
  assert.equal(validateActivityManifest(sample()).assets.length, 1);
  verifyAsset(body, sample().assets[0]);
  assert.throws(() => verifyAsset(new TextEncoder().encode("alterato"), sample().assets[0]), /Impronta/);
});

test("rejects path traversal and unsafe asset references", () => {
  for (const path of ["../secret.txt", "media/../secret.txt", "/secret.txt", "media\\secret.txt", "media/%2e%2e/p"]) {
    assert.throws(() => safeIntakePath(path));
    const altered = sample();
    altered.assets[0].path = path;
    assert.throws(() => validateActivityManifest(altered));
  }
});

test("rejects a missing entrypoint and different expected digest", () => {
  const missing = sample();
  missing.experience.entrypoint = "missing.html";
  assert.throws(() => validateActivityManifest(missing), /principale mancante/);
  const changed = sample();
  changed.experience.entrypointSha256 = "0".repeat(64);
  assert.throws(() => validateActivityManifest(changed), /incoerente/);
});

test("rejects duplicates, absent signatures and wrong Git blob fingerprints", () => {
  const duplicate = sample();
  duplicate.assets.push({ ...duplicate.assets[0], id: "copy" });
  assert.throws(() => validateActivityManifest(duplicate), /duplicate/);
  const unsigned = sample();
  unsigned.assets[0].sha256 = "";
  assert.throws(() => validateActivityManifest(unsigned), /impronta/);
  const wrongGit = sample().assets[0];
  wrongGit.gitBlob = "0".repeat(40);
  assert.throws(() => verifyAsset(body, wrongGit), /Oggetto Git/);
});

test("does not accept implied authority or publication authorization", () => {
  const manifesto = validateActivityManifest(sample());
  assert.equal(manifesto.review?.status, "DRAFT_PENDING_HUMAN_REVIEW");
  assert.equal(manifesto.authorization?.atlasPublished, undefined);
});

test("reject malformed render metadata before persistence",()=>{
  for(const objectives of ["testo",[{}],[42],null]){
    assert.throws(()=>validateActivityManifest({...sample(),learning:{objectives}}),/Metadati/);
  }
  for(const format of [123,"image/svg+xml",null]){
    const m=sample();assert.throws(()=>validateActivityManifest({...m,assets:[{...m.assets[0],type:"IMAGE",format}]}),/Formato/);
  }
  assert.throws(()=>validateActivityManifest({...sample(),learning:{suggestedDurationMinutes:"25"}}),/Durata/);
  assert.throws(()=>validateActivityManifest({...sample(),authorization:{atlasPublished:true}}),/Autorizzazione/);
});
