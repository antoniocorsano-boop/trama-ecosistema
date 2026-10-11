# ACCESS-01 Phase 2 — Provider Preflight

**Data:** 2026-10-11  
**Stato:** `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION`  
**Candidato:** progetto **Supabase Auth dedicato a TRAMA Access**  
**Source head del preflight:** `5122cc9cfc11eedb8ee11447a01328776bdb25d1`  
**Contratto:** `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`  
**Spec:** `docs/superpowers/specs/2026-10-11-access-01-phase-2-trama-access-runtime-design.md`

> `NO PROJECT CREATED` · `NO COST AUTHORIZED` · `NO SECRET CREATED` · `NO PROVIDER USER CREATED` · `NO DEPLOY`

## 1. Decisione

Il provider candidato supera il **preflight documentale** della Phase 2 senza richiedere modifiche al contratto TRAMA. Il risultato è quindi `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION`, non `RUNTIME_AUTHORIZED`.

La decisione è condizionata a verifiche e scelte esplicite prima di qualsiasi mutazione esterna. In particolare, non è autorizzata da questo documento la creazione di un progetto Supabase, di un utente Auth, di secret, di migrazioni live, di SMTP custom o di costi.

## 2. Riscontro sui gate Phase 2

| Gate | Esito preflight | Evidenza / condizione |
| --- | --- | --- |
| Progetto Auth dedicato | **PASS ARCHITETTURALE** | Il progetto deve essere separato dai database di Docente OS, Arena, Studio Atlas, Curricolo Atlas, Materiali e learner. |
| Principal pre-provisionato | **PASS** | `auth.admin.createUser()` è server-only e permette di creare anticipatamente l'utente provider; il relativo user id fornisce il subject stabile da bindare prima del login. |
| OTP email, non Magic Link | **PASS CON CONFIGURAZIONE** | Il template deve usare `{{ .Token }}` e non `{{ .ConfirmationURL }}`. La verifica avviene tramite `verifyOtp`. |
| Nessun self-signup | **PASS CON VINCOLO** | L'utente provider viene creato prima del pilot; il flusso OTP deve usare la variante/configurazione con creazione utente disabilitata. L'adapter concreto deve avere un test che prova che un alias sconosciuto non può creare un provider user. |
| Authority `issuer + subject` | **PASS** | JWT Supabase espone `iss` e `sub`; `sub` è l'identificatore univoco dell'utente. Email resta solo LoginAlias/consistency check. |
| Regione UE | **PASS CON SCELTA ESPLICITA** | Usare una regione **specifica**, non il raggruppamento generale Europe. Candidato raccomandato: `eu-central-1` / Frankfurt. La regione deve essere scelta e verificata al provisioning. |
| Pilot zero-cost | **CONDIZIONALE** | Il piano Free ha capienza largamente sufficiente per un principal di pilot, ma occorre verificare che l'account/organizzazione disponga ancora di quota per un progetto Free prima di crearlo. |
| Invio email built-in | **CONDIZIONALE** | SMTP built-in invia solo a indirizzi pre-autorizzati appartenenti al team del progetto ed è limitato attualmente a 2 email/ora. Per il pilot zero-cost va usato solo se l'indirizzo di test soddisfa tale condizione. |
| SMTP custom | **NON AUTORIZZATO** | Se il principal pilot non è un indirizzo team ammesso dal SMTP built-in, la fase si ferma e richiede una decisione separata; non si configura automaticamente un servizio SMTP esterno. |
| Secret server-side | **PASS** | Le chiavi `sb_secret_...` sono backend-only e bypassano RLS; nessuna secret key deve arrivare al browser, essere prefissata `NEXT_PUBLIC_` o entrare nei log. |
| Client Auth server-side | **PASS** | Il client server deve usare `autoRefreshToken:false`, `persistSession:false`, `detectSessionInUrl:false`; la sessione provider non è la sessione TRAMA Access. |
| Sessione Access ≤ 8h | **PASS INDIPENDENTE DAL PROVIDER** | Supabase Free non fornisce i controlli Pro di session lifetime. TRAMA Access mantiene quindi la propria sessione opaca con TTL assoluto `28800` secondi e revoca locale immediata. |
| Logout | **PASS LOCALE / BEST-EFFORT PROVIDER** | Supabase supporta scope di sign-out, ma access token già emessi restano validi fino a `exp`; il logout Access locale resta l'unica garanzia immediata Phase 2. |
| OAuth/OIDC futuro | **PASS CON GAP APERTO S256** | Discovery, OIDC, JWKS e authorization-code + PKCE sono disponibili; la documentazione ammette `S256` o `plain`. I client TRAMA futuri devono imporre `S256` e impedirne il downgrade. |
| Redirect OAuth futuri | **PASS** | Le redirect URI OAuth client richiedono match esatto; niente wildcard. |
| Portabilità | **PASS** | Il dominio Phase 2 dipende da porte TRAMA; nessun prodotto usa UUID/tabelle Supabase come authority propria. |

