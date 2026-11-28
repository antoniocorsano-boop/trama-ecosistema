import { NextResponse } from "next/server";
import {
  parseAtlasPrUrl,
  safeIntakePath,
  sha256,
  validateActivityManifest,
  verifyAsset,
} from "../../../../lib/activity-intake";

import { MediaBudget, assetFormat } from "../../../../lib/activity-media";
import { fetchIntake,IntakeTransportError } from "../../../../lib/activity-intake-transport";

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
type StoredFile = { path: string; type: string; format: string; sha256: string; base64: string; pixelWidth?:number; pixelHeight?:number };

async function readJson<T>(url: string,phase:"PR_METADATA"|"PR_FILES"): Promise<T> {
  const bytes = await fetchIntake(url,phase,12000,HEADERS);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

async function readBytes(url: string, phase:"MANIFEST"|"ASSET",max = MAX_FILE_BYTES): Promise<Uint8Array> {
  return fetchIntake(url,phase,18000,undefined,max);
}

async function changedFiles(prNumber: number): Promise<string[]> {
  const all: string[] = [];
  for (let page = 1; page <= 5; page++) {
    const files = await readJson<ChangedFile[]>(
      API + "/pulls/" + prNumber + "/files?per_page=100&page=" + page,"PR_FILES"
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
    const pr = await readJson<Pull>(API + "/pulls/" + prNumber,"PR_METADATA");
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
    const manifestBytes = await readBytes(rawUrl(pr.head.sha, manifestPath),"MANIFEST",256 * 1024);
    const manifest = validateActivityManifest(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(manifestBytes)));

    let totalBytes = manifestBytes.byteLength;
    const assets: StoredFile[] = [];
    const budget=new MediaBudget();
    for (const asset of manifest.assets) {
      const data = await readBytes(rawUrl(pr.head.sha, root + asset.path),"ASSET");
      verifyAsset(data, asset);
      totalBytes += data.byteLength;
      if (totalBytes > MAX_TOTAL_BYTES) throw new Error("Pacchetto troppo grande");
      const dimensions=await budget.inspect(data,asset);
      assets.push({
        ...dimensions,
        path: asset.path,
        type: asset.type,
        format: assetFormat(asset),
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
    if(error instanceof IntakeTransportError){
      const d=error.diagnostic;
      const status=d.upstreamStatus===404&&(d.phase==="ASSET"||d.phase==="MANIFEST")?422:502;
      return NextResponse.json({error:error.message,diagnostic:d},{status,headers:{"Cache-Control":"no-store"}});
    }
    const message = error instanceof Error ? error.message : "Importazione non riuscita";
    const invalid = /non valid[oi]|non sicuro|Percorso|contratto|duplicat|mancante|impronta|corrispondente|incoerente|troppo|revisione deve|Origine|assente/i.test(message);
    return NextResponse.json({ error: message }, { status: invalid ? 422 : 502 });
  }
}
