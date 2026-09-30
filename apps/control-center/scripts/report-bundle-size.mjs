import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dist = new URL("../dist/", import.meta.url);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist.pathname)
  .filter((path) => statSync(path).isFile())
  .map((path) => {
    const body = readFileSync(path);
    return {
      file: relative(dist.pathname, path),
      bytes: body.length,
      gzipBytes: gzipSync(body).length,
    };
  })
  .sort((a, b) => b.gzipBytes - a.gzipBytes);

console.log(JSON.stringify({
  schemaVersion: "trama.control-center-a1-bundle-report/v1",
  files,
}, null, 2));
