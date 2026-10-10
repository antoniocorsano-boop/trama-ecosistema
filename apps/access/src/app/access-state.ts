export type ClientApplication =
  | 'DOCENTE_OS'
  | 'CURRICOLO_ATLAS'
  | 'STUDIO_ATLAS'
  | 'ARENA'
  | 'CONTROL_CENTER';

export type ClientEntitlement = 'USE' | 'READ' | 'AUTHOR' | 'ENTER' | 'GOVERNANCE_OPERATOR';

export type LauncherItem = {
  application: ClientApplication;
  label: string;
  entitlement: ClientEntitlement;
  availability: 'FEDERATION_PENDING';
};

export type AccessContext = {
  contextType: 'PERSONAL' | 'INSTITUTION';
  institutionRef: string | null;
};

export type AccessState =
  | { state: 'SIGNED_OUT' }
  | { state: 'MAGIC_LINK_SENT' }
  | { state: 'AUTH_CALLBACK_PROCESSING' }
  | { state: 'AUTHENTICATED'; principalId: string }
  | { state: 'NO_ENTITLEMENTS'; principalId: string; context?: AccessContext; launcher: [] }
  | {
      state: 'ENTITLEMENTS_AVAILABLE';
      principalId: string;
      context?: AccessContext;
      launcher: LauncherItem[];
    }
  | { state: 'ACCESS_DENIED' }
  | { state: 'PROVIDER_UNAVAILABLE' }
  | { state: 'SESSION_EXPIRED' };

export function isAuthenticatedState(state: AccessState): boolean {
  return (
    state.state === 'AUTHENTICATED' ||
    state.state === 'NO_ENTITLEMENTS' ||
    state.state === 'ENTITLEMENTS_AVAILABLE'
  );
}
