import { createHash } from "node:crypto";

export type IntakeAsset = {
  id: string;
  path: string;
  type: string;
  sha256: string;
  format?: string;
  bytes?: number;
  gitBlob?: string;
};

export type ActivityIntakeManifest = {
  contract: "trama.activity-intake/v0.1";
  activityId: string;
  version: string;
  title: string;
  kind: string;
  assets: IntakeAsset[];
  learning?: {
    suggestedDurationMinutes?: number;
    objectives?: string[];
    evidenceTypes?: string[];
    arenaObjectiveRefs?: string[];
    arenaCurricoloVersionRef?: string | null;
  };
  experience?: { entrypoint?: string; entrypointSha256?: string; embeddedImagesCount?: number };
  review?: Record<string, string>;
  authorization?: Record<string, boolean>;
};

const SHA256 = /^[0-9a-f]{64}$/;
const SAFE_ID = /^[a-z0-9][a-z0-9._-]{2,127}$/;
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;
const MAX_ASSETS = 100;
const FORMATS:Record<string,readonly string[]>={
  IMAGE:["image/webp"], SOURCE_MASTER:["image/png","image/jpeg","image/webp"],
  INTERACTIVE_HTML:["text/html"], TEACHER_GUIDE:["text/html"]
};
function record(value:unknown):value is Record<string,unknown>{
  return !!value && typeof value==="object" && !Array.isArray(value);
}
function strings(value:unknown,field:string,maxItems=100,maxLength=1200) {
  if(value!==undefined && (!Array.isArray(value)||value.length>maxItems||
    value.some(v=>typeof v!=="string"||v.length>maxLength))) throw new Error("Metadati non validi: "+field);
}

export function parseAtlasPrUrl(source: string): number {
  let url: URL;
  try { url = new URL(source); } catch { throw new Error("Indirizzo GitHub non valido"); }
  const prefix = "/antoniocorsano-boop/" + ["Curri", "culum-Atlas"].join("") + "/pull/";
  const remainder = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : "";
  const match = /^([1-9][0-9]{0,6})\/?$/.exec(remainder);
  if (url.origin !== "https://github.com" || !match || url.search || url.hash) {
    throw new Error("Usa un collegamento a una PR di acquisizione di Curricolo Atlas");
  }
  return Number(match[1]);
}

export function safeIntakePath(path: unknown): asserts path is string {
  if (typeof path !== "string" || path.length > 240 || path.length < 1 ||
      path.startsWith("/") || path.includes("\\") || path.includes("%") ||
      path.split("/").some((segment) =>
        segment === "." || segment === ".." || !SAFE_PATH_SEGMENT.test(segment))) {
    throw new Error("Percorso di risorsa non sicuro");
  }
}

