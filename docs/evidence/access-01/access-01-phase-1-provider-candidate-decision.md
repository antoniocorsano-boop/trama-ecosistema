# ACCESS-01 Phase 1 — Identity Provider Candidate Decision

**Data evidenza:** 2026-10-10  
**Stato:** `CANDIDATE_ONLY / NOT_RUNTIME_AUTHORIZED`  
**Decisione:** candidato primario per Phase 2 = **progetto Supabase Auth dedicato a TRAMA**, separato dai database di prodotto, subordinato a verifica dei gap indicati sotto.  
**Alternativa di portabilità verificata:** **Keycloak** come provider OIDC standard self-hosted/managed.

## 1. Confine della decisione

Questa decisione non crea alcun progetto, non abilita OAuth/OIDC, non registra client, non migra utenti e non autorizza costi.

Il contratto autorevole resta `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`; il provider è sostituibile e non può imporre al contratto campi o semantiche proprietarie.

**NO PROJECT CREATED**  
**NO COST AUTHORIZED**  
**NOT_RUNTIME_AUTHORIZED**

## 2. Evidenza ufficiale — Supabase Auth

Documentazione ufficiale consultata il 2026-10-10:

- OAuth 2.1 Server: https://supabase.com/docs/guides/auth/oauth-server
- OAuth 2.1 Flows / OIDC: https://supabase.com/docs/guides/auth/oauth-server/oauth-flows
- Getting Started OAuth 2.1 Server: https://supabase.com/docs/guides/auth/oauth-server/getting-started
- MFA: https://supabase.com/docs/guides/auth/auth-mfa
- Authenticator Assurance Level: https://supabase.com/docs/reference/javascript/auth-mfa-getauthenticatorassurancelevel
- Sessioni: https://supabase.com/docs/guides/auth/sessions
- Sign out: https://supabase.com/docs/guides/auth/signout
- Regioni: https://supabase.com/docs/guides/platform/regions
- Data residency FAQ: https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq
- Pricing: https://supabase.com/pricing

### Riscontro sui criteri ACCESS-01

| Criterio | Riscontro | Decisione Phase 1 |
| --- | --- | --- |
| OAuth/OIDC provider | Supabase Auth può operare come OAuth 2.1 e OpenID Connect identity provider, con discovery, UserInfo e JWKS | **COMPATIBILE** |
| Authorization code + PKCE | supportato; il flusso documentato usa authorization code + PKCE | **COMPATIBILE CON VINCOLO S256** |
| Redirect URI | i client OAuth richiedono match esatto; wildcard/pattern non ammessi | **COMPATIBILE** |
| Issuer/JWKS/audience | ID token OIDC con `iss`, `sub`, `aud`; JWKS e discovery pubblici | **COMPATIBILE** |
| MFA / step-up path | TOTP e phone MFA; AAL `aal1/aal2` disponibile | **COMPATIBILE COME CAPACITÀ**, mapping OIDC step-up da provare |
| Session/logout | sessioni e sign-out locale/globale supportati; access token già emessi restano validi fino a scadenza | **PARZIALE**, richiede policy expiry/revalidation |
| RP-initiated/global OIDC logout | non qualificato dalla documentazione OAuth Server consultata come garanzia equivalente a un logout federato completo | **GAP APERTO**; il contratto resta best-effort |
| EU region/data location | regioni specifiche UE disponibili, incluse Frankfurt/Paris/Ireland/Stockholm; la regione determina la localizzazione primaria, con caveat legali/documentati sui trattamenti esterni | **COMPATIBILE CON SCELTA REGIONALE ESPLICITA** |
| Portabilità | OAuth/OIDC standard e JWKS riducono il coupling; Auth usa comunque infrastruttura Supabase/Postgres internamente | **ACCETTABILE SOLO CON PROGETTO DEDICATO E ADAPTER STANDARD** |
| Costi | OAuth server non ha surcharge separato; MAU/piano e alcune capacità MFA/sessione possono incidere | **DA AUTORIZZARE IN PHASE 2** |

### Gap specifico PKCE

