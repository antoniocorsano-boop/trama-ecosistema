"use client";

import type { StudioAtlasPreviewSnapshot } from "./model";
import {
  buildStudioAtlasPreviewSnapshot,
  buildStudioAtlasReviewPreviewSnapshot,
} from "./preview";
import type { PathwayProject } from "./model";
import {compileSpecializedReviewSnapshot} from "./specialized-review-preview";
import {loadEduTwin} from "./edutwin-archive";
import {listActivityDrafts} from "./activity-drafts";
import {buildEduTwinIllustratedReviewSnapshot,type LocalStoryReview} from "./edutwin-illustrated-preview";

const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";
const ACK_TYPE = "STUDIO_ATLAS_PREVIEW_ACK";
const SNAPSHOT_RETRY_LIMIT = 30;

export type PreviewBridgeResult<T = StudioAtlasPreviewSnapshot> =
  | { status: "OPENED"; snapshot: T }
  | { status: "NOT_CONFIGURED" }
  | { status: "POPUP_BLOCKED" }
  | { status: "TIMEOUT" };

export function atlasPreviewOrigin() {
  const raw = process.env.NEXT_PUBLIC_ATLAS_PREVIEW_ORIGIN?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export async function openAtlasLearnerPreview(
  project: PathwayProject,
): Promise<PreviewBridgeResult> {
  return openAtlasPreview(project, "LEARNER");
}

export async function openAtlasReviewPreview(
  project: PathwayProject,
): Promise<PreviewBridgeResult> {
  return openAtlasPreview(project, "HUMAN_PRODUCT_REVIEW");
}

export async function openEduTwinIllustratedReviewPreview(projectId:string,review:LocalStoryReview):Promise<PreviewBridgeResult>{
  return openSnapshotPreview(async()=>{
    const revision=await loadEduTwin(projectId);
    if(!revision||revision.digest!==review.revisionDigest)throw new Error("STALE_REVIEW");
    const snapshot=await buildEduTwinIllustratedReviewSnapshot(revision,review,await listActivityDrafts());
    const current=await loadEduTwin(projectId);
    if(current?.digest!==review.revisionDigest)throw new Error("STALE_REVIEW");
    return snapshot;
  });
}
async function openAtlasPreview(
  project: PathwayProject,
  purpose: "LEARNER" | "HUMAN_PRODUCT_REVIEW",
): Promise<PreviewBridgeResult> {
  return openSnapshotPreview(()=>purpose==="HUMAN_PRODUCT_REVIEW"?buildStudioAtlasReviewPreviewSnapshot(project):buildStudioAtlasPreviewSnapshot(project));
}
export async function openSpecializedReviewPreview(pkg:unknown):Promise<PreviewBridgeResult<Awaited<ReturnType<typeof compileSpecializedReviewSnapshot>>>> {
  if(process.env.NEXT_PUBLIC_AXF_REVIEW_ONLY!=="true")return {status:"NOT_CONFIGURED"};
  return openSnapshotPreview(()=>compileSpecializedReviewSnapshot(pkg));
}
async function openSnapshotPreview<T extends {snapshotId:string}>(build:()=>Promise<T>):Promise<PreviewBridgeResult<T>>{
  const atlasOrigin = atlasPreviewOrigin();
  if (!atlasOrigin) return { status: "NOT_CONFIGURED" };

  // Open synchronously from the user's click to avoid popup blocking while
  // the SHA-256 snapshot digest is prepared.
  const openedWindow = window.open("about:blank", "_blank");
  if (!openedWindow) return { status: "POPUP_BLOCKED" };
  const previewWindow: Window = openedWindow;

  const channel = randomChannel();
  let snapshot: T;
  try {
    snapshot = await build();
  } catch (error) {
    previewWindow.close();
    throw error;
  }

  const previewUrl = new URL("/percorsi/lab/studio-atlas-preview/", atlasOrigin);
  previewUrl.searchParams.set("channel", channel);

  // Register the ACK listener before navigating the popup.
  return await new Promise<PreviewBridgeResult<T>>((resolve) => {
    let settled = false;
    let retry: number | null = null;
    let attempts = 0;

    const sendSnapshot = () => {
      if (settled || previewWindow.closed || attempts >= SNAPSHOT_RETRY_LIMIT) return;
      attempts += 1;
      previewWindow.postMessage(
        {
          type: SNAPSHOT_TYPE,
          channel,
          snapshot,
        },
        atlasOrigin,
      );
    };

    const timeout = window.setTimeout(() => finish({ status: "TIMEOUT" }), 12000);

    function finish(result: PreviewBridgeResult<T>) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (retry !== null) window.clearInterval(retry);
      window.removeEventListener("message", onMessage);
      resolve(result);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== atlasOrigin) return;

      if (isAckMessage(event.data, channel, snapshot.snapshotId)) {
        finish({ status: "OPENED", snapshot });
      }
    }

    window.addEventListener("message", onMessage);

    // Cross-origin WindowProxy identity is deliberately not treated as an
    // authority signal. The bridge is already bound to the exact Atlas
    // origin and an unguessable 192-bit channel, and Atlas validates the
    // snapshot before ACKing it.
    previewWindow.location.replace(previewUrl.toString());

    // The target runtime is a separate origin and may mount after navigation.
    // Retry the exact same immutable snapshot on a bounded interval until
    // Atlas validates it and ACKs.
    retry = window.setInterval(sendSnapshot, 300);
  });
}

function isAckMessage(value: unknown, channel: string, snapshotId: string) {
  if (!value || typeof value !== "object") return false;
  const message = value as {
    type?: unknown;
    channel?: unknown;
    snapshotId?: unknown;
  };
  return (
    message.type === ACK_TYPE &&
    message.channel === channel &&
    message.snapshotId === snapshotId
  );
}

function randomChannel() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
