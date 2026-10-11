'use client';

import { FormEvent, useState } from 'react';
import { AccessStatus } from './access-status';

type State = 'ENTER_EMAIL' | 'OTP_VERIFY' | 'ACCESS_DENIED' | 'PROVIDER_UNAVAILABLE';

export function AccessAuthPanel() {
  const [state, setState] = useState<State>('ENTER_EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [otpInvalid, setOtpInvalid] = useState(false);

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setOtpInvalid(false);
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.status === 503) setState('PROVIDER_UNAVAILABLE');
      else if (response.ok) setState('OTP_VERIFY');
      else setState('ACCESS_DENIED');
    } catch {
      setState('PROVIDER_UNAVAILABLE');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setOtpInvalid(false);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (response.status === 204) {
        window.location.reload();
        return;
      }
      if (response.status === 401) setOtpInvalid(true);
      else if (response.status === 503) setState('PROVIDER_UNAVAILABLE');
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
  if (state === 'OTP_VERIFY') {
    return (
      <form className="access-form" onSubmit={verifyOtp}>
        <AccessStatus tone="success">Codice inviato</AccessStatus>
        <label htmlFor="access-otp">Codice OTP</label>
        <input id="access-otp" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" value={otp} onChange={(event) => setOtp(event.target.value)} required />
        {otpInvalid ? <AccessStatus tone="error">Codice non valido o scaduto.</AccessStatus> : null}
        <button className="access-primary" type="submit" disabled={busy}>{busy ? 'Verifica…' : 'Verifica codice'}</button>
        <button className="access-secondary" type="button" disabled={busy} onClick={() => { setState('ENTER_EMAIL'); setOtp(''); }}>Usa un’altra email</button>
      </form>
    );
  }
  return (
    <form className="access-form" onSubmit={requestOtp}>
      <label htmlFor="access-email">Email professionale</label>
      <input id="access-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <button className="access-primary" type="submit" disabled={busy}>{busy ? 'Invio…' : 'Invia codice'}</button>
      <p className="access-helper">L’indirizzo serve soltanto per ricevere il codice di accesso. I permessi sono governati separatamente.</p>
    </form>
  );
}
