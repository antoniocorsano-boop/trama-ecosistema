export type VisualFactoryRetryKind = "REFERENCES" | "SHOTS";

export type VisualFactoryRetryPreflightState = {
  kind: VisualFactoryRetryKind;
  approved: boolean;
  requiresConfirmation: boolean;
};

export function getVisualFactoryRetryPreflightState(
  referenceLockCount: number,
  referencePreflightApproved: boolean,
  shotPreflightApproved: boolean,
): VisualFactoryRetryPreflightState {
  const kind: VisualFactoryRetryKind = referenceLockCount === 5 ? "SHOTS" : "REFERENCES";
  const approved = kind === "SHOTS" ? shotPreflightApproved : referencePreflightApproved;
  return {
    kind,
    approved,
    requiresConfirmation: !approved,
  };
}
