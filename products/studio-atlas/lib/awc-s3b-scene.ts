import specification from "./fixtures/awc-museo-zero-transfer.json";

/**
 * AWC-F immutable technical input. This is not a new scene authoring authority:
 * exact original blob from Atlas PR #136 / 6285c47cf3c87e847fd6d00f8f6dfc8142590760.
 * Source git blob: f8e91ca7fd7aa2b5df9b777703ca443df2dbc912.
 * All mutable state stays inside the isolated viewer, never the authored project.
 */
export const AWC_S3B_SOURCE_GIT_BLOB = "f8e91ca7fd7aa2b5df9b777703ca443df2dbc912";
export const AWC_S3B_SOURCE_REVISION = "6285c47cf3c87e847fd6d00f8f6dfc8142590760";
export const AWC_S3B_ENGINE_VERSION = "0.128.0";
export const AWC_S3B_SCENE = specification.sceneSpec;
export const ORBIT_MIN = -0.3;
export const ORBIT_MAX = 0.3;
export const ORBIT_PER_CSS_PIXEL = 0.004;
export type AwcLightProfile = "reference" | "balanced";

function ensure(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

export function validateAwcSceneSpec(): void {
  const s = specification;
  ensure(
    s.schema === "atlas.awc.world-transfer/v1" &&
      s.mode === "ISOLATED_LAB_ONLY" &&
      s.status === "EXPERIMENT_ONLY" &&
      s.scene === "sala-zero.projection-cue" &&
      s.world === "museo-zero.transfer",
    "AWC S3b: fonte non canonica",
  );
  ensure(
    s.reused.parameter === "camera.orbit" &&
      s.reused.variant === 0.12 &&
      s.reused.unit === "rad" &&
      s.reused.baseline === 0 &&
      s.reused.target === "webgl" &&
      s.reused.control === "orbit-around-z",
    "AWC S3b: parametro non verificato",
  );
  ensure(
    Object.keys(s.authority).length > 0 &&
      Object.values(s.authority).every((value) => value === false),
    "AWC S3b: origine con permessi non consentiti",
  );
  ensure(
    s.sceneSpec.objects.length === 16 &&
      s.sceneSpec.objects.length * 12 === 192 &&
      s.sceneSpec.camera.width === 640 &&
      s.sceneSpec.camera.height === 480 &&
      s.sceneSpec.camera.fov === 42,
    "AWC S3b: inventario di scena difforme",
  );
  const ids = new Set<string>();
  for (const object of s.sceneSpec.objects) {
    ensure(
      !ids.has(object.id) &&
        object.material in s.sceneSpec.materials &&
        object.size.length === 3 &&
        object.size.every((size) => Number.isFinite(size) && size > 0) &&
        object.position.length === 3 &&
        object.position.every(Number.isFinite),
      "AWC S3b: oggetto non conforme",
    );
    ids.add(object.id);
  }
  for (const required of ["screen", "floor", "sensor-A", "sensor-B"]) {
    ensure(ids.has(required), "AWC S3b: geometria narrativa mancante");
  }
}

export function clampOrbit(value: number): number {
  if (!Number.isFinite(value)) throw new Error("AWC S3b: orbita non valida");
  return Math.min(ORBIT_MAX, Math.max(ORBIT_MIN, value));
}

export function nextOrbit(current: number, horizontalDeltaPixels: number): number {
  if (!Number.isFinite(horizontalDeltaPixels)) throw new Error("AWC S3b: spostamento non valido");
  return clampOrbit(current + horizontalDeltaPixels * ORBIT_PER_CSS_PIXEL);
}

export function cameraEye(orbit: number): [number, number, number] {
  const cfg = AWC_S3B_SCENE.camera;
  const angle = cfg.azimuth + clampOrbit(orbit);
  const distance = cfg.distance;
  const elevation = cfg.elevation;
  return [
    cfg.center[0] + distance * Math.cos(elevation) * Math.sin(angle),
    cfg.center[1] - distance * Math.cos(elevation) * Math.cos(angle),
    cfg.center[2] + distance * Math.sin(elevation),
  ];
}

/**
 * Reference reproduces the original qualified AWC-F WebGL illumination values.
 * Balanced is a reversible, NON approved artistic hypothesis after mobile feedback:
 * it reduces the reported pale/flat image without modifying camera, geometry,
 * semantic states, source material colors or the reference profile.
 */
export function lightingValues(profile: AwcLightProfile) {
  return profile === "reference"
    ? { hemisphere: 1.1, directional: 2.0, fill: 1.7, exposure: 1.15, shadows: false }
    : { hemisphere: 0.64, directional: 1.2, fill: 0.5, exposure: 0.74, shadows: true };
}
