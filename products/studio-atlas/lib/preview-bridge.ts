"use client";

import type { StudioAtlasPreviewSnapshot } from "./model";
import { buildStudioAtlasPreviewSnapshot } from "./preview";
import type { PathwayProject } from "./model";

const READY_TYPE = "STUDIO_ATLAS_PREVIEW_READY";
const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";

export type PreviewBridgeResult =
  | { status: "OPENED"; snapshot: StudioAtlasPreviewSnapshot }
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
  const atlasOrigin = atlasPreviewOrigin();
  if (!atlasOrigin) return { status: "NOT_CONFIGURED" };

  // Open synchronously from the user's click to avoid popup blocking while
  // the SHA-256 snapshot digest is prepared.
  const target = window.open("about:blank", "_blank");
  if (!target) return { status: "POPUP_BLOCKED" };
  const previewWindow = target;

  const channel = randomChannel();
  let snapshot: StudioAtlasPreviewSnapshot;
  try {
    snapshot = await buildStudioAtlasPreviewSnapshot(project);
  } catch (error) {
    previewWindow.close();
    throw error;
  }

  const previewUrl = new URL("/percorsi/lab/studio-atlas-preview/", atlasOrigin);
  previewUrl.searchParams.set("channel", channel);

  return await new Promise<PreviewBridgeResult>((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => finish({ status: "TIMEOUT" }), 12000);

    function finish(result: PreviewBridgeResult) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve(result);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== atlasOrigin) return;
      if (event.source !== previewWindow) return;
      if (!isReadyMessage(event.data, channel)) return;

      previewWindow.postMessage(
        {
          type: SNAPSHOT_TYPE,
          channel,
          snapshot,
        },
        atlasOrigin,
      );
      finish({ status: "OPENED", snapshot });
    }

    // Register the READY listener before navigating the popup. Atlas may load
    // quickly enough to post READY immediately; registering after navigation
    // creates a real race and can lose the one-shot handshake.
    window.addEventListener("message", onMessage);
    previewWindow.location.replace(previewUrl.toString());
  });
}

function isReadyMessage(value: unknown, channel: string) {
  if (!value || typeof value !== "object") return false;
  const message = value as { type?: unknown; channel?: unknown };
  return message.type === READY_TYPE && message.channel === channel;
}

function randomChannel() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
