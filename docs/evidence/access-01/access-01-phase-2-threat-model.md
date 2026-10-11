# ACCESS-01 Phase 2 — Runtime Threat Model

**Data:** 2026-10-11  
**Stato:** `PREFLIGHT / NO_PROVIDER_RUNTIME`  
**Source head:** `b3a3a226e9be902bc3d59d82fb7e851369afb2da`  
**Contratto:** `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`  
**Ambito:** OTP professionale, LoginAlias, exact subject binding, sessione Access, provider outage, entitlement e configurazione pilot.

## 1. Asset e trust boundary

Asset protetti:

- `Principal` TRAMA e suo lifecycle;
- binding `LoginAlias -> exact issuer + subject -> Principal`;
- `InstitutionalContext` attivo;
- `ApplicationEntitlement` coarse-grained;
- secret/digest della `AccessSession`;
- server-side provider secret;
- integrità del launcher e della decisione launch;
- privacy dell'allowlist pilot;
- separazione da dati di prodotto e learner.

Trust boundary:

```text
Browser
  │  cookie Access opaco
  ▼
TRAMA Access BFF
  ├── domain + entitlement + session enforcement
  ├── Access store dedicato
  └── AuthProviderAdapter
             │
             ▼
       Supabase Auth candidate
```

Gateway e prodotti restano fuori dal boundary Phase 2.

## 2. Registro minacce

| ID | Minaccia / failure | Controllo Phase 2 | Verifica / rischio residuo |
| --- | --- | --- | --- |
| P2-T01 | **Intercettazione o replay OTP** | OTP gestito dal provider; codice mai persistito nel registro Access o nei log; verifica server-side; rate limiting locale. | Live smoke deve usare codice reale senza registrarlo. Expiry/replay provider restano dipendenza esterna da verificare sul live pilot. |
| P2-T02 | **User/alias enumeration** | risposta pubblica neutra per alias ammesso/non ammesso; availability check provider indipendente dall'allowlist; nessun errore provider raw esposto. | Test `provider outage does not reveal allowlist membership` + handler response neutral. |
| P2-T03 | **Account takeover per email/metadata confusion** | authority esclusivamente `issuer + subject`; email solo `LoginAlias` e consistency check; mismatch fallisce chiuso. | Domain test subject mismatch e verifiedEmail mismatch. |
| P2-T04 | **Auto-provisioning involontario** | Principal, alias, subject binding, context ed entitlement esistono prima del login; runtime non espone create/upsert; provider OTP deve disabilitare user creation. | Validator vieta funzioni di auto-provisioning; adapter live deve avere test specifico. |
| P2-T05 | **Leak di secret amministrativa** | secret key solo backend, nessun `NEXT_PUBLIC_*`, nessun log; admin client separato, session persistence disabilitata. | Task 11 adapter contract + secret scan. La secret bypassa RLS: impatto critico se esposta. |
| P2-T06 | **Session theft / fixation / stale cookie** | secret casuale ≥256 bit; datastore conserva SHA-256 digest; cookie `__Host-`, `HttpOnly`, `Secure`, `SameSite=Lax`, no Domain; TTL assoluto 8h; revoca immediata. | Unit test session/cookie; browser logout/expired state. |
| P2-T07 | **Rate-limit bypass, rotazione alias o restart del processo** | limiti per alias: 5 request / 10 verify per 15m su digest email; in più la verifica provider ha un budget globale di 20 tentativi / 15m su chiave tecnica costante, consumato prima di availability/verify. Nessun header IP non governato diventa authority del limiter. | Il test di regressione usa 21 email differenti e prova che la 21ª verifica viene bloccata prima del provider. L'implementazione in-memory è soltanto dev/test. **Task 11 deve usare uno store condiviso/persistente** che preservi sia i limiti per alias sia il budget globale tra istanze; un limiter per-processo non è qualificabile come runtime live. |
| P2-T08 | **Provider outage** | nuovo login fail-closed; availability non dipende dall'allowlist; sessione Access già valida può restare entro TTL senza escalation. | Domain/security test; superfici pubbliche non dipendono da Access. |
| P2-T09 | **Entitlement stale/revoked** | launcher e launch leggono entitlement correnti server-side; revocato/sospeso/expired non diventa launchable; Phase 2 non produce redirect. | Launcher + handler tests. |
| P2-T10 | **Fake/memory adapter accidentalmente in produzione** | config rifiuta `fake + memory` in production; validator permanente; `supabase` runtime non è ancora autorizzato. | Config tests + Phase 2 validator + CI. |
| P2-T11 | **Provider session lifetime/logout confusa con sessione TRAMA** | token/provider session non sono la sessione Access; Access usa TTL proprio ≤8h; logout locale Access è immediato; provider global logout best-effort. | Session/logout tests. Supabase access token può sopravvivere fino a `exp`, quindi non è authority di revoca Access. |
| P2-T12 | **PKCE downgrade futuro** | contratto impone `S256`; redirect exact match; Phase 3+ deve rifiutare `plain`. | Gap provider documentato: Supabase accetta `S256` o `plain`; test di non-downgrade obbligatorio prima della federazione. |
| P2-T13 | **SMTP error come information oracle / delivery non governata** | errori SMTP/provider non vengono mostrati raw; built-in SMTP limitato a team members per pilot. | Se il test principal non è team member, STOP; custom SMTP richiede decisione separata. |
| P2-T14 | **Data location errata per uso del general Europe region** | scegliere una specific region UE; raccomandata `eu-central-1`. | Conferma regione nel provisioning/receipt provider. |
| P2-T15 | **Falsa aspettativa di availability sul Free Plan** | pilot dichiarato non-production; nessuna SLA promessa; eventuale pause per inactivity documentata. | Non promuovere il runtime a disponibilità produttiva sulla sola evidenza Free pilot. |
| P2-T16 | **Cross-product privilege confusion** | Phase 2 non federata; nessun token Access ai prodotti; entitlement centrale è solo coarse entry mode. | Registry `NOT_FEDERATED`, no `launchTarget`, validator e browser tests. |
| P2-T17 | **Gateway authority escalation** | nessun cambiamento `apps/gateway/**` ammesso nella Phase 2; Gateway non legge cookie Access. | Validator confronta il branch contro `origin/main`. |
| P2-T18 | **Dati product/learner nel datastore Access** | schema Phase 2 contiene solo identity/context/entitlement/session/rate-limit tecnico. | Validator future migration rifiuta termini product/learner canonici; Human/code review della migration live. |

