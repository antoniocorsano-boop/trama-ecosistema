/**
 * AWC-F Sala Zero: reader for the exact, qualified, non-public technical evidence archive.
 * No upload, network request, script execution, project mutation or student permission.
 * This is a review of captured 3-D frames, NOT an interactive 3-D student runtime.
 */
export const AWC_F_ARCHIVE_SHA256 =
  "782027195f22b61b55a6774f97996c3350c4cd02d961ed9dc395778577f3d63f";
export const AWC_F_PRODUCER_REVISION =
  "6285c47cf3c87e847fd6d00f8f6dfc8142590760";
export const AWC_F_PLAN_SHA256 =
  "fe6262023d8fb7d23317041da69475234448698431a89fff3cc0517c4c7756e3";

export type AwcFrame = "reference" | "rotated" | "restored" | "cue-B";
export type AwcRenderer = "art" | "web";
export const AWC_FRAMES: readonly AwcFrame[] = ["reference", "rotated", "restored", "cue-B"];
const FILES = new Set([
  "museo-art-reference.png", "museo-art-rotated.png",
  "museo-art-restored.png", "museo-art-cue-B.png",
  "museo-web-reference.png", "museo-web-rotated.png",
  "museo-web-restored.png", "museo-web-cue-B.png",
  "museo-web-mobile.png", "museo-artistic.json",
  "museo-browser.json", "transfer-plan.json", "transfer-report.json",
]);
const MAX_COMPRESSED_BYTES = 2_000_000;
const MAX_UNCOMPRESSED_BYTES = 2_000_000;

