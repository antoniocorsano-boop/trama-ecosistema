import type { AccessState } from '../app/access-state';

const COPY = {
  MAGIC_LINK_SENT: {
    title: 'Controlla la tua email',
    body: 'Se il tuo accesso è abilitato, riceverai un collegamento per continuare.',
  },
  AUTH_CALLBACK_PROCESSING: {
    title: 'Stiamo completando il tuo accesso',
    body: 'Attendi qualche istante mentre verifichiamo il collegamento.',
  },
  AUTHENTICATED: {
    title: 'Accesso verificato',
    body: 'Stiamo preparando i tuoi ambienti.',
  },
  NO_ENTITLEMENTS: {
    title: 'Nessun ambiente disponibile',
    body: 'Il tuo accesso è attivo, ma al momento non risultano ambienti assegnati.',
  },
  ACCESS_DENIED: {
    title: 'Accesso non disponibile',
    body: 'Non è possibile completare questo accesso. Puoi tornare alla schermata iniziale e riprovare.',
  },
  PROVIDER_UNAVAILABLE: {
    title: 'Servizio di accesso temporaneamente non disponibile',
    body: 'Riprova più tardi. Le superfici pubbliche di TRAMA restano disponibili separatamente.',
  },
  SESSION_EXPIRED: {
    title: 'La sessione è scaduta',
    body: 'Per continuare è necessario effettuare nuovamente l’accesso.',
  },
} as const;

type StatusState = Exclude<AccessState['state'], 'SIGNED_OUT' | 'ENTITLEMENTS_AVAILABLE'>;

export function AccessStatus({ state }: { state: Extract<AccessState, { state: StatusState }> }) {
  const copy = COPY[state.state];
  return (
    <div className="access-status" role="status" aria-live="polite">
      <h1 id="access-title">{copy.title}</h1>
      <p>{copy.body}</p>
    </div>
  );
}
