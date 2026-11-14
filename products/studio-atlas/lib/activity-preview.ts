import { decodeUtf8, isolatedHtml, type ActivityDraft, type ActivityFile } from "./activity-drafts";

type PreviewKind = "EXPERIENCE" | "GUIDE";
type Pin = { path: string; sha256: string };
type Pins = Record<PreviewKind, Pin>;

// Only the exact pinned pilot artifacts may execute in the reserved teacher preview.
// A manifest or ZIP supplied by an author cannot grant itself this permission.
const MEDIA: Pins = {
  EXPERIENCE: {path:"experience.html",sha256:"18468a82b020ff106c2281d24304570b9e7efb17f25e5eebd6af766764be173b"},
  GUIDE: {path:"teacher/guida_docente.html",sha256:"b7f924e0ac63d0e314f9ece0af672958a83fd0fa8a8a3e81be325af93ddb51f8"},
};
const V9: Pins = {
  EXPERIENCE: {path:"experience.html",sha256:"9ae45c2c54e39306f4b0a138d14ec98257205bd65ce50326175292548a60e4ba"},
  GUIDE: {path:"teacher/guida_docente.html",sha256:"a6d8f907d44dcd4061cb3c1cd2ee8147de8bc510b0db5563c9a8fd878c7d2fb3"},
};
const LEGACY: Pins = {
  EXPERIENCE: {path:"experience.html",sha256:"22971583a2a7dc2d45947b4ce19a843a057b05864b9a2b896762728c9519175e"},
  GUIDE: {path:"teacher/guida_docente.html",sha256:"ef7fdb31395901843fd844341399d052ee8cb42c859b7425c0f94e3d8bac8541"},
};

function pins(draft: ActivityDraft): Pins | undefined {
  if (draft.status !== "DRAFT_PENDING_HUMAN_REVIEW") return;
  const s=draft.source;
  if(s.kind==="LOCAL_ZIP" && draft.activityId==="trama-missione-118-2026" &&
    draft.version==="0.4.1-draft" && draft.manifestDigest==="1b00cf15c4dc7a54e805489f631b4d7135a3f50e3fd8ec5ee2267d6fd849d990" &&
    s.archiveDigest==="ab2c5a6b48ccb2aa2196c1a91e9aa7452ea36390e98463f7f495c4d709af684e" && s.manifestPath==="intake.json") return V9;
  if(s.kind==="LOCAL_ZIP" && draft.activityId==="trama-missione-118-luce-giusta" &&
    draft.version==="0.1.1-draft" &&
    draft.manifestDigest==="765d7885dd457a90afdb0aadd6b31ae95b286160b140a41f7d9d007a786cd977" &&
    s.archiveDigest==="a4a6ea4727eedbce6e1d56b6cb08246a8dcff3faecabf9f48e1d6bfb69d1ba77") return MEDIA;
  if(s.kind!=="LOCAL_ZIP" && s.repository==="antoniocorsano-boop/"+["Curri","culum-Atlas"].join("") &&
    s.pullRequest===84 && s.commitSha==="f0c29655632a7edc6d78c78d48d006aa8da020a2" &&
    draft.activityId==="trama-missione-118-2026") return LEGACY;
}
export function previewFile(draft: ActivityDraft, kind: PreviewKind): ActivityFile | undefined {
  const pin=pins(draft)?.[kind];
  if(!pin) return;
  const type=kind==="EXPERIENCE"?"INTERACTIVE_HTML":"TEACHER_GUIDE";
  const found=draft.files.filter(f=>f.path===pin.path && f.type===type && f.format==="text/html" && f.sha256===pin.sha256);
  if(found.length!==1 || (kind==="EXPERIENCE" && draft.manifest.experience?.entrypoint!==pin.path)) return;
  const declared=draft.manifest.assets.filter(a=>a.path===pin.path && a.type===type && a.sha256===pin.sha256);
  return declared.length===1?found[0]:undefined;
}

export async function verifiedPreviewHtml(draft:ActivityDraft,kind:PreviewKind):Promise<string> {
  const file=previewFile(draft,kind);
  if(!file || !globalThis.crypto?.subtle) throw new Error("Anteprima in attesa di verifica del codice.");
  const bytes=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
  if(digest!==file.sha256) throw new Error("Integrità dell'anteprima non verificata.");
  return isolatedHtml(decodeUtf8(file.base64),kind==="EXPERIENCE");
}
