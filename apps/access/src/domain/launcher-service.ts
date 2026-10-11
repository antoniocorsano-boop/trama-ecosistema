import type { ApplicationEntitlement, CanonicalApplicationKey } from './types.ts';
import type { ApplicationRegistryEntry } from '../config/application-registry.ts';

export interface LauncherCard {
  applicationKey: CanonicalApplicationKey;
  displayName: string;
  availability: 'AVAILABLE' | 'CONNECTION_NOT_AVAILABLE' | 'SUSPENDED';
  launchAllowed: boolean;
}
const currentEntitlement = (e: ApplicationEntitlement, at: Date) => e.status === 'ACTIVE' && e.validFrom <= at && (!e.validUntil || e.validUntil > at);
export function buildLauncher(input: { entitlements: ApplicationEntitlement[]; registry: readonly ApplicationRegistryEntry[]; at: Date }): LauncherCard[] {
  return input.entitlements.filter((e) => currentEntitlement(e, input.at)).flatMap((entitlement) => {
    const entry = input.registry.find((r) => r.applicationKey === entitlement.applicationKey);
    if (!entry) return [];
    if (entry.federationState === 'NOT_FEDERATED') return [{ applicationKey: entry.applicationKey, displayName: entry.displayName, availability: 'CONNECTION_NOT_AVAILABLE' as const, launchAllowed: false }];
    if (entry.federationState === 'SUSPENDED') return [{ applicationKey: entry.applicationKey, displayName: entry.displayName, availability: 'SUSPENDED' as const, launchAllowed: false }];
    if (!entry.launchTarget) return [];
    return [{ applicationKey: entry.applicationKey, displayName: entry.displayName, availability: 'AVAILABLE' as const, launchAllowed: true }];
  });
}
export type LaunchDecision = { allowed: true; target: string } | { allowed: false; code: 'NO_ENTITLEMENT' | 'NOT_FEDERATED' | 'SUSPENDED' | 'MISCONFIGURED' };
export function authorizeLaunch(input: { applicationKey: CanonicalApplicationKey; entitlements: ApplicationEntitlement[]; registry: readonly ApplicationRegistryEntry[]; at: Date }): LaunchDecision {
  const entitlement = input.entitlements.find((e) => e.applicationKey === input.applicationKey && currentEntitlement(e, input.at));
  if (!entitlement) return { allowed: false, code: 'NO_ENTITLEMENT' };
  const entry = input.registry.find((r) => r.applicationKey === input.applicationKey);
  if (!entry) return { allowed: false, code: 'MISCONFIGURED' };
  if (entry.federationState === 'NOT_FEDERATED') return { allowed: false, code: 'NOT_FEDERATED' };
  if (entry.federationState === 'SUSPENDED') return { allowed: false, code: 'SUSPENDED' };
  if (!entry.launchTarget) return { allowed: false, code: 'MISCONFIGURED' };
  return { allowed: true, target: entry.launchTarget };
}
