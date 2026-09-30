import type { EcosystemSnapshot } from "../snapshot/types";
import type { MaturitySnapshot } from "./model";

export function toMaturitySnapshot(snapshot: EcosystemSnapshot): MaturitySnapshot {
  const areas = Array.isArray(snapshot.areas) ? snapshot.areas : [];
  const components = Array.isArray(snapshot.components) ? snapshot.components : [];

  return {
    schemaVersion: snapshot.schemaVersion,
    generatedAt: snapshot.generatedAt,
    areas: areas as MaturitySnapshot["areas"],
    components: components as MaturitySnapshot["components"],
    sourceState: snapshot.sourceState as MaturitySnapshot["sourceState"],
  };
}
