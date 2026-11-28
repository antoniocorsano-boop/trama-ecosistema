"use client";

import { GALLERY_VERIFIED, verifyArchivedGallery, enrichArchivedGallery } from "./activity-gallery";

export type ActivityFile = {
  path: string;
  type: string;
  format: string;
  sha256: string;
  base64: string;
  pixelWidth?:number;
  pixelHeight?:number;
};

export type ActivityDraft = {
  key: string;
  activityId: string;
  version: string;
  manifestDigest: string;
  manifest: {
    title: string;
    kind: string;
    assets: Array<{ path: string; type: string; id: string; sha256: string }>;
    learning?: {
      suggestedDurationMinutes?: number;
      objectives?: string[];
      evidenceTypes?: string[];
    };
    experience?: { entrypoint?: string };
    review?: Record<string, string>;
  };
  source: {
    kind?: "GITHUB_PR";
    repository: string;
    pullRequest: number;
    commitSha: string;
    manifestPath: string;
  } | { kind: "LOCAL_ZIP"; archiveDigest: string; manifestPath: string };
  files: ActivityFile[];
  status: "DRAFT_PENDING_HUMAN_REVIEW";
  importedAt: string;
  galleryValidation?: typeof GALLERY_VERIFIED | "BLOCKED";
};

const DATABASE = "studio-atlas.activity-drafts.v0.1";
const OBJECTS = "activities";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Questo dispositivo non dispone dell'archivio locale richiesto"));
      return;
    }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(OBJECTS)) {
        database.createObjectStore(OBJECTS, { keyPath: "key" });
      }
    };
    request.onerror = () => reject(request.error ?? new Error("Archivio locale non disponibile"));
    request.onsuccess = () => resolve(request.result);
  });
}

async function migrateGallery(db:IDBDatabase,snapshot:ActivityDraft):Promise<ActivityDraft>{
  if(snapshot.galleryValidation===GALLERY_VERIFIED) return snapshot;
  try {
    const verified=await verifyArchivedGallery(snapshot);
    return await new Promise<ActivityDraft>((resolve,reject)=>{
      const tx=db.transaction(OBJECTS,"readwrite"),store=tx.objectStore(OBJECTS);
      let result:ActivityDraft|undefined;
      const request=store.get(snapshot.key);
      request.onsuccess=()=>{
        try{
          const current=request.result as ActivityDraft|undefined;
          if(!current) throw new Error("Bozza non più disponibile");
          result=enrichArchivedGallery(current,verified);
          store.put(result);
        }catch{tx.abort();}
      };
      tx.oncomplete=()=>result?resolve(result):reject(new Error("Verifica non completata"));
      tx.onerror=()=>reject(tx.error??new Error("Verifica non completata"));
      tx.onabort=()=>reject(tx.error??new Error("Verifica non completata"));
    });
  }catch{
    // Keep the persisted record intact, and fail closed only for this gallery.
    return {...snapshot,galleryValidation:"BLOCKED"};
  }
}
export async function listActivityDrafts(): Promise<ActivityDraft[]> {
  const db = await openDatabase();
  try {
    const snapshots=await new Promise<ActivityDraft[]>((resolve, reject) => {
      const tx = db.transaction(OBJECTS, "readonly");
      const request = tx.objectStore(OBJECTS).getAll();
      request.onsuccess = () => resolve((request.result as ActivityDraft[]).sort(
        (a, b) => b.importedAt.localeCompare(a.importedAt)
      ));
      request.onerror = () => reject(request.error);
    });
    const results:ActivityDraft[]=[];
    // Process one archived activity at a time. No server request and no image decoding.
    for(const snapshot of snapshots) results.push(await migrateGallery(db,snapshot));
    return results;
  } finally {
    db.close();
  }
}

export async function saveActivityDraft(draft: ActivityDraft): Promise<"SAVED" | "EXISTS"> {
  if (draft.status !== "DRAFT_PENDING_HUMAN_REVIEW" || draft.files.length !== draft.manifest.assets.length) {
    throw new Error("Pacchetto incompleto: nessuna bozza salvata");
  }
  const verified=await verifyArchivedGallery(draft);
  const enriched=enrichArchivedGallery(draft,verified);
  const db = await openDatabase();
  try {
    return await new Promise<"SAVED" | "EXISTS">((resolve, reject) => {
      const tx = db.transaction(OBJECTS, "readwrite");
      const store = tx.objectStore(OBJECTS);
      let outcome: "SAVED" | "EXISTS" = "SAVED";
      let failure: Error | undefined;
      const request = store.getAll();
      request.onsuccess = () => {
        const existing = (request.result as ActivityDraft[]).find(item =>
          item.activityId === draft.activityId && item.version === draft.version);
        if (existing) {
          if (existing.manifestDigest !== draft.manifestDigest) {
            failure = new Error("Questa versione ha contenuti diversi: serve una nuova versione, senza sostituire lo storico");
            tx.abort();
          } else {
            try {
              // A same-digest reimport may repair missing metadata, never replace archived bytes.
              if(existing.galleryValidation!==GALLERY_VERIFIED) store.put(enrichArchivedGallery(existing,verified));
              outcome="EXISTS";
            } catch {
              failure=new Error("Le risorse archiviate non corrispondono: originali conservati, verifica necessaria");
              tx.abort();
            }
          }
        } else store.add(enriched);
      };
      tx.oncomplete = () => resolve(outcome);
      tx.onerror = () => reject(failure ?? tx.error ?? new Error("Salvataggio non riuscito"));
      tx.onabort = () => reject(failure ?? tx.error ?? new Error("Salvataggio annullato"));
    });
  } finally {
    db.close();
  }
}

export function decodeUtf8(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Defense in depth for pinned content; sandbox/CSP alone do not block every navigation.
// CSP must precede every script, style or other resource in the untrusted HTML.
export function isolatedHtml(html: string, interactive: boolean): string {
  const policy =
    "default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; " +
    "font-src data:; media-src data: blob:; connect-src 'none'; " +
    "worker-src 'none'; frame-src 'none'; form-action 'none'; " +
    "base-uri 'none'; object-src 'none'; " +
    (interactive ? "script-src 'unsafe-inline';" : "script-src 'none';");
  if (!/^\s*<!doctype html>\s*<html(?:\s[^<>]*)?>\s*<head(?:\s[^<>]*)?>/i.test(html)) {
    throw new Error("Anteprima non disponibile: intestazione HTML mancante");
  }
  return html.replace(/^\s*<!doctype html>\s*<html(?:\s[^<>]*)?>\s*<head(?:\s[^<>]*)?>/i, (head) =>
    head + '<meta http-equiv="Content-Security-Policy" content="' + policy + '">'
  );
}
