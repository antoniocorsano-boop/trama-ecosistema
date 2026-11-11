import { NextResponse } from "next/server";
import {
  parseAtlasPrUrl,
  safeIntakePath,
  sha256,
  validateActivityManifest,
  verifyAsset,
} from "../../../../lib/activity-intake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPOSITORY = "antoniocorsano-boop/" + ["Curri", "culum-Atlas"].join("");
const API = "https://api.github.com/repos/" + REPOSITORY;
const RAW = "https://raw.githubusercontent.com/" + REPOSITORY + "/";
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_BYTES = 16 * 1024 * 1024;
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "Studio-Atlas-LOI-01",
};

type ChangedFile = { filename: string };
type Pull = { state: string; head: { sha: string; repo: { full_name: string } } };
type StoredFile = { path: string; type: string; format: string; sha256: string; base64: string };

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("GitHub non ha restituito i dati richiesti");
  return response.json() as Promise<T>;
}

async function readBytes(url: string, max = MAX_FILE_BYTES): Promise<Uint8Array> {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error("Risorsa assente dalla revisione GitHub");
  const length = Number(response.headers.get("content-length") ?? "0");
  if (length > max) throw new Error("Risorsa troppo grande per l'importazione");
  const data = new Uint8Array(await response.arrayBuffer());
  if (data.byteLength > max) throw new Error("Risorsa troppo grande per l'importazione");
  return data;
}

async function changedFiles(prNumber: number): Promise<string[]> {
  const all: string[] = [];
  for (let page = 1; page <= 5; page++) {
    const files = await readJson<ChangedFile[]>(
      API + "/pulls/" + prNumber + "/files?per_page=100&page=" + page
    );
    all.push(...files.map((file) => file.filename));
    if (files.length < 100) return all;
  }
  throw new Error("Revisione troppo estesa: occorre un pacchetto dedicato");
}

function rawUrl(sha: string, path: string) {
  safeIntakePath(path);
  return RAW + sha + "/" + path.split("/").map(encodeURIComponent).join("/");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body?.url !== "string" || body.url.length > 220) {
      return NextResponse.json({ error: "Inserisci il collegamento alla revisione GitHub" }, { status: 400 });
    }
    const prNumber = parseAtlasPrUrl(body.url);
    const pr = await readJson<Pull>(API + "/pulls/" + prNumber);
    if (pr.head?.repo?.full_name !== REPOSITORY || !/^[a-f0-9]{40}$/.test(pr.head?.sha ?? "")) {
      throw new Error("Origine della revisione non verificata");
    }
    const files = await changedFiles(prNumber);
    const manifests = files.filter((p) =>
      /^content\/staging\/[a-z0-9][a-z0-9._-]*\/intake\.json$/.test(p)
    );
    if (manifests.length !== 1) throw new Error("La revisione deve contenere un unico manifesto di acquisizione");
    const manifestPath = manifests[0];
    const root = manifestPath.slice(0, -"intake.json".length);
    const manifestBytes = await readBytes(rawUrl(pr.head.sha, manifestPath), 256 * 1024);
    const manifest = validateActivityManifest(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(manifestBytes)));

    let totalBytes = manifestBytes.byteLength;
    const assets: StoredFile[] = [];
    for (const asset of manifest.assets) {
      const data = await readBytes(rawUrl(pr.head.sha, root + asset.path));
      verifyAsset(data, asset);
      totalBytes += data.byteLength;
      if (totalBytes > MAX_TOTAL_BYTES) throw new Error("Pacchetto troppo grande");
      assets.push({
        path: asset.path,
        type: asset.type,
        format: asset.format ?? (asset.type === "IMAGE" ? "image/webp" : "text/html"),
        sha256: asset.sha256,
        base64: Buffer.from(data).toString("base64"),
      });
    }
    return NextResponse.json({
      draft: {
        key: manifest.activityId + "@" + manifest.version + "#" + sha256(manifestBytes),
        activityId: manifest.activityId,
        version: manifest.version,
        manifestDigest: sha256(manifestBytes),
        manifest,
        source: {
          repository: REPOSITORY,
          pullRequest: prNumber,
          commitSha: pr.head.sha,
          manifestPath,
        },
        files: assets,
        status: "DRAFT_PENDING_HUMAN_REVIEW",
        importedAt: new Date().toISOString(),
      },
      verified: assets.length,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Importazione non riuscita";
    const invalid = /non valido|non sicuro|Percorso|contratto|duplicat|mancante|impronta|corrispondente|incoerente|troppo|revisione deve|Origine|assente/i.test(message);
    return NextResponse.json({ error: message }, { status: invalid ? 422 : 502 });
  }
}
