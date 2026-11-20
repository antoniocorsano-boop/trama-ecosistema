import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const require = createRequire(import.meta.url);
const base = resolve(import.meta.dirname, "..");
const origin = readFileSync(join(base, "lib/fixtures/awc-museo-zero-transfer.json"));
const gitBlob = bytes => createHash("sha1").update(Buffer.concat([
  Buffer.from("blob " + bytes.length + "\0"), bytes,
])).digest("hex");
if (gitBlob(origin) !== "f8e91ca7fd7aa2b5df9b777703ca443df2dbc912")
  throw Error("AWC-F: source fixture has drifted");
const source = JSON.parse(origin.toString("utf8"));
if (source.mode !== "ISOLATED_LAB_ONLY" || source.scene !== "sala-zero.projection-cue" ||
    Object.values(source.authority).some(Boolean))
  throw Error("AWC-F: unsuitable or unauthorized source");

const engine = readFileSync(require.resolve("three/build/three.min.js"));
if (gitBlob(engine) !== "b14f47c0908bab15e890b468d53bb07db0be3a18")
  throw Error("AWC-F: Three.js r128 engine differs from the qualified version");
if (engine.toString("utf8").toLowerCase().includes("</script"))
  throw Error("Unexpected script delimiter in the verified library");
const template = readFileSync(join(base, "scripts/awc-s3b-offline-template.html"), "utf8");
const app = template.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)?.[1];
const css = template.match(/<style>([\s\S]*?)<\/style>/)?.[1];
if (!app || !css || !template.includes("__ENGINE_HASH__")) throw Error("Invalid offline template");
const cspHash = value => createHash("sha256").update(value).digest("base64");
const scene = JSON.stringify(source.sceneSpec).replaceAll("<", "\\u003c");
const html = template
  .replace("__SCENE_SPEC__", scene)
  .replace("__THREE_RUNTIME__", engine.toString("utf8"))
  .replace("__ENGINE_HASH__", cspHash(engine))
  .replace("__APP_HASH__", cspHash(app))
  .replace("__CSS_HASH__", cspHash(css));

if (/__(?:SCENE_SPEC|THREE_RUNTIME|ENGINE_HASH|APP_HASH|CSS_HASH)__/.test(html) ||
    /https?:\/\/|<script\s+src=/i.test(html))
  throw Error("Offline trial contains an unresolved resource or network link");
const destDir = resolve(process.argv[2] || join(base, ".artifacts"));
mkdirSync(destDir, { recursive: true });
const path = join(destDir, "awc-sala-zero-live-webgl-offline.html");
writeFileSync(path, html, "utf8");
console.log(JSON.stringify({
  status: "OFFLINE_S3B_TRIAL_READY", path, bytes: Buffer.byteLength(html),
  sha256: createHash("sha256").update(html).digest("hex"),
  sourceBlob: gitBlob(origin), engineBlob: gitBlob(engine), studentAuthorized: false,
}));
