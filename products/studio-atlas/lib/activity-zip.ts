import { inflateRawSync, crc32 } from "node:zlib";
import { safeIntakePath, sha256, validateActivityManifest, verifyAsset } from "./activity-intake";

export const MAX_ZIP_BYTES = 17 * 1024 * 1024;
const MAX_FILE = 4 * 1024 * 1024;
const MAX_TOTAL = 16 * 1024 * 1024;
const MAX_ENTRIES = 110;
const MANIFEST_LIMIT = 256 * 1024;

function fail(message: string): never { throw new Error(message); }
function requireOk(condition: unknown, message: string): asserts condition {
  if (!condition) fail(message);
}
function text(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
type Entry = { name: string; size: number; crc: number; method: number; compressed: number; offset: number; flags: number; directory: boolean };

export function readActivityZip(input: Uint8Array): Map<string, Buffer> {
  const b = Buffer.from(input);
  requireOk(b.length >= 22 && b.length <= MAX_ZIP_BYTES, "Dimensione ZIP non valida");
  const end = b.length - 22;
  requireOk(b.readUInt32LE(end) === 0x06054b50 && b.readUInt16LE(end+20) === 0, "ZIP con commento o struttura non supportata");
  const count = b.readUInt16LE(end+10), cdSize = b.readUInt32LE(end+12), cd = b.readUInt32LE(end+16);
  requireOk(b.readUInt16LE(end+4) === 0 && b.readUInt16LE(end+6) === 0 &&
    b.readUInt16LE(end+8) === count && count > 0 && count <= MAX_ENTRIES && cd+cdSize === end, "Indice ZIP non valido");
  let p = cd, total = 0;
  const entries: Entry[] = [], names = new Set<string>();
  for (let i=0; i<count; i++) {
    requireOk(p+46 <= end && b.readUInt32LE(p) === 0x02014b50, "Indice ZIP incompleto");
    const flags=b.readUInt16LE(p+8), method=b.readUInt16LE(p+10), crc=b.readUInt32LE(p+16),
      compressed=b.readUInt32LE(p+20), size=b.readUInt32LE(p+24), n=b.readUInt16LE(p+28),
      extra=b.readUInt16LE(p+30), comment=b.readUInt16LE(p+32), disk=b.readUInt16LE(p+34),
      mode=b.readUInt32LE(p+38)>>>16, offset=b.readUInt32LE(p+42);
    const next=p+46+n+extra+comment;
    requireOk(next<=end && n>0 && disk===0 && (flags & ~0x800)===0 &&
      (method===0 || method===8) && size<=MAX_FILE && compressed<=MAX_ZIP_BYTES, "Formato o dimensione risorsa ZIP non supportati");
    const name=text(b.subarray(p+46,p+46+n)), directory=name.endsWith("/");
    const clean=directory?name.slice(0,-1):name;
    safeIntakePath(clean);
    const fileType=mode & 0xf000;
    requireOk(fileType===0 || fileType===(directory?0x4000:0x8000), "Collegamento o risorsa speciale non ammessi");
    requireOk(!names.has(clean) && (!directory || size===0), "Risorsa ZIP duplicata o cartella non valida");
    names.add(clean);
    total+=size;
    requireOk(total<=MAX_TOTAL, "Pacchetto troppo grande");
    entries.push({name,size,crc,method,compressed,offset,flags,directory});
    p=next;
  }
  requireOk(p===end, "Indice ZIP incoerente");
  const ordered=[...entries].sort((a,c)=>a.offset-c.offset);
  let cursor=0;
  const files=new Map<string,Buffer>();
  for (const e of ordered) {
    const o=e.offset;
    requireOk(o===cursor && o+30<=cd && b.readUInt32LE(o)===0x04034b50, "Intestazione ZIP incoerente");
    const n=b.readUInt16LE(o+26), extra=b.readUInt16LE(o+28), start=o+30+n+extra, stop=start+e.compressed;
    requireOk(start<=cd && stop<=cd && b.readUInt16LE(o+6)===e.flags && b.readUInt16LE(o+8)===e.method &&
      b.readUInt32LE(o+14)===e.crc && b.readUInt32LE(o+18)===e.compressed && b.readUInt32LE(o+22)===e.size &&
      text(b.subarray(o+30,o+30+n))===e.name, "Intestazione ZIP non corrispondente");
    const compressed=b.subarray(start,stop);
    const data=e.method===0?compressed:inflateRawSync(compressed,{maxOutputLength:Math.max(1,e.size)});
    requireOk(data.length===e.size && crc32(data)===e.crc, "Risorsa ZIP danneggiata");
    if(!e.directory) files.set(e.name,data);
    cursor=stop;
  }
  requireOk(cursor===cd, "Dati ZIP non dichiarati");
  return files;
}

export function prepareZipDraft(input: Uint8Array) {
  const files=readActivityZip(input);
  const manifests=[...files.keys()].filter(p=>p==="intake.json" || /^content\/staging\/[a-z0-9][a-z0-9._-]*\/intake\.json$/.test(p));
  requireOk(manifests.length===1,"Il pacchetto deve contenere un unico manifesto di acquisizione");
  const manifestPath=manifests[0], root=manifestPath.slice(0,-"intake.json".length);
  const manifestBytes=files.get(manifestPath)!;
  requireOk(manifestBytes.length<=MANIFEST_LIMIT,"Manifesto troppo grande");
  const raw=JSON.parse(text(manifestBytes));
  const manifest=validateActivityManifest(raw);
  requireOk(manifest.version.endsWith("-draft"),"Solo versioni di bozza sono ammesse");
  requireOk(raw.authorization && ["atlasPublished","studentRuntimeAllowed","docenteOsWriteAllowed","autoMergeAllowed"].every(k=>raw.authorization[k]===false),"Nessuna autorizzazione di pubblicazione ammessa");
  requireOk(raw.review?.status==="DRAFT_PENDING_HUMAN_REVIEW" &&
    Object.entries(raw.review).every(([k,v])=>k==="status" || v==="PENDING"), "Revisione umana non verificata");
  requireOk(raw.experience?.learnerPersonalData===false && raw.experience?.telemetry===false &&
    raw.experience?.trustPolicy==="ISOLATED_HTML_SANDBOX_REQUIRED","Dichiarazioni di riservatezza e isolamento mancanti");
  requireOk(Array.isArray(raw.learning?.arenaObjectiveRefs) && raw.learning.arenaObjectiveRefs.length===0 &&
    Array.isArray(raw.learning?.udaRefs) && raw.learning.udaRefs.length===0 && raw.learning.arenaCurricoloVersionRef===null,
    "Il pacchetto locale non può attribuire riferimenti curricolari o UDA");
  requireOk(files.size===manifest.assets.length+1,"Il pacchetto contiene risorse non dichiarate o mancanti");
  const allowedFormats: Record<string,string[]> = {
    IMAGE:["image/webp"], SOURCE_MASTER:["image/png","image/jpeg","image/webp"],
    INTERACTIVE_HTML:["text/html"], TEACHER_GUIDE:["text/html"]
  };
  const assets=manifest.assets.map(asset=>{
    const data=files.get(root+asset.path);
    requireOk(data,"Risorsa dichiarata assente: "+asset.path);
    verifyAsset(data,asset);
    const format=asset.format??(asset.type==="IMAGE"?"image/webp":"text/html");
    requireOk(allowedFormats[asset.type]?.includes(format),"Tipo di risorsa non supportato");
    if(format==="image/webp") requireOk(data.toString("ascii",0,4)==="RIFF" && data.toString("ascii",8,12)==="WEBP","WebP non valido");
    if(format==="image/png") requireOk(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),"PNG non valido");
    if(format==="image/jpeg") requireOk(data[0]===255 && data[1]===216 && data[2]===255,"JPEG non valido");
    if(format==="text/html") requireOk(/^\s*<!doctype html>\s*<html(?:\s+lang="it")?>\s*<head>/i.test(text(data)),"HTML non conforme per anteprima");
    return {path:asset.path,type:asset.type,format,sha256:asset.sha256,base64:data.toString("base64")};
  });
  requireOk(assets.filter(a=>a.type==="INTERACTIVE_HTML").length===1 && assets.filter(a=>a.type==="TEACHER_GUIDE").length<=1,"File HTML multipli non ammessi");
  const entry=assets.find(a=>a.path===manifest.experience?.entrypoint);
  requireOk(entry?.type==="INTERACTIVE_HTML","Esperienza interattiva mancante");
  const html=text(Buffer.from(entry.base64,"base64"));
  const embedded=[...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)].map(m=>sha256(Buffer.from(m[1],"base64"))).sort();
  const images=manifest.assets.filter(a=>a.type==="IMAGE").map(a=>a.sha256).sort();
  requireOk(raw.experience.embeddedImagesCount===embedded.length && JSON.stringify(embedded)===JSON.stringify(images),
    "Illustrazioni incorporate e risorse dichiarate non corrispondono");
  const digest=sha256(manifestBytes);
  return {draft:{key:manifest.activityId+"@"+manifest.version+"#"+digest,activityId:manifest.activityId,
    version:manifest.version,manifestDigest:digest,manifest,source:{kind:"LOCAL_ZIP" as const,archiveDigest:sha256(input),manifestPath},
    files:assets,status:"DRAFT_PENDING_HUMAN_REVIEW" as const,importedAt:new Date().toISOString()},verified:assets.length};
}
