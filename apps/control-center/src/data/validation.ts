import Ajv2020 from "ajv/dist/2020";
import ecosystemSnapshotSchema from "../../../../schemas/ecosystem-snapshot.schema.json";
import type { EcosystemSnapshot } from "../domain/snapshot/types";

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  validateFormats: false,
});

const validate = ajv.compile(ecosystemSnapshotSchema);

export class SnapshotValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("TRAMA_ECOSYSTEM_SNAPSHOT_INVALID");
    this.name = "SnapshotValidationError";
    this.issues = issues;
  }
}

export function parseEcosystemSnapshot(value: unknown): EcosystemSnapshot {
  if (!validate(value)) {
    const issues = (validate.errors ?? []).map(
      (error) => `${error.instancePath || "/"} ${error.message ?? "schema error"}`,
    );
    throw new SnapshotValidationError(issues);
  }
  return value as EcosystemSnapshot;
}