function requireValid(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Read the central directory: never trust local header sizes or names alone. */
export async function readPinnedEvidenceZip(
  source: Uint8Array,
  expectedDigest: string = AWC_F_ARCHIVE_SHA256,
): Promise<Map<string, Uint8Array>> {
  requireValid(source.length >= 22 && source.length <= MAX_COMPRESSED_BYTES, "Dimensione archivio non valida");
  requireValid(await sha256Hex(source) === expectedDigest, "L'archivio non coincide con la prova AWC-F qualificata");
  const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const end = source.length - 22;
  const u16 = (offset: number) => view.getUint16(offset, true);
  const u32 = (offset: number) => view.getUint32(offset, true);
  requireValid(u32(end) === 0x06054b50 && u16(end + 20) === 0, "Indice ZIP assente o commentato");
  const count = u16(end + 10);
  const directorySize = u32(end + 12);
  const directoryStart = u32(end + 16);
  requireValid(
    count === FILES.size && u16(end + 8) === count &&
    u16(end + 4) === 0 && u16(end + 6) === 0 &&
    directoryStart + directorySize === end,
    "Indice ZIP non conforme",
  );
  let offset = directoryStart;
  let total = 0;
  const result = new Map<string, Uint8Array>();
  const decode = new TextDecoder("utf-8", { fatal: true });
  for (let index = 0; index < count; index++) {
    requireValid(offset + 46 <= end && u32(offset) === 0x02014b50, "Indice ZIP interrotto");
    const flags = u16(offset + 8), method = u16(offset + 10);
    const compressed = u32(offset + 20), size = u32(offset + 24);
    const nameSize = u16(offset + 28), extraSize = u16(offset + 30), commentSize = u16(offset + 32);
    const localOffset = u32(offset + 42);
    const after = offset + 46 + nameSize + extraSize + commentSize;
    requireValid(after <= end && (flags === 0 || flags === 8 || flags === 0x800 || flags === 0x808) &&
      method === 8 && size > 0 && size <= 400_000 &&
      compressed > 0 && compressed <= 400_000, "Formato ZIP non supportato");
    const name = decode.decode(source.subarray(offset + 46, offset + 46 + nameSize));
    requireValid(FILES.has(name) && !result.has(name), "File non previsto o duplicato");
    requireValid(localOffset + 30 <= directoryStart && u32(localOffset) === 0x04034b50 &&
      u16(localOffset + 6) === flags && u16(localOffset + 8) === method, "Intestazione locale incoerente");
    const localNameSize = u16(localOffset + 26), localExtraSize = u16(localOffset + 28);
    const localName = decode.decode(source.subarray(localOffset + 30, localOffset + 30 + localNameSize));
    const begin = localOffset + 30 + localNameSize + localExtraSize;
    requireValid(localName === name && begin + compressed <= directoryStart, "Risorsa ZIP fuori dai limiti");
    total += size;
    requireValid(total <= MAX_UNCOMPRESSED_BYTES, "Archivio espanso troppo grande");
    const stream = new Blob([new Uint8Array(source.subarray(begin, begin + compressed))])
      .stream().pipeThrough(new DecompressionStream("deflate-raw"));
    const expanded = new Uint8Array(await new Response(stream).arrayBuffer());
    requireValid(expanded.length === size, "Dimensione decompressa incoerente");
    result.set(name, expanded);
    offset = after;
  }
  requireValid(offset === end && result.size === FILES.size, "Archivio non completo");
  return result;
}

export type AwcEvidencePreview = {
  sourceRevision: string;
  planDigest: string;
  scene: "sala-zero.projection-cue";
  images: Record<AwcRenderer, Record<AwcFrame, Blob>>;
  mobileImage: Blob;
};

export async function validateAwcEvidenceArchive(input: Uint8Array): Promise<AwcEvidencePreview> {
  const files = await readPinnedEvidenceZip(input);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const json = (name: string): Record<string, unknown> =>
    JSON.parse(decoder.decode(files.get(name))) as Record<string, unknown>;
  const report = json("transfer-report.json");
  const plan = json("transfer-plan.json");
  const browser = json("museo-browser.json");
  const artistic = json("museo-artistic.json");
  requireValid(report.schema === "atlas.awc.transfer-report/v1" &&
    report.status === "PASS_AWC_F_SECOND_WORLD" &&
    report.revision === AWC_F_PRODUCER_REVISION &&
    report.planSha256 === AWC_F_PLAN_SHA256 &&
    report.scene === "sala-zero.projection-cue" &&
    report.world === "museo-zero.transfer", "Identità del rapporto AWC-F non valida");
  requireValid(report.artisticApproval === false && report.studentAuthorized === false &&
    report.publishable === false && report.publicDeployment === false &&
    report.blenderRollbackExact === true && report.webglRollbackExact === true,
    "Diritti o reversibilità della prova non conformi");
  requireValid(plan.schema === "atlas.awc.transfer-plan/v1" &&
    plan.mode === "ISOLATED_LAB_ONLY" && plan.planSha256 === AWC_F_PLAN_SHA256 &&
    plan.scene === report.scene && plan.readyForProduction === false &&
    plan.studentAuthorized === false && plan.publishable === false,
    "Piano AWC-F non isolato");
  requireValid(browser.status === "PASS_MUSEO_INTERACTIVE_TRANSFER" &&
    artistic.status === "PASS_MUSEO_ARTISTIC_DERIVATIVE" &&
    browser.planSha256 === report.planSha256 && artistic.planSha256 === report.planSha256,
    "Derivazioni Blender/WebGL non corrispondenti");
  const authority = report.authority as Record<string, unknown> | undefined;
  requireValid(authority && Object.keys(authority).length > 0 &&
    Object.values(authority).every((value) => value === false), "Autorizzazioni non consentite");

  const index = report.files as Record<string, { sha256: string; bytes: number }> | undefined;
  requireValid(index && Object.keys(index).length === 12, "Inventario immagini e rapporti non valido");
  const frames = {} as Record<AwcRenderer, Record<AwcFrame, Blob>>;
  for (const renderer of ["art", "web"] as const) {
    const images = {} as Record<AwcFrame, Blob>;
    for (const frame of AWC_FRAMES) {
      const name = `museo-${renderer}-${frame}.png`;
      const data = files.get(name);
      requireValid(data && index[name] && index[name].sha256 === await sha256Hex(data) &&
        index[name].bytes === data.length, "Integrità immagine fallita: " + name);
      requireValid(data.length >= 24 && data[0] === 137 && data[1] === 80 && data[2] === 78 &&
        data[3] === 71 && new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(16) === 640 &&
        new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(20) === 480,
        "Dimensioni o formato immagine non conformi");
      images[frame] = new Blob([new Uint8Array(data)], { type: "image/png" });
    }
    frames[renderer] = images;
  }
  const mobile = files.get("museo-web-mobile.png");
  requireValid(mobile && index["museo-web-mobile.png"] &&
    index["museo-web-mobile.png"].sha256 === await sha256Hex(mobile),
    "Anteprima mobile non valida");
  return {
    sourceRevision: AWC_F_PRODUCER_REVISION,
    planDigest: AWC_F_PLAN_SHA256,
    scene: "sala-zero.projection-cue",
    images: frames,
    mobileImage: new Blob([new Uint8Array(mobile)], { type: "image/png" }),
  };
}
