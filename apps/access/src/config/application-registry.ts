import type { CanonicalApplicationKey } from '../domain/types.ts';
export type FederationState = 'NOT_FEDERATED' | 'FEDERATION_QUALIFIED' | 'SUSPENDED';
export interface ApplicationRegistryEntry {
  applicationKey: CanonicalApplicationKey;
  displayName: string;
  federationState: FederationState;
  launchTarget?: string;
}
export const APPLICATION_REGISTRY: readonly ApplicationRegistryEntry[] = [
  { applicationKey: 'DOCENTE_OS', displayName: 'Docente OS', federationState: 'NOT_FEDERATED' },
  { applicationKey: 'CURRICOLO_ATLAS', displayName: 'Curricolo Atlas', federationState: 'NOT_FEDERATED' },
  { applicationKey: 'STUDIO_ATLAS', displayName: 'Studio Atlas', federationState: 'NOT_FEDERATED' },
  { applicationKey: 'ARENA', displayName: 'Arena', federationState: 'NOT_FEDERATED' },
  { applicationKey: 'CONTROL_CENTER', displayName: 'Control Center', federationState: 'NOT_FEDERATED' },
];
