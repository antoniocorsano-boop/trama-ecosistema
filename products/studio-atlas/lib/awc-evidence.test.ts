import assert from "node:assert/strict";
import { test } from "node:test";
import { crc32, deflateRawSync } from "node:zlib";
import { readPinnedEvidenceZip, sha256Hex, AWC_F_ARCHIVE_SHA256 } from "./awc-evidence";

const entryNames = [
  "museo-art-reference.png", "museo-art-rotated.png", "museo-art-restored.png",
  "museo-art-cue-B.png", "museo-web-reference.png", "museo-web-rotated.png",
  "museo-web-restored.png", "museo-web-cue-B.png", "museo-web-mobile.png",
  "museo-artistic.json", "museo-browser.json", "transfer-plan.json", "transfer-report.json",
];

function buildMinimalZip() {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const name of entryNames) {
    const filename = Buffer.from(name, "utf8");
    const content = Buffer.from(name.endsWith(".json") ? "{}" : "fixture");
    const compressed = deflateRawSync(content);
    const crc = crc32(content);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(8, 8);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(content.length, 22);
    header.writeUInt16LE(filename.length, 26);
    local.push(header, filename, compressed);

    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(8, 10);
    directory.writeUInt32LE(crc, 16);
    directory.writeUInt32LE(compressed.length, 20);
    directory.writeUInt32LE(content.length, 24);
    directory.writeUInt16LE(filename.length, 28);
    directory.writeUInt32LE(offset, 42);
    central.push(directory, filename);
    offset += header.length + filename.length + compressed.length;
  }
  const cd = Buffer.concat(central);
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(entryNames.length, 8);
  footer.writeUInt16LE(entryNames.length, 10);
  footer.writeUInt32LE(cd.length, 12);
  footer.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...local, cd, footer]));
}

test("S3: fingerprint and strict ZIP central directory permit exact controlled fixtures", async () => {
  const source = buildMinimalZip();
  const digest = await sha256Hex(source);
  const result = await readPinnedEvidenceZip(source, digest);
  assert.deepEqual(Array.from(result.keys()), entryNames);
  assert.equal(new TextDecoder().decode(result.get("museo-browser.json")), "{}");
  assert.equal(new TextDecoder().decode(result.get("museo-web-reference.png")), "fixture");
});

test("S3: rejects non-pinned evidence and format tampering without affecting the project", async () => {
  const source = buildMinimalZip();
  assert.notEqual(await sha256Hex(source), AWC_F_ARCHIVE_SHA256);
  await assert.rejects(() => readPinnedEvidenceZip(source), /non coincide/);
  const invalid = new Uint8Array(source);
  invalid[invalid.length - 22] = 0;
  const corruptedDigest = await sha256Hex(invalid);
  await assert.rejects(() => readPinnedEvidenceZip(invalid, corruptedDigest), /Indice ZIP/);
});
