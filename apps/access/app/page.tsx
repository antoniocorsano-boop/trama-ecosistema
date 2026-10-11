import { cookies } from 'next/headers';
import { AccessAuthPanel } from '../components/access-auth-panel';
import { AccessLauncher } from '../components/access-launcher';
import { AccessStatus } from '../components/access-status';
import { buildLauncher } from '../src/domain/launcher-service.ts';
import { sha256SessionSecret } from '../src/domain/session-service.ts';
import { getRuntime } from '../src/server/runtime.ts';
import { ACCESS_SESSION_COOKIE } from '../src/server/session-cookie.ts';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const runtime = getRuntime();
  const cookieStore = await cookies();
  const secret = cookieStore.get(ACCESS_SESSION_COOKIE)?.value;

  let sessionExpired = false;
  if (secret) {
    const now = runtime.now();
    const record = await runtime.sessionStore.findByDigest(sha256SessionSecret(secret));
    if (!record || record.revokedAt || now >= record.absoluteExpiresAt) {
      sessionExpired = true;
    } else {
      const principal = await runtime.identityRepository.getPrincipal(record.principalId);
      const contexts = await runtime.identityRepository.listActiveContexts(record.principalId);
      const context = contexts.length === 1 ? contexts[0] : undefined;
      if (!principal || principal.status !== 'ACTIVE' || !context || context.status !== 'ACTIVE' || context.contextId !== record.contextId) {
        sessionExpired = true;
      } else {
        const entitlements = await runtime.identityRepository.listEntitlements(record.principalId, record.contextId, now);
        const cards = buildLauncher({ entitlements, registry: runtime.applicationRegistry, at: now });
        return (
          <main className="access-shell">
            <section className="access-panel" aria-labelledby="access-title">
              <p className="access-kicker">TRAMA · spazio professionale</p>
              <h1 id="access-title">TRAMA Access</h1>
              <p className="access-lede">Il tuo ingresso governato agli strumenti dell’ecosistema.</p>
              <AccessLauncher cards={cards} />
            </section>
          </main>
        );
      }
    }
  }

  return (
    <main className="access-shell">
      <section className="access-panel" aria-labelledby="access-title">
        <p className="access-kicker">TRAMA · spazio professionale</p>
        <h1 id="access-title">TRAMA Access</h1>
        <p className="access-lede">Accedi con il codice monouso inviato alla tua email professionale autorizzata.</p>
        {sessionExpired ? <AccessStatus tone="notice">La sessione è scaduta. Accedi di nuovo.</AccessStatus> : null}
        {runtime.config.providerKind === 'disabled' ? (
          <AccessStatus tone="notice">Accesso temporaneamente non disponibile. Riprova più tardi.</AccessStatus>
        ) : (
          <AccessAuthPanel />
        )}
      </section>
    </main>
  );
}
