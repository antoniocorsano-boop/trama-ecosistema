'use client';

import { FormEvent, useState } from 'react';
import { AccessStatus } from './access-status';

type State = 'ENTER_EMAIL' | 'MAGIC_LINK_SENT' | 'ACCESS_DENIED' | 'PROVIDER_UNAVAILABLE';

export function AccessAuthPanel() {
  const [state, setState] = useState<State>('ENTER_EMAIL');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch('/api/auth/request-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.status === 503) setState('PROVIDER_UNAVAILABLE');
      else if (response.ok) setState('MAGIC_LINK_SENT');
      else setState('ACCESS_DENIED');
    } catch {
      setState('PROVIDER_UNAVAILABLE');
    } finally {
      setBusy(false);
    }
  }

  if (state === 'PROVIDER_UNAVAILABLE') {
    return <><AccessStatus tone="notice">Accesso temporaneamente non disponibile. Riprova più tardi.</AccessStatus><button className="access-secondary" type="button" onClick={() => setState('ENTER_EMAIL')}>Riprova</button></>;
  }
  if (state === 'ACCESS_DENIED') {
    return <><AccessStatus tone="error">Non è possibile completare l’accesso.</AccessStatus><button className="access-secondary" type="button" onClick={() => setState('ENTER_EMAIL')}>Torna all’accesso</button></>;
  }
  if (state === 'MAGIC_LINK_SENT') {
    return (
      <div className="access-form">
        <AccessStatus tone="success">Controlla la tua email</AccessStatus>
        <p className="access-helper">Apri il link ricevuto per completare l’accesso. Il link è personale e temporaneo.</p>
        <button className="access-secondary" type="button" onClick={() => setState('ENTER_EMAIL')}>Usa un’altra email</button>
      </div>
    );
  }
  return (
    <form className="access-form" onSubmit={requestMagicLink}>
      <label htmlFor="access-email">Email professionale</label>
      <input id="access-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <button className="access-primary" type="submit" disabled={busy}>{busy ? 'Invio…' : 'Invia link di accesso'}</button>
      <p className="access-helper">L’indirizzo serve soltanto per ricevere il link di accesso. I permessi sono governati separatamente.</p>
    </form>
  );
}
