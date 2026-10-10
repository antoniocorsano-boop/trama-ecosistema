import { useCallback, useEffect, useState } from 'react';
import { AccessLauncher } from '../components/AccessLauncher';
import { AccessLogin } from '../components/AccessLogin';
import { AccessShell } from '../components/AccessShell';
import { AccessStatus } from '../components/AccessStatus';
import { accessApi } from './access-api';
import { isAuthenticatedState, type AccessState } from './access-state';

export type AccessApi = {
  getState(): Promise<AccessState>;
  requestMagicLink(email: string): Promise<AccessState>;
  logout(): Promise<void>;
};

export function AccessView({
  state,
  onRequestLink,
  onLogout,
  onReset,
}: {
  state: AccessState;
  onRequestLink(email: string): void | Promise<void>;
  onLogout(): void | Promise<void>;
  onReset(): void;
}) {
  const authenticated = isAuthenticatedState(state);

  return (
    <AccessShell>
      {state.state === 'SIGNED_OUT' ? (
        <>
          <div className="access-intro">
            <p className="access-kicker">Ingresso professionale</p>
            <h1 id="access-title">Accesso professionale</h1>
            <p>
              Inserisci la tua email per ricevere un collegamento di accesso. Non è richiesta una password.
            </p>
          </div>
          <AccessLogin onRequestLink={onRequestLink} />
        </>
      ) : state.state === 'ENTITLEMENTS_AVAILABLE' ? (
        <>
          <div className="access-intro">
            <p className="access-kicker">I tuoi ambienti</p>
            <h1 id="access-title">Dove puoi entrare</h1>
            <p>Gli ambienti assegnati sono visibili qui; il collegamento diretto sarà attivato nelle fasi di federazione.</p>
          </div>
          <AccessLauncher items={state.launcher} />
        </>
      ) : (
        <AccessStatus state={state} />
      )}

      {authenticated ? (
        <button type="button" className="access-secondary-action" onClick={() => void onLogout()}>
          Esci
        </button>
      ) : null}

      {state.state === 'MAGIC_LINK_SENT' ? (
        <button type="button" className="access-secondary-action" onClick={onReset}>
          Usa un’altra email
        </button>
      ) : null}

      {state.state === 'ACCESS_DENIED' ||
      state.state === 'PROVIDER_UNAVAILABLE' ||
      state.state === 'SESSION_EXPIRED' ? (
        <button type="button" className="access-secondary-action" onClick={onReset}>
          Torna all’accesso
        </button>
      ) : null}
    </AccessShell>
  );
}

export function App({
  api = accessApi,
  authenticatedSettleMs = 350,
}: {
  api?: AccessApi;
  authenticatedSettleMs?: number;
}) {
  const [state, setState] = useState<AccessState>(() =>
    window.location.pathname === '/auth/callback'
      ? { state: 'AUTH_CALLBACK_PROCESSING' }
      : { state: 'SIGNED_OUT' },
  );

  const refresh = useCallback(async () => {
    try {
      setState(await api.getState());
    } catch {
      setState({ state: 'PROVIDER_UNAVAILABLE' });
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (state.state !== 'AUTHENTICATED') return;
    const timer = window.setTimeout(() => void refresh(), authenticatedSettleMs);
    return () => window.clearTimeout(timer);
  }, [authenticatedSettleMs, refresh, state.state]);

  async function requestLink(email: string) {
    try {
      setState(await api.requestMagicLink(email));
    } catch {
      setState({ state: 'PROVIDER_UNAVAILABLE' });
    }
  }

  async function logout() {
    try {
      await api.logout();
      setState({ state: 'SIGNED_OUT' });
    } catch {
      setState({ state: 'PROVIDER_UNAVAILABLE' });
    }
  }

  return (
    <AccessView
      state={state}
      onRequestLink={requestLink}
      onLogout={logout}
      onReset={() => setState({ state: 'SIGNED_OUT' })}
    />
  );
}