export function validateActivityManifest(value: unknown): ActivityIntakeManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Manifesto non valido");
  const m = value as Record<string, unknown>;
  if (m.contract !== "trama.activity-intake/v0.1" ||
      typeof m.activityId !== "string" || !SAFE_ID.test(m.activityId) ||
      typeof m.version !== "string" || !/^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$/.test(m.version) ||
      typeof m.title !== "string" || !m.title.trim() || m.title.length > 160 ||
      typeof m.kind !== "string" || !m.kind.trim()) throw new Error("Identità o contratto dell'attività non valido");
  if (!Array.isArray(m.assets) || m.assets.length < 1 || m.assets.length > MAX_ASSETS) {
    throw new Error("Elenco risorse vuoto o eccessivo");
  }
  const seen = new Set<string>();
  const ids = new Set<string>();
  for (const item of m.assets) {
    if (!item || typeof item !== "object") throw new Error("Risorsa non valida");
    const a = item as Record<string, unknown>;
    safeIntakePath(a.path);
    if (typeof a.id !== "string" || !SAFE_ID.test("a-" + a.id) ||
        typeof a.type !== "string" || !a.type ||
        typeof a.sha256 !== "string" || !SHA256.test(a.sha256)) {
      throw new Error("Identità o impronta della risorsa non valida");
    }
    const formats=typeof a.type==="string"&&Object.hasOwn(FORMATS,a.type)?FORMATS[a.type]:undefined;
    const format=a.format??(a.type==="IMAGE"?"image/webp":"text/html");
    if(!formats||typeof format!=="string"||!formats.includes(format)||
      (a.format!==undefined&&typeof a.format!=="string")) throw new Error("Formato risorsa non valido");
    if (a.bytes !== undefined && (!Number.isInteger(a.bytes) || (a.bytes as number) < 0)) {
      throw new Error("Dimensione della risorsa non valida");
    }
    if (a.gitBlob !== undefined && (typeof a.gitBlob !== "string" || !/^[0-9a-f]{40}$/.test(a.gitBlob))) {
      throw new Error("Impronta Git non valida");
    }
    if (seen.has(a.path) || ids.has(a.id)) throw new Error("Risorse duplicate");
    seen.add(a.path);
    ids.add(a.id);
  }
  if(m.learning!==undefined){
    if(!record(m.learning)) throw new Error("Metadati didattici non validi");
    const l=m.learning;
    strings(l.objectives,"obiettivi");strings(l.evidenceTypes,"evidenze");
    strings(l.arenaObjectiveRefs,"riferimenti Arena",100,160);strings(l.udaRefs,"riferimenti UDA",100,160);
    if(l.suggestedDurationMinutes!==undefined &&
      (typeof l.suggestedDurationMinutes!=="number"||!Number.isInteger(l.suggestedDurationMinutes)||l.suggestedDurationMinutes<1||l.suggestedDurationMinutes>240)) throw new Error("Durata non valida");
    if(l.arenaCurricoloVersionRef!==undefined&&l.arenaCurricoloVersionRef!==null&&
      (typeof l.arenaCurricoloVersionRef!=="string"||l.arenaCurricoloVersionRef.length>160)) throw new Error("Riferimento non valido");
  }
  if(m.review!==undefined&&(!record(m.review)||Object.values(m.review).some(v=>typeof v!=="string"||v.length>160))) throw new Error("Revisione non valida");
  if(m.authorization!==undefined&&(!record(m.authorization)||Object.values(m.authorization).some(v=>v!==false))) throw new Error("Autorizzazione non valida");
  if(m.experience!==undefined&&!record(m.experience)) throw new Error("Esperienza non valida");
  const experience = m.experience as Record<string, unknown> | undefined;
  if(experience?.embeddedImagesCount!==undefined && (typeof experience.embeddedImagesCount!=="number"||
    !Number.isInteger(experience.embeddedImagesCount)||experience.embeddedImagesCount<0||experience.embeddedImagesCount>MAX_ASSETS)) throw new Error("Numero immagini non valido");
  if (experience?.entrypoint !== undefined) {
    safeIntakePath(experience.entrypoint);
    if (!seen.has(experience.entrypoint) || !m.assets.some((a:IntakeAsset)=>a.path===experience.entrypoint&&a.type==="INTERACTIVE_HTML")) throw new Error("File principale mancante");
    if (typeof experience.entrypointSha256 !== "string" ||
        !SHA256.test(experience.entrypointSha256) ||
        m.assets.every((a: IntakeAsset) =>
          a.path !== experience.entrypoint || a.sha256 !== experience.entrypointSha256)) {
      throw new Error("Impronta del file principale incoerente");
    }
  }
  return m as ActivityIntakeManifest;
}

export function sha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function verifyAsset(data: Uint8Array, asset: IntakeAsset): void {
  if (sha256(data) !== asset.sha256) throw new Error("Impronta non corrispondente: " + asset.path);
  if (asset.bytes !== undefined && data.byteLength !== asset.bytes) {
    throw new Error("Dimensione non corrispondente: " + asset.path);
  }
  if (asset.gitBlob) {
    const header = Buffer.from("blob " + data.byteLength + "\0", "utf8");
    const gitSha = createHash("sha1").update(header).update(data).digest("hex");
    if (gitSha !== asset.gitBlob) throw new Error("Oggetto Git non corrispondente: " + asset.path);
  }
}
