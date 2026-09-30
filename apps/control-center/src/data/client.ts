import type { EcosystemSnapshot } from "../domain/snapshot/types";
import { reportDataSource } from "./runtimeState";
import { SnapshotValidationError, parseEcosystemSnapshot } from "./validation";

export type SnapshotLoadState =
  | { status: "LOADING" }
  | { status: "READY"; data: EcosystemSnapshot; source: "GOVERNED_BUILD_ARTIFACT" | "OFFLINE_CACHE" }
  | { status: "INVALID"; error: SnapshotValidationError }
  | { status: "UNAVAILABLE"; error: Error };

export async function loadEcosystemSnapshot(signal?: AbortSignal): Promise<SnapshotLoadState> {
  try {
    const response = await fetch("./data/ecosystem-snapshot.json", {
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { status: "UNAVAILABLE", error: new Error(`SNAPSHOT_HTTP_${response.status}`) };
    }

    const offline = response.headers.get("X-TRAMA-Data-Source") === "CACHE_OFFLINE";
    reportDataSource(offline ? "OFFLINE_CACHE" : "NETWORK_OR_PRECACHE");

    const raw: unknown = await response.json();
    return {
      status: "READY",
      data: parseEcosystemSnapshot(raw),
      source: offline ? "OFFLINE_CACHE" : "GOVERNED_BUILD_ARTIFACT",
    };
  } catch (error) {
    if (error instanceof SnapshotValidationError) {
      return { status: "INVALID", error };
    }
    return {
      status: "UNAVAILABLE",
      error: error instanceof Error ? error : new Error("SNAPSHOT_LOAD_FAILED"),
    };
  }
}
