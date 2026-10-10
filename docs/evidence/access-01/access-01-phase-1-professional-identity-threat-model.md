# ACCESS-01 Phase 1 — Professional Identity Threat Model

**Threat model:** `TRAMA-PROFESSIONAL-IDENTITY-THREAT-MODEL-01@1.0.0`  
**Contract:** `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`  
**Scope:** confine identitario professionale; nessun runtime provider autorizzato.

## Obiettivo

Questo modello qualifica i principali rischi del futuro confine OAuth/OIDC prima della creazione di TRAMA Access o di un identity provider. I controlli qui descritti sono invarianti di contratto; le prove runtime restano demandate alle fasi successive.

## Threat register

| ID | Minaccia/failure | Controllo canonico | Residuo |
| --- | --- | --- | --- |
| T01 | token leakage / URL exposure | token vietati negli URL applicativi; niente token condivisi via localStorage | implementazione runtime da verificare |
| T02 | authorization-code interception | authorization code + PKCE S256 | callback compromise resta rischio applicativo |
| T03 | redirect injection / open redirect | redirect URI in allowlist esatta, senza wildcard | configurazione esatta da verificare in Phase 2 |
| T04 | login CSRF / state mismatch | `state` obbligatorio e legato alla transazione | binding runtime da provare |
| T05 | nonce/assertion replay | `nonce` obbligatorio quando si consuma ID token; sessione locale bounded | lifetime provider da qualificare |
| T06 | issuer/audience confusion | issuer allowlist esatta + audience/client binding esatto | discovery/JWKS runtime da qualificare |
| T07 | account linking takeover | principal da `issuer + subject`; email non autorevole; mapping server-side | migrazione utenti esistenti da progettare |
| T08 | entitlement escalation | entitlement centrali coarse-grained; permessi fini locali | ogni prodotto deve continuare a imporre RLS/ruoli |
| T09 | provider outage | nuovo sign-in fail-closed; superfici pubbliche restano disponibili | login professionale indisponibile durante outage |
| T10 | incomplete logout / stale session | logout locale indipendente dal provider; expiry locale bounded; no nuovo privilegio senza revalidation | global logout non sempre garantibile |
| T11 | governance step-up bypass | `GOVERNANCE_OPERATOR` non basta per azioni sensibili; step-up/MFA separato | enforcement runtime in Phase 9 |
| T12 | learner boundary contamination | identità learner vietata nel contratto professionale | assignment privacy-first da qualificare in Phase 7 |

## Sessione, outage e revoca

Le semantics canoniche sono:

- una nuova autenticazione professionale fallisce chiuso quando discovery, JWKS o verifica del provider non sono disponibili;
- TRAMA Gateway, Curricolo Atlas pubblico e Control Center pubblico restano indipendenti dall'outage dell'identità professionale;
- una sessione locale già stabilita può continuare solo entro la propria scadenza governata e non può ottenere nuovo privilegio senza revalidation riuscita;
- il logout locale termina sempre la sessione del prodotto anche se il provider è indisponibile;
- il logout coordinato/globale è `BEST_EFFORT_IF_SUPPORTED`: non viene dichiarato come garanzia quando provider o applicazione non lo supportano;
- una revoca di entitlement deve essere effettiva non oltre il successivo confine governato di revalidation/sessione;
- le operazioni privilegiate di governance restano fuori da Phase 1 e richiederanno il confine step-up/MFA dedicato.

## Mapping threat → verification

Le verifiche automatiche di Phase 1 coprono direttamente T01–T09, T11 e T12 mediante casi avversari del validator. T10 è qualificato contrattualmente e richiede prova runtime nelle fasi che introdurranno sessioni reali.

Il file machine-readable `governance/access/trama-professional-identity-threat-model.v1.json` è l'autorità strutturata. Questo documento è la lettura umana corrispondente.

## Non-autorizzazioni

Questo threat model non autorizza:

- creazione di un identity provider;
- creazione di un progetto Supabase/Auth0/Keycloak o equivalente;
- callback OAuth/OIDC reali;
- migrazione utenti;
- federazione con Docente OS, Arena, Studio Atlas, Curricolo Atlas o Control Center;
- account learner;
- step-up/MFA operativo.
