import { cookies } from 'next/headers';
import { AccessAuthPanel } from '../components/access-auth-panel';
import { AccessLauncher } from '../components/access-launcher';
import { AccessStatus } from '../components/access-status';
import { buildLauncher } from '../src/domain/launcher-service.ts';
import { isActivePilotInstitutionalContext, isSessionBindingCurrent } from '../src/domain/principal-service.ts';
import { sha256SessionSecret } from '../src/domain/session-service.ts';
import { getRuntime } from '../src/server/runtime.ts';
import { ACCESS_SESSION_COOKIE } from '../src/server/session-cookie.ts';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ auth?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const runtime = getRuntime();
  const params = await searchParams;
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
      const bindingCurrent = await isSessionBindingCurrent(runtime.identityRepository, record);
      if (!principal || principal.status !== 'ACTIVE' || !context || context.contextId !== record.contextId || !isActivePilotInstitutionalContext(context) || !bindingCurrent) {
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
        <p className="access-lede">Ricevi un link personale sulla tua email professionale autorizzata e usalo per entrare.</p>
        {params.auth === 'invalid' ? <AccessStatus tone="error">Il link di accesso non è valido o è scaduto.</AccessStatus> : null}
        {params.auth === 'denied' ? <AccessStatus tone="error">Non è possibile completare l’accesso.</AccessStatus> : null}
        {params.auth === 'unavailable' ? <AccessStatus tone="notice">Accesso temporaneamente non disponibile. Riprova più tardi.</AccessStatus> : null}
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
