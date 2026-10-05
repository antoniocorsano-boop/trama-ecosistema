import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { VisualExecutionReceipt } from "./visual-factory";

export type ReviewAssetMaterializerOptions = {
  token?: string;
  fetchImpl?: typeof fetch;
};

function governedAssetUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("VF_ORCH_ASSET_URL_INVALID");
  }
  if (url.protocol !== "https:") throw new Error("VF_ORCH_ASSET_URL_NOT_HTTPS");
  const host = url.hostname.toLowerCase();
  if (!(host.endsWith(".hf.space") || host === "huggingface.co" || host.endsWith(".huggingface.co"))) {
    throw new Error("VF_ORCH_ASSET_HOST_NOT_ALLOWED");
  }
  return url;
}

function governedAssetId(value: string): string {
  if (!/^[A-Za-z0-9._-]{1,160}$/.test(value)) {
    throw new Error("VF_ORCH_ASSET_ID_INVALID");
  }
  return value;
}

export async function materializeReviewAssets(
  receipt: VisualExecutionReceipt,
  outputDir: string,
  options: ReviewAssetMaterializerOptions = {},
): Promise<string[]> {
  if (receipt.status !== "SUCCEEDED") return [];
  if (!receipt.assets.length) throw new Error("VF_ORCH_SUCCEEDED_WITHOUT_ASSETS");

  const fetchImpl = options.fetchImpl ?? fetch;
  await mkdir(outputDir, { recursive: true });
  const paths: string[] = [];

  for (const asset of receipt.assets) {
    const assetId = governedAssetId(asset.assetId);
    const url = governedAssetUrl(asset.url);
    const headers = new Headers();
    if (options.token?.trim()) {
      headers.set("authorization", `Bearer ${options.token.trim()}`);
    }

    const response = await fetchImpl(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`VF_ORCH_ASSET_DOWNLOAD_FAILED:${assetId}:HTTP_${response.status}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length) throw new Error(`VF_ORCH_ASSET_EMPTY:${assetId}`);

    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== asset.sha256) {
      throw new Error(`VF_ORCH_ASSET_DIGEST_MISMATCH:${assetId}`);
    }

    const path = resolve(outputDir, `${assetId}.webp`);
    await writeFile(path, bytes);
    paths.push(path);
  }

  return paths;
}
