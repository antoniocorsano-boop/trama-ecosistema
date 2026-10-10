import type { AccessRepository } from '../ports/access-repository.js';
import {
  CANONICAL_ENTITLEMENT_PAIRS,
  isCanonicalEntitlementPair,
  type Application,
  type LauncherItem,
} from './types.js';

const LABELS: Record<Application, string> = {
  DOCENTE_OS: 'Docente OS',
  CURRICOLO_ATLAS: 'Curricolo Atlas',
  STUDIO_ATLAS: 'Studio Atlas',
  ARENA: 'Arena',
  CONTROL_CENTER: 'Control Center',
};

const order = new Map(CANONICAL_ENTITLEMENT_PAIRS.map(([application], index) => [application, index]));

export async function buildLauncher(
  principalId: string,
  repository: AccessRepository,
): Promise<LauncherItem[]> {
  const entitlements = await repository.listEntitlements(principalId);

  return entitlements
    .filter(
      (entry) =>
        entry.status === 'ACTIVE' && isCanonicalEntitlementPair(entry.application, entry.entitlement),
    )
    .sort((a, b) => (order.get(a.application) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.application) ?? Number.MAX_SAFE_INTEGER))
    .map((entry) => ({
      application: entry.application,
      label: LABELS[entry.application],
      entitlement: entry.entitlement,
      availability: 'FEDERATION_PENDING' as const,
    }));
}
