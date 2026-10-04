import type { VisualFactoryState } from "./visual-factory";

const PREFIX = "studio-atlas.visual-factory.v0.2:";

export type VisualFactoryStorage = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): VisualFactoryStorage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readVisualFactoryState(
  projectId: string,
  storage: VisualFactoryStorage | null = browserStorage(),
): VisualFactoryState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${PREFIX}${projectId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisualFactoryState;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.packageDigest !== "string" ||
      !Array.isArray(parsed.candidates) ||
      !Array.isArray(parsed.referenceLocks) ||
      !Array.isArray(parsed.sceneAssets)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeVisualFactoryState(
  projectId: string,
  state: VisualFactoryState,
  storage: VisualFactoryStorage | null = browserStorage(),
) {
  if (!storage) return;
  storage.setItem(`${PREFIX}${projectId}`, JSON.stringify(state));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("studio-atlas:visual-factory", { detail: { projectId } }));
  }
}