La documentazione Supabase OAuth 2.1 presenta PKCE come parte del flusso e raccomanda `S256`, ma la pagina dei flow indica che il parametro `code_challenge_method` può essere `S256` o `plain`.

TRAMA richiede **S256**. Phase 2 dovrà quindi dimostrare che tutti i client TRAMA usano S256 e che la configurazione/validazione adottata non consente una regressione silenziosa a `plain`. In assenza di tale prova il provider non supera il gate runtime.

### Gap specifico logout

Il sign-out Supabase permette scope locale/globale e revoca refresh token/sessioni; i JWT access token già emessi restano validi fino alla loro scadenza. La documentazione OAuth Server consultata non viene assunta come prova di RP-Initiated Logout OIDC end-to-end tra tutte le relying application TRAMA.

Per questo `TRAMA-PROFESSIONAL-IDENTITY-01` conserva correttamente:

- logout locale obbligatorio e indipendente dal provider;
- logout coordinato/globale solo best-effort quando realmente supportato;
- sessioni bounded e revalidation per nuovi privilegi.

## 3. Portability check — Keycloak

Documentazione ufficiale consultata:

- Server Administration Guide: https://www.keycloak.org/docs/latest/server_admin/
- Securing Applications and Services: https://www.keycloak.org/docs/latest/securing_apps/
- Upgrading / OIDC logout: https://www.keycloak.org/docs/latest/upgrading/

Keycloak conferma che il contratto TRAMA non dipende da Supabase:

- OpenID Connect è un protocollo di prima classe per i client;
- authorization code flow e PKCE `S256` sono configurabili;
- le redirect URI possono essere ristrette e devono essere quanto più specifiche possibile;
- OTP/WebAuthn e authentication flows supportano MFA/step-up;
- RP-Initiated Logout, front-channel e back-channel logout sono supportati nelle versioni correnti;
- issuer/audience/JWKS sono parte del normale modello OIDC;
- data residency dipende dal luogo in cui l'istanza viene ospitata.

### Perché non è il candidato primario adesso

Keycloak offre maggiore controllo e una superficie OIDC molto completa, ma introduce un carico operativo superiore: hosting, patching, HA, backup, monitoring, hardening e gestione lifecycle del servizio identitario. ACCESS-01 vuole prima provare il confine con il minimo runtime necessario.

Keycloak resta quindi **EXIT / PORTABILITY OPTION**, non fallback automatico.

## 4. Decisione condizionata

Per Phase 2 il candidato iniziale è un **nuovo progetto Supabase Auth dedicato a TRAMA**, solo se una decisione separata autorizzerà creazione/costo e se un proof tecnico dimostrerà:

1. OAuth/OIDC discovery e JWKS corretti;
2. authorization code + PKCE `S256` per ogni relying application;
3. redirect URI esatte e separate per ambiente;
4. ID token verificato con issuer/audience/nonce secondo contratto;
5. MFA/AAL2 disponibile senza trasformare il semplice login in authority di governance;
6. sessione locale bounded e revalidation coerente con revoca entitlement;
7. logout locale sempre funzionante; nessuna falsa promessa di logout globale;
8. regione UE esplicitamente selezionata e verificata;
9. database Auth separato dai dati di Docente OS, Arena, Studio Atlas, Curricolo Atlas, Materiali e learner;
10. adapter che usa solo semantiche standard del contratto TRAMA.

Se uno di questi punti non è dimostrabile senza dipendenza proprietaria sostanziale, la scelta provider torna a decisione senza modificare `TRAMA-PROFESSIONAL-IDENTITY-01`.

## 5. Exit strategy

La sostituibilità si conserva perché i prodotti dipenderanno da:

- issuer/subject verificati;
- OIDC discovery/JWKS;
- authorization code + PKCE;
- mapping TRAMA principal → local subject;
- entitlement coarse-grained;
- sessione/autorizzazione locale del prodotto.

Nessun prodotto deve dipendere direttamente da tabelle interne Supabase Auth o da un UUID Supabase condiviso come chiave di dominio.