## 3. Invarianti di sicurezza

Devono restare veri in qualunque adapter live:

1. OTP valido non crea un Principal.
2. Email valida non crea un binding.
3. Email/dominio non assegnano contesto o entitlement.
4. Solo exact `issuer + subject` può risolvere il Principal pre-bound.
5. Un Principal pilot ha esattamente un contesto attivo.
6. Entitlement centrale non sostituisce autorizzazione locale dei prodotti.
7. Nessuna app `NOT_FEDERATED` ha `launchTarget`.
8. Secret provider e session secret non compaiono in URL, browser storage, log o artifact.
9. Sessione Access non supera 8h e non è sliding.
10. Logout Access invalida il secret locale anche durante outage provider.
11. Provider outage non abbatte Gateway, Curricolo Atlas pubblico o Control Center pubblico.
12. Fake/memory adapter non sono ammessi nel runtime production/live.
13. Il limiter live non può essere soltanto memoria di processo e deve preservare tra istanze sia i limiti per alias sia il budget globale di verifica provider.
14. Nessuna federazione prodotto o learner identity viene introdotta in Phase 2.

## 4. Failure model

### Provider non disponibile prima del login

`PROVIDER_UNAVAILABLE`, nessuna sessione, nessun fallback locale, nessun segnale differenziale sulla membership dell'allowlist.

### OTP invalido o scaduto

Nessuna sessione; risposta generica; retry soltanto entro i limiti governati.

### Subject non governato

Fail-closed; nessun linking tramite email, anche se l'email verificata coincide con un alias noto.

### Principal/context invalidi

Nessuna nuova sessione. Una sessione esistente perde validità alla verifica server-side.

### Zero entitlement

Autenticazione valida, launcher vuoto e sicuro.

### Entitlement revocato

Rimosso alla nuova proiezione server-side; launch negato. Nessun logout globale inventato.

### Provider outage dopo login

La sessione Access può continuare solo entro la sua scadenza assoluta e senza ottenere nuovo privilegio. Nessun refresh o escalation viene simulato.

## 5. Provider-specific hardening richiesto prima del live smoke

Task 11 non è qualificabile senza:

- provider user pre-creato con subject noto;
- user creation disabilitata nel sign-in OTP;
- template `{{ .Token }}` OTP-only;
- secret key server-only;
- Auth client server-side con `autoRefreshToken:false`, `persistSession:false`, `detectSessionInUrl:false`;
- Access store separato;
- RLS/no public policies per tabelle Access quando applicabile;
- persistent/shared rate-limit store che implementi limiti per alias e budget globale di verifica provider tra istanze;
- exact region UE verificata;
- nessuna dipendenza del dominio da `auth.users` o da email come authority;
- una prova negativa di subject mismatch;
- una prova negativa di alias non pre-provisionato;
- prova logout locale indipendente dal provider.

## 6. Rischi residui accettabili soltanto nel pilot

- SMTP built-in best-effort e 2 email/ora;
- possibile pausa del progetto Free per inattività;
- nessuna garanzia di global logout OIDC cross-product, perché la federazione non esiste ancora;
- controllo S256 provider-side non assunto come unico enforcement: sarà responsabilità anche del client Phase 3+;
- disponibilità e quota Free da verificare al momento della creazione.

Questi rischi non autorizzano una degradazione silenziosa del contratto. Se impediscono il live pilot sotto i vincoli approvati, il provider gate torna a decisione.

## 7. Fonti ufficiali

- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/reference/javascript/auth-admin-createuser
- https://supabase.com/docs/guides/auth/jwts
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/guides/auth/signout
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/reference/javascript/auth
- https://supabase.com/docs/guides/platform/regions
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://supabase.com/docs/guides/deployment/going-into-prod
- https://supabase.com/docs/guides/auth/oauth-server/getting-started
- https://supabase.com/docs/guides/auth/oauth-server/oauth-flows

## 8. Conclusione

Non emerge un rischio che richieda di piegare o modificare `TRAMA-PROFESSIONAL-IDENTITY-01`. Il candidato può quindi passare al gate umano di provisioning, mantenendo però Task 11 bloccato fino ad autorizzazione esplicita e all'accettazione delle condizioni operative documentate nel provider preflight.
