import validate from "virtual:trama-ecosystem-validator";
import type { EcosystemSnapshot } from "../domain/snapshot/types";

type ValidationIssue = {
  instancePath?: string;
  message?: string;
};

type StandaloneValidator = ((value: unknown) => boolean) & {
  errors?: ValidationIssue[] | null;
};

const validateSnapshot = validate as StandaloneValidator;

export class SnapshotValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("TRAMA_ECOSYSTEM_SNAPSHOT_INVALID");
    this.name = "SnapshotValidationError";
    this.issues = issues;
  }
}

export function parseEcosystemSnapshot(value: unknown): EcosystemSnapshot {
  if (!validateSnapshot(value)) {
    const issues = (validateSnapshot.errors ?? []).map(
      (error) => `${error.instancePath || "/"} ${error.message ?? "schema error"}`,
    );
    throw new SnapshotValidationError(issues);
  }
  return value as EcosystemSnapshot;
}