## 3. Identità pre-provisionata

Flusso autorizzabile solo dopo il gate umano:

```text
server/admin create provider user
        ↓
provider user id stabile = external subject
        ↓
pre-provision LoginAlias(providerIssuer, providerSubject)
        ↓
Principal TRAMA già esistente
        ↓
InstitutionalContext + ApplicationEntitlement già esistenti
        ↓
email OTP con user creation disabilitata
        ↓
verify OTP server-side
        ↓
exact issuer + subject
        ↓
AccessSession locale TRAMA
```

La presenza della stessa email non autorizza mai un nuovo binding. Se `issuer + subject` non coincide con quello pre-provisionato, il login fallisce chiuso.

## 4. OTP-only

La configurazione email del pilot deve rendere il codice il solo meccanismo presentato all'utente:

- template passwordless con `{{ .Token }}`;
- nessuna CTA `{{ .ConfirmationURL }}` nel template pilot;
- inserimento del codice dentro TRAMA Access;
- verifica server-side con `verifyOtp`;
- nessun token o sessione trasportato tramite URL.

Questa scelta riduce inoltre il rischio documentato di prefetch automatico dei link email.

## 5. Regione e data location

Supabase assegna a ogni progetto una regione primaria. Per requisiti di giurisdizione/data location la documentazione raccomanda una **specific region**; il raggruppamento generale `Europe` può includere regioni non UE.

Per il pilot TRAMA la raccomandazione è:

```text
Central EU (Frankfurt) — eu-central-1
```

È una raccomandazione del preflight, non una scelta già autorizzata.

## 6. Zero-cost e email delivery

Per un solo principal il piano Free è tecnicamente sufficiente rispetto ai limiti pubblicati (fra cui 50.000 MAU e 500 MB database per progetto). Supabase concede attualmente due progetti Free complessivi per le organizzazioni in cui l'utente è Owner/Admin; la disponibilità effettiva della quota va controllata prima della creazione.

Il limite operativo più stretto per il pilot è il servizio email built-in:

- solo indirizzi appartenenti al team del progetto;
- 2 email/ora al momento della verifica;
- best-effort, senza SLA;
- non destinato alla produzione.

Quindi `zero-cost` **non equivale** a un canale email generale gratuito. Se l'indirizzo pilot non è idoneo al servizio built-in, il gate torna a decisione prima di introdurre SMTP custom.

I progetti Free possono inoltre essere sospesi per bassa attività; questa è una limitazione accettabile solo per un pilot e non costituisce una garanzia di disponibilità produttiva.

## 7. Sessione e logout

Supabase Auth crea normalmente sessioni provider con access token JWT e refresh token. Le policy avanzate di time-box/inactivity/single-session sono Pro+ e non vengono richieste da ACCESS-01 Phase 2.

TRAMA Access mantiene il confine approvato:

