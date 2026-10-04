"use client";

import type { StudioAtlasPreviewSnapshot } from "./model";
import { buildStudioAtlasPreviewSnapshot } from "./preview";
import type { PathwayProject } from "./model";

const READY_TYPE = "STUDIO_ATLAS_PREVIEW_READY";
const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";
const ACCEPTED_TYPE = "STUDIO_ATLAS_PREVIEW_ACCEPTED";

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
  const openedWindow = window.open("about:blank", "_blank");
  if (!openedWindow) return { status: "POPUP_BLOCKED" };
  const previewWindow: Window = openedWindow;

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

  // Register the READY listener before navigating the popup. Atlas may mount
  // quickly enough to emit READY during the first navigation task.
  return await new Promise<PreviewBridgeResult>((resolve) => {
    let settled = false;
    let retry: number | null = null;

    const sendSnapshot = () => {
      if (previewWindow.closed) return;
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

    function finish(result: PreviewBridgeResult) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (retry !== null) window.clearInterval(retry);
      window.removeEventListener("message", onMessage);
      resolve(result);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== atlasOrigin) return;

      if (isReadyMessage(event.data, channel)) {
        sendSnapshot();
        return;
      }

      if (isAcceptedMessage(event.data, channel, snapshot.snapshotId)) {
        finish({ status: "OPENED", snapshot });
      }
    }

    window.addEventListener("message", onMessage);
    previewWindow.location.replace(previewUrl.toString());

    // The target runtime is a separate origin and may mount before or after
    // the one-shot READY message is observed. Retry the exact same immutable
    // snapshot on a bounded interval until Atlas validates it and ACKs.
    retry = window.setInterval(sendSnapshot, 300);
  });
}

function isReadyMessage(value: unknown, channel: string) {
  if (!value || typeof value !== "object") return false;
  const message = value as { type?: unknown; channel?: unknown };
  return message.type === READY_TYPE && message.channel === channel;
}

function isAcceptedMessage(value: unknown, channel: string, snapshotId: string) {
  if (!value || typeof value !== "object") return false;
  const message = value as {
    type?: unknown;
    channel?: unknown;
    snapshotId?: unknown;
  };
  return (
    message.type === ACCEPTED_TYPE &&
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
