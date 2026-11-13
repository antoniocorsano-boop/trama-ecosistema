"use client";

export type ActivityFile = {
  path: string;
  type: string;
  format: string;
  sha256: string;
  base64: string;
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

export async function listActivityDrafts(): Promise<ActivityDraft[]> {
  const db = await openDatabase();
  try {
    return await new Promise<ActivityDraft[]>((resolve, reject) => {
      const tx = db.transaction(OBJECTS, "readonly");
      const request = tx.objectStore(OBJECTS).getAll();
      request.onsuccess = () => resolve((request.result as ActivityDraft[]).sort(
        (a, b) => b.importedAt.localeCompare(a.importedAt)
      ));
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveActivityDraft(draft: ActivityDraft): Promise<"SAVED" | "EXISTS"> {
  if (draft.status !== "DRAFT_PENDING_HUMAN_REVIEW" || draft.files.length !== draft.manifest.assets.length) {
    throw new Error("Pacchetto incompleto: nessuna bozza salvata");
  }
  const db = await openDatabase();
  try {
    const entries = await new Promise<ActivityDraft[]>((resolve, reject) => {
      const tx = db.transaction(OBJECTS, "readonly");
      const request = tx.objectStore(OBJECTS).getAll();
      request.onsuccess = () => resolve(request.result as ActivityDraft[]);
      request.onerror = () => reject(request.error);
    });
    const existing = entries.find((item) =>
      item.activityId === draft.activityId && item.version === draft.version
    );
    if (existing) {
      if (existing.manifestDigest !== draft.manifestDigest) {
        throw new Error("Questa versione ha contenuti diversi: serve una nuova versione, senza sostituire lo storico");
      }
      return "EXISTS";
    }
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(OBJECTS, "readwrite");
      tx.objectStore(OBJECTS).add(draft);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Salvataggio annullato"));
    });
    return "SAVED";
  } finally {
    db.close();
  }
}

export function decodeUtf8(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// The frame has an opaque origin, no same-origin permission and no network capabilities.
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
