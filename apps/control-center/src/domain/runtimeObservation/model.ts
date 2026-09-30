export type RuntimeCapabilityObservation = {
  key: string;
  supported: boolean;
  available: boolean;
  authorized: boolean;
  reason?: string;
};

export type RuntimeObservation = {
  runtimeType: string;
  runtimeId: string;
  adapterId: string;
  adapterVersion: string;
  adapterState: "UNAVAILABLE" | "DISCOVERED" | "READY" | "QUALIFIED" | "DEGRADED" | "FAILED" | "DEFERRED";
  availability: "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
  health: "UNKNOWN" | "READY" | "DEGRADED" | "FAILED";
  source: "contract-mock" | "live" | "persisted";
  stale: boolean;
  observedAt: string;
  evidenceRefs: string[];
  capabilities: RuntimeCapabilityObservation[];
};

export const runtimeObservationFixture: RuntimeObservation[] = [
  {
    runtimeType: "dsh",
    runtimeId: "rti_trama_harness_pilot",
    adapterId: "trama-harness-dsh-candidate",
    adapterVersion: "0.0.0-contract",
    adapterState: "DEFERRED",
    availability: "UNKNOWN",
    health: "UNKNOWN",
    source: "contract-mock",
    stale: false,
    observedAt: "2026-09-30T00:00:00Z",
    evidenceRefs: [
      "docs/contracts/trama-runtime-generation-contract-v0.md",
      "docs/contracts/trama-local-connector-contract-v0.md",
      "docs/contracts/trama-runtime-adapter-contract-v0.md",
    ],
    capabilities: [
      { key: "runtime.observe", supported: true, available: true, authorized: true },
      { key: "runtime.health", supported: true, available: true, authorized: true },
      { key: "runtime.evidence.read", supported: true, available: true, authorized: true },
      { key: "runtime.start", supported: true, available: false, authorized: false, reason: "DOS-A1 RUNTIME_DEFERRED" },
      { key: "runtime.stop", supported: true, available: false, authorized: false, reason: "DOS-A1 RUNTIME_DEFERRED" },
      { key: "runtime.configure", supported: false, available: false, authorized: false, reason: "Fuori perimetro OR-04" },
      { key: "runtime.mutate", supported: false, available: false, authorized: false, reason: "Authority non definita" },
    ],
  },
];

export function visibleRuntimeObservations(items: RuntimeObservation[]) {
  return items.map((item) => ({
    ...item,
    capabilities: [...item.capabilities].sort((a, b) => a.key.localeCompare(b.key)),
    evidenceRefs: [...item.evidenceRefs],
  }));
}

export function hasAuthorizedMutation(item: RuntimeObservation) {
  return item.capabilities.some((capability) =>
    capability.authorized &&
    ["runtime.start", "runtime.stop", "runtime.configure", "runtime.mutate", "runtime.cancel", "runtime.install"].includes(capability.key),
  );
}