- token/sessione Supabase non diventano sessione cross-product;
- sessione TRAMA server-side con secret opaco e digest persistito;
- TTL assoluto ≤ 8 ore;
- entitlement e principal ricontrollati server-side;
- logout locale Access immediato anche se il provider è indisponibile;
- logout provider soltanto best-effort.

## 8. Secret e client server-side

L'adapter live dovrà usare il modello corrente delle API key Supabase:

- secret key `sb_secret_...` solo su server trusted;
- nessuna secret key nel bundle client o in variabili `NEXT_PUBLIC_*`;
- client amministrativo separato;
- `autoRefreshToken:false`;
- `persistSession:false`;
- `detectSessionInUrl:false`.

La secret key bypassa RLS: la sua esposizione è quindi un rischio critico e resta fuori dagli artefatti, dai log e dal repository.

## 9. OAuth/OIDC futuro

La Phase 2 non federerà ancora i prodotti. Il preflight conferma comunque la portabilità richiesta dalla Phase 1:

- endpoint authorization/token;
- OAuth discovery;
- OIDC discovery;
- JWKS;
- authorization code + PKCE;
- redirect OAuth client con match esatto.

Resta aperto un requisito di hardening: Supabase documenta `code_challenge_method = S256 | plain`. Il contratto TRAMA richiede **S256**. Nessun client Phase 3+ sarà qualificato senza un test esplicito che provi `S256` e impedisca downgrade a `plain`.

## 10. Mutazioni esterne richieste nel passo successivo

Se e solo se il gate umano viene autorizzato, Task 11 potrà:

1. verificare la disponibilità effettiva di quota Free nell'organizzazione scelta;
2. creare/selezionare **un progetto Supabase dedicato a TRAMA Access**;
3. scegliere esplicitamente `eu-central-1` / Frankfurt, salvo diversa decisione umana;
4. verificare che nessun add-on/piano a pagamento venga attivato;
5. configurare il template email OTP con `{{ .Token }}`;
6. verificare che il principal di test sia idoneo al SMTP built-in; altrimenti **STOP** prima di SMTP custom;
7. ottenere/configurare una secret key server-only;
8. pre-creare esattamente un provider user pilot e acquisirne il subject stabile;
9. applicare la migrazione Access separata;
10. pre-provisionare Principal/LoginAlias/context/entitlement;
11. eseguire un solo live smoke controllato OTP → subject → Principal → sessione → launcher → logout.

Nessuna di queste azioni è autorizzata dal presente preflight.

## 11. Fonti ufficiali verificate

Verificate il 2026-10-11:

- Regions: https://supabase.com/docs/guides/platform/regions
- SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Auth rate limits: https://supabase.com/docs/guides/auth/rate-limits
- Email templates / OTP: https://supabase.com/docs/guides/auth/auth-email-templates
- Admin create user: https://supabase.com/docs/reference/javascript/auth-admin-createuser
- JWT claims: https://supabase.com/docs/guides/auth/jwts
- User sessions: https://supabase.com/docs/guides/auth/sessions
- Sign out: https://supabase.com/docs/guides/auth/signout
- API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Server Auth client: https://supabase.com/docs/reference/javascript/auth
- Billing / Free Plan: https://supabase.com/docs/guides/platform/billing-on-supabase
- Production checklist / Free pause: https://supabase.com/docs/guides/deployment/going-into-prod
- OAuth server: https://supabase.com/docs/guides/auth/oauth-server
- OAuth getting started / exact redirects: https://supabase.com/docs/guides/auth/oauth-server/getting-started
- OAuth flows / PKCE: https://supabase.com/docs/guides/auth/oauth-server/oauth-flows

## 12. Gate

**Decisione:** `READY_FOR_EXPLICIT_PROVIDER_AUTHORIZATION`

Il runtime provider-neutral può procedere tecnicamente al provider live senza cambiare il contratto, ma **Task 11 resta bloccato** finché l'utente non autorizza separatamente progetto/regione/free-tier assumption/provider user/secret e finché il vincolo SMTP del principal pilot non è soddisfatto o risolto da una nuova decisione.
