# ACCESS-01 Phase 2 — TRAMA Access Runtime Design

**Status:** REVIEW_REQUIRED  
**Data:** 2026-10-11  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Branch:** `phase/access-01-phase-2-trama-access-runtime`  
**Baseline:** `main@e007a5e6f425eac5b0a7a757a4807a500f987924`  
**Roadmap:** ACCESS-01 Phase 2 — TRAMA Access runtime minimo  
**Precedenza autorevole:** `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`, ACCESS-01 ecosystem access architecture, Phase 1 provider candidate decision  
**Gate:** design conversazionale approvato; questa specifica richiede review umana prima del piano di implementazione.

## 1. Scopo

Questa specifica definisce il runtime minimo di **TRAMA Access** per ACCESS-01 Phase 2.

La Phase 2 rende reale il solo piano di ingresso professionale: autenticazione passwordless via **OTP email**, risoluzione del principal TRAMA pre-provisionato, contesto istituzionale minimo, entitlement coarse-grained, sessione server-side locale Access e launcher entitlement-driven.

La fase **non** anticipa la federazione verso Docente OS, Arena, Studio Atlas, Curricolo Atlas o Control Center. I prodotti restano autorità delle proprie autorizzazioni locali.

TRAMA Access è un layer di identità + ingresso/launcher. Non diventa una dashboard generale, non assorbe dati di prodotto e non diventa identity authority per learner.

## 2. Risultato atteso

A chiusura Phase 2, un principal professionale di test preventivamente autorizzato deve poter:

1. inserire un indirizzo email presente nella allowlist governata;
2. ricevere un OTP monouso dal provider;
3. inserire l'OTP nella superficie TRAMA Access;
4. completare la verifica server-side del provider;
5. essere risolto verso il `principalId` TRAMA pre-provisionato corretto;
6. ottenere l'unico `InstitutionalContext` attivo previsto dal pilot;
7. creare una sessione Access server-side con durata assoluta massima di 8 ore;
8. vedere un launcher costruito solo dagli entitlement attivi;
9. vedere le app entitlemented ma non federate come non navigabili;
10. perdere immediatamente la sessione al logout;
11. essere bloccato fail-closed nei principali casi negativi.

La Phase 2 non rende reale alcuna federazione prodotto.

## 3. Non-obiettivi

Sono esplicitamente fuori scope:

- password TRAMA;
- Google/Microsoft/social login;
- registrazione pubblica o self-signup;
- auto-provisioning di Principal, contesti o entitlement;
- federazione Docente OS;
- federazione Arena;
- federazione Studio Atlas;
- modalità professionale Curricolo Atlas;
- Control Center privilegiato;
- account learner;
- profili learner personali;
- dati lezioni, curricolo, materiali, classi, gruppi o draft Studio Atlas nel datastore Access;
- dashboard personale generale;
- logout globale cross-product garantito;
- deep link professionali verso i prodotti;
- cutover del Gateway verso TRAMA Access;
- creazione del progetto provider o autorizzazione di costi tramite questa specifica.

## 4. Decisioni approvate Phase 2

| Area | Decisione |
| --- | --- |
| Metodo login pilot | **OTP email**, non magic link |
| Pilot | chiuso, con **allowlist esplicita** |
| Principal | **pre-provisionato**, nessuna creazione automatica al login |
| Registro | datastore dedicato a TRAMA Access, separato dai database di prodotto |
| Entitlement | pre-provisionati manualmente e governati |
| Contesto | un solo `InstitutionalContext` attivo per Principal nel pilot; schema future-ready per multi-contesto |
| Launcher | sempre visibile dopo login valido |
| App non federata | card visibile se entitlement attivo, ma **non navigabile** |
| Runtime | `apps/access`, **Next.js 16 server-side/BFF** su Node 22 |
| Sessione | server-side, cookie opaco `HttpOnly + Secure + SameSite=Lax` |
| TTL | massimo assoluto **8 ore**, non sliding |
| Revalidation | entitlement ricontrollato prima di ogni launch; stato principal/contesto verificato server-side |
| Provider candidato | Supabase Auth dedicato a TRAMA, ancora subordinato a gate separato |
| Provider coupling | isolato dietro adapter; nessuna dipendenza di dominio da tabelle interne proprietarie |

## 5. Architettura

### 5.1 Topologia

```text
TRAMA Gateway (pubblico, invariato in Phase 2)
        │
        │ futuro ingresso canonico; NON attivato in Phase 2
        ▼
TRAMA Access — apps/access
        │
        ├── Web/UI Next.js
        ├── BFF/server routes
        ├── AuthProviderAdapter
        ├── Principal/LoginAlias resolution
        ├── InstitutionalContext resolution
        ├── Entitlement resolution
        ├── AccessSessionStore
        ├── ApplicationRegistry
        └── LauncherService

Provider Auth dedicato
        │
        └── OTP email + identità esterna verificata
```

Il browser non riceve token provider condivisibili con altri prodotti. Il confine browser è la sessione Access locale.

### 5.2 `apps/access`

`apps/access` è una applicazione **Next.js 16** con responsabilità BFF/server-side.

Il runtime deve:

- eseguire sul server le operazioni sensibili;
- mantenere token/provider state fuori da `localStorage`;
- emettere una sola sessione Access opaca;
- costruire server-side il launcher autorizzato;
- non esporre al client dati grezzi non necessari di principal, contesto o provider;
- restare separato dal Gateway e dai prodotti.

La struttura fisica dei file può seguire i pattern del repository, ma i confini logici sotto sono obbligatori.

### 5.3 Unità logiche

```text
apps/access
├── auth
│   ├── AuthProviderAdapter
│   └── otp-flow
├── identity
│   ├── PrincipalRepository
│   └── LoginAliasRepository
├── context
│   └── InstitutionalContextRepository
├── entitlement
│   └── EntitlementRepository
├── session
│   └── AccessSessionStore
├── applications
│   └── ApplicationRegistry
├── launcher
│   └── LauncherService
└── web
    ├── login
    ├── verify-otp
    ├── launcher
    └── logout
```

Questa è una decomposizione di responsabilità, non una prescrizione letterale di directory.

## 6. Autorità identitaria e pre-provisioning

### 6.1 Regola autorevole

Phase 2 eredita senza modifiche `TRAMA-PROFESSIONAL-IDENTITY-01`:

- l'identità esterna autorevole è la coppia esatta **`issuer + subject`** verificata;
- email, nome visualizzato, dominio e metadata mutabili non sono chiavi autorevoli di linking o autorizzazione;
- il `principalId` TRAMA è opaco e stabile;
- gli UUID locali dei prodotti non devono coincidere con il `principalId`.

### 6.2 LoginAlias

L'email è modellata come `LoginAlias`, cioè un mezzo di ingresso governato, non come identità autorevole.

Campi concettuali minimi:

```text
LoginAlias
- aliasId
- principalId
- kind = EMAIL
- normalizedValue
- status = ACTIVE | DISABLED
- providerIssuer
- providerSubject
- pilotAllowed = true | false
- createdAt / updatedAt
```

Vincoli:

- un alias `ACTIVE` non può essere associato a due Principal attivi;
- una coppia `(providerIssuer, providerSubject)` non può essere associata a due Principal;
- l'email non viene usata per assegnare entitlement;
- il dominio email non produce automaticamente contesto o ruolo;
- la risposta pubblica alla richiesta OTP non rivela la presenza dell'alias.

### 6.3 Riconciliazione fra Principal pre-provisionato e `issuer + subject`

Il pilot non può creare il Principal al primo login.

Prima della prima sessione valida devono esistere:

1. `Principal` TRAMA;
2. `LoginAlias` autorizzato;
3. binding pre-provisionato verso l'identità esterna stabile `(issuer, subject)`;
4. un solo contesto istituzionale attivo;
5. eventuali entitlement applicativi.

Questo requisito è intenzionalmente più forte di una semplice allowlist email: evita che l'email diventi de facto una account-linking key.

**Gate provider aggiuntivo:** il candidato Supabase deve dimostrare che un utente pilot può essere pre-provisionato con subject stabile e poi autenticato via OTP con auto-signup disabilitato. Se questo non è dimostrabile senza linking automatico basato solo su email, il provider non supera il gate Phase 2.

## 7. Modello dati minimo

### 7.1 `Principal`

Campi concettuali:

```text
principalId
status = ACTIVE | SUSPENDED | DISABLED
createdAt
updatedAt
```

Il Principal non incorpora email, ruoli di prodotto o permessi fini.

### 7.2 `LoginAlias`

Definito nella sezione precedente. È il record operativo che implementa allowlist e binding verso la soggettività esterna verificata.

### 7.3 `InstitutionalContext`

Campi concettuali:

```text
contextId
principalId
contextType = PERSONAL | INSTITUTION
institutionRef?   // obbligatorio per INSTITUTION
status = ACTIVE | SUSPENDED | DISABLED
createdAt
updatedAt
```

Nel pilot ogni Principal può avere **un solo contesto `ACTIVE`**. Lo schema non deve impedire una futura estensione multi-contesto, ma il runtime Phase 2 non mostra alcun selettore.

`institutionRef` è opaco e non viene dedotto dall'email o dal dominio.

### 7.4 `ApplicationEntitlement`

Gli entitlement centrali restano coarse-grained e conformi al contratto Phase 1.

Combinazioni canoniche iniziali:

```text
DOCENTE_OS       / USE
CURRICOLO_ATLAS  / READ
STUDIO_ATLAS     / AUTHOR
ARENA            / ENTER
CONTROL_CENTER   / GOVERNANCE_OPERATOR
```

Campi concettuali:

```text
entitlementId
principalId
contextId
applicationKey
entitlementKey
status = ACTIVE | SUSPENDED | REVOKED
validFrom
validUntil?      // opzionale
createdAt
updatedAt
```

Vincoli:

- provisioning manuale nel pilot;
- nessuna derivazione da email/dominio;
- nessun permesso fine di prodotto;
- revoca verificabile server-side;
- `GOVERNANCE_OPERATOR` non abilita da solo operazioni privilegiate Control Center.

### 7.5 `AccessSession`

Campi concettuali:

```text
sessionDigest
principalId
contextId
createdAt
absoluteExpiresAt
revokedAt?
authMethod = EMAIL_OTP
lastEntitlementCheckAt
```

Il datastore non conserva il session secret in chiaro.

### 7.6 Dati esclusi

Il datastore Access non contiene:

- lezioni;
- curricolo di istituto;
- materiali;
- classi o gruppi didattici;
- assegnazioni learner;
- workspace di prodotto;
- draft Studio Atlas;
- dati learner;
- permessi fini dei prodotti;
- token provider persistiti come dati di dominio.

## 8. Application Registry e launcher

### 8.1 Separazione fra entitlement e routing

L'entitlement dice **quale applicazione/modalità è assegnata al Principal**.

L'Application Registry dice **se e come quella applicazione è tecnicamente federata**.

I due concetti non devono essere mescolati.

Campi concettuali del registro:

```text
applicationKey
displayName
surfaceType
federationState = NOT_FEDERATED | FEDERATION_QUALIFIED | SUSPENDED
launchTarget?    // assente finché non qualificato
```

Gli URL di destinazione non vengono salvati negli entitlement utente.

### 8.2 LauncherService

Il launcher viene costruito server-side come intersezione di:

```text
Principal ACTIVE
∩ InstitutionalContext ACTIVE
∩ ApplicationEntitlement ACTIVE
∩ ApplicationRegistry
```

Il frontend riceve un view-model già autorizzato, per esempio:

```text
applicationKey
displayName
availability
launchAllowed
```

### 8.3 Comportamento Phase 2

In Phase 2 tutte le applicazioni prodotto non ancora federate restano:

```text
entitlement = ACTIVE
federationState = NOT_FEDERATED
→ card visibile
→ launchAllowed = false
→ stato UI: “Connessione non ancora disponibile”
```

Non si inseriscono URL temporanei, login locali dei prodotti o deep link di comodo.

Un Principal valido con **zero entitlement** può autenticarsi e vedere un launcher vuoto/sicuro. Questo preserva la separazione fra autenticazione e autorizzazione.

## 9. Flusso OTP

### 9.1 Richiesta codice

```text
utente inserisce email
        ↓
normalizzazione controllata
        ↓
verifica server-side LoginAlias/pilot allowlist
        ↓
se ammesso: requestEmailOtp(...), auto-signup disabilitato
se non ammesso: nessun privilegio; risposta UI neutra
        ↓
stesso messaggio pubblico non enumerativo
```

La UI non deve rivelare se un indirizzo è presente nell'allowlist.

### 9.2 Verifica codice

L'utente inserisce l'OTP nella stessa superficie TRAMA Access.

Il server invoca il provider tramite adapter e ottiene una identità esterna verificata:

```text
VerifiedExternalIdentity
- issuer
- subject
- verifiedEmail?   // informativo/consistency check, non authority key
```

Il runtime risolve poi esclusivamente il binding governato:

```text
exact issuer + subject
        ↓
LoginAlias pre-provisionato
        ↓
Principal pre-provisionato
        ↓
Principal ACTIVE?
        ↓
InstitutionalContext ACTIVE e unico?
        ↓
create AccessSession
        ↓
load current entitlements
        ↓
launcher
```

### 9.3 Nessun auto-provisioning

Un OTP valido **non** può:

- creare un Principal;
- creare un nuovo LoginAlias;
- creare un contesto;
- assegnare entitlement;
- collegare automaticamente un nuovo `issuer + subject` a un Principal esistente.

Se il subject verificato non è già governato, il flusso termina in fail-closed.

### 9.4 OTP e dati temporanei

TRAMA Access non conserva il codice OTP nel proprio registro identitario.

Generazione, invio e verifica del codice sono responsabilità del provider. Access conserva solo eventuale stato tecnico temporaneo strettamente necessario, con TTL breve e senza privilegi.

## 10. AuthProviderAdapter

Il dominio TRAMA non deve distribuire chiamate Supabase in tutta l'applicazione.

Interfaccia concettuale:

```text
requestEmailOtp(email)
verifyEmailOtp(challenge, code) -> VerifiedExternalIdentity
bestEffortProviderLogout?(providerSessionRef)
```

La forma concreta può variare in implementazione, ma l'adapter deve garantire che:

- nessuna semantica proprietaria diventi parte del dominio;
- il risultato di verifica contenga una identità stabile verificabile;
- errori provider vengano tradotti in errori applicativi governati;
- token provider non vengano inoltrati ai prodotti;
- la sostituzione del provider non richieda di riscrivere Principal, contesti, entitlement o launcher.

## 11. Sessione Access

### 11.1 Modello

Dopo OTP valido, subject governato, Principal attivo e contesto valido, Access crea una sessione applicativa propria.

Il browser conserva solo un secret opaco ad alta entropia, preferibilmente almeno 256 bit.

Il cookie deve essere:

- `HttpOnly`;
- `Secure`;
- `SameSite=Lax`;
- scoped solo all'host/path Access;
- privo di `Domain` ecosistemico ampio;
- con durata coerente con la scadenza assoluta.

Se tecnicamente compatibile con il deployment, usare prefisso cookie `__Host-`.

Il server conserva solo un digest sicuro del secret o costruzione equivalente, non il secret in chiaro.

### 11.2 Durata

La sessione ha TTL assoluto massimo di **8 ore**.

Non è sliding: attività e refresh UI non prolungano la scadenza oltre `absoluteExpiresAt`.

Alla scadenza è richiesta nuova autenticazione OTP.

### 11.3 Validazione

Una sessione viene rifiutata quando:

- è scaduta;
- è stata revocata;
- il Principal non è più `ACTIVE`;
- il contesto non è più `ACTIVE`;
- il binding richiesto non è più valido;
- una operazione richiede un entitlement non più `ACTIVE`.

Gli entitlement vengono ricontrollati almeno al caricamento del launcher e **prima di ogni launch**.

### 11.4 Logout

Logout locale TRAMA Access è obbligatorio e immediato:

1. revoca la `AccessSession` server-side;
2. elimina il cookie;
3. rende inutilizzabile la stessa credenziale di sessione;
4. ritorna alla superficie signed-out.

Logout globale/provider resta **best-effort** quando realmente disponibile. La UI non dichiara “disconnesso ovunque” senza prova.

## 12. Sicurezza applicativa

### 12.1 Invarianti

Sono requisiti testabili:

1. nessun Principal viene creato automaticamente da un OTP;
2. nessun entitlement deriva dall'email o dal dominio;
3. un alias attivo non può appartenere a due Principal attivi;
4. una coppia `issuer + subject` non può mappare due Principal;
5. una sessione non supera 8 ore;
6. logout/revoca rende inutilizzabile immediatamente la sessione Access;
7. una card compare solo da entitlement valido;
8. entitlement attivo non implica federazione reale;
9. un'app non federata non è lanciabile;
10. Access non conserva dati di prodotto o learner;
11. OTP, bearer token e secret di sessione non compaiono negli URL;
12. nessun token cross-product vive in `localStorage`;
13. il Gateway resta non autorevole;
14. login professionale ordinario non concede privilegi di governance.

### 12.2 Rate limiting e anti-abuso

Il runtime deve applicare limiti governati a:

- richiesta OTP;
- verifica OTP;
- tentativi ripetuti su stesso alias/origine;
- eventuali endpoint di sessione sensibili.

La policy concreta viene definita nel piano, ma deve essere testabile e non deve produrre user enumeration.

### 12.3 CSRF e same-origin

Le mutazioni autenticabili/sensibili devono usare protezioni coerenti con Next.js/BFF e con il cookie di sessione, includendo dove necessario:

- verifica `Origin`/same-origin;
- token CSRF dedicato per endpoint che non sono protetti sufficientemente dalla semantica del framework;
- metodi HTTP appropriati;
- nessuna mutazione via GET.

### 12.4 Logging

I log non devono includere:

- OTP;
- token provider;
- session secret;
- cookie raw;
- email completa quando non necessaria;
- dati di prodotto/learner.

Eventi audit minimi possono includere identificatori opachi, outcome e timestamp necessari a diagnosi/governance.

## 13. Failure model fail-closed

### 13.1 Provider indisponibile prima del login

- nessuna sessione Access;
- stato UI temporaneo e non tecnico;
- nessuna fallback identity locale;
- superfici pubbliche indipendenti restano operative.

### 13.2 Email non ammessa

- risposta pubblica neutra;
- nessuna creazione account;
- nessuna indicazione che riveli l'allowlist.

### 13.3 OTP errato o scaduto

- nessuna sessione;
- retry entro limiti governati;
- nessun dettaglio interno provider.

### 13.4 Subject verificato ma non governato

- fail-closed;
- nessun auto-link tramite email;
- nessun auto-provisioning.

### 13.5 Principal sospeso/disabilitato

- nessuna nuova sessione;
- sessione esistente rifiutata alla successiva validazione server-side.

### 13.6 Contesto invalido o ambiguo

- nessuna sessione utilizzabile;
- nel pilot esattamente un contesto attivo è requisito di ingresso.

### 13.7 Zero entitlement

- login valido;
- launcher vuoto/sicuro;
- nessun link di fallback.

### 13.8 Entitlement revocato

- rimosso/disabilitato alla successiva lettura server-side;
- launch negato;
- nessuna necessità di inventare logout globale.

### 13.9 Application Registry incoerente

- launch negato;
- nessun URL “di comodo”;
- errore operativo registrabile senza leak.

### 13.10 Provider indisponibile dopo login

Una sessione Access già valida può continuare solo entro la policy locale e senza acquisire nuovi privilegi.

Nessuna escalation o rinnovo viene simulato.

## 14. Stati UI minimi

La superficie Phase 2 deve coprire almeno:

- `SIGNED_OUT`;
- `OTP_REQUESTED`;
- `OTP_VERIFY`;
- `AUTHENTICATED`;
- `NO_ENTITLEMENTS`;
- `ENTITLEMENTS_AVAILABLE_NOT_FEDERATED`;
- `ACCESS_DENIED`;
- `PROVIDER_UNAVAILABLE`;
- `SESSION_EXPIRED`;
- `SIGNED_OUT_AFTER_LOGOUT`.

Il launcher resta leggero. Non vengono introdotti profilo, impostazioni complesse, feed o dashboard.

Gli errori non mostrano stack trace, token, subject provider, dettagli infrastrutturali o segnali utili a enumerare utenti.

## 15. Confini con le altre superfici

Durante Phase 2:

- **Gateway:** nessuna modifica di routing obbligatoria; non legge cookie Access e non incorpora Auth SDK;
- **Docente OS:** nessuna sessione Access ricevuta;
- **Arena:** nessuna sessione Access ricevuta;
- **Studio Atlas:** nessuna sessione Access ricevuta;
- **Curricolo Atlas pubblico:** resta pubblico e indipendente;
- **Atlas learner:** resta fuori dal piano professionale;
- **Control Center pubblico:** resta pubblico;
- **Control Center privilegiato:** nessuna nuova capacità;
- **DOS-A1:** resta `RUNTIME_DEFERRED`.

Phase 3 è il primo punto autorizzato a introdurre federazione reale verso Docente OS.

## 16. Provider candidato — gate separato

Supabase Auth resta **candidato primario**, non runtime autorizzato da questa specifica.

Prima di creare o qualificare il progetto provider devono essere verificati e documentati:

1. discovery/JWKS e identificatori `issuer/subject` stabili;
2. capacità di pre-provisionare l'identità pilot con subject noto prima del primo login;
3. OTP email con self-signup/auto-provisioning disabilitato;
4. redirect URI esatte e separate per ambiente;
5. authorization code + PKCE `S256` per le relying application future, senza downgrade silenzioso a `plain`;
6. ID token verificabile per issuer/audience/nonce quando usato;
7. MFA/AAL2 disponibile per future superfici privilegiate senza trasformare il login ordinario in governance authority;
8. semantica sessione/logout compatibile con la policy locale TRAMA;
9. regione UE selezionata e verificata esplicitamente;
10. progetto dedicato e separato dai database Docente OS, Arena, Studio Atlas, Curricolo Atlas, Materiali e learner;
11. adapter TRAMA che usa solo il minimo necessario e non espone tabelle interne provider al dominio;
12. costi, limiti e quote noti prima della creazione.

**La creazione effettiva del progetto, la scelta organizzazione/regione e qualsiasi costo richiedono autorizzazione esplicita separata.**

Se uno dei gate non è dimostrabile senza cambiare il contratto TRAMA, la scelta provider torna a decisione. Il contratto non viene piegato al provider.

## 17. Test obbligatori

### 17.1 Domain/contract tests

Copertura minima:

- alias ammesso + subject prebound + Principal attivo + contesto valido → candidato a sessione;
- alias ammesso ma subject differente → fail-closed;
- alias assente → fail-closed con risposta pubblica neutra;
- Principal sospeso/disabilitato → fail-closed;
- zero contesti attivi → fail-closed;
- più di un contesto attivo nel pilot → fail-closed;
- zero entitlement → sessione valida, launcher vuoto;
- entitlement attivo + app non federata → card visibile, launch negato;
- entitlement revocato → launch negato;
- sessione oltre 8 ore → rifiutata;
- logout → sessione precedente inutilizzabile;
- nessun auto-provisioning;
- nessuna derivazione permission da email/dominio.

### 17.2 Adapter contract tests

Con fake/deterministic provider:

- richiesta OTP riuscita;
- OTP corretto;
- OTP errato;
- OTP scaduto;
- timeout/provider unavailable;
- risposta provider malformata;
- issuer inatteso;
- subject non governato;
- mismatch email informativa vs alias pre-provisionato.

### 17.3 Integration tests

Devono dimostrare:

```text
OTP verified
→ exact issuer+subject
→ LoginAlias
→ Principal
→ InstitutionalContext
→ AccessSession
→ Entitlements
→ Launcher
```

Inoltre:

- cookie opaco e flags corretti;
- revoca sessione;
- revalidation entitlement;
- failure provider senza sessione parziale;
- CSRF/same-origin sui flussi sensibili;
- nessun secret nei log/URL.

### 17.4 Browser/E2E

Almeno:

- login responsive;
- richiesta OTP;
- inserimento OTP;
- launcher con entitlement;
- launcher zero-entitlement;
- app non federata disabilitata;
- session expired;
- access denied;
- provider unavailable;
- logout;
- nessuna navigazione verso prodotti non federati.

### 17.5 Live-provider smoke

Dopo autorizzazione esplicita del provider, almeno un test pilot controllato deve dimostrare:

- subject stabile pre-provisionato;
- OTP reale;
- mapping esatto al Principal corretto;
- sessione Access locale;
- logout locale.

Credenziali/OTP reali non entrano nei log o negli artefatti CI.

## 18. TDD e ordine di implementazione

L'implementazione deve seguire TDD RED → GREEN, task per task.

Ordine concettuale raccomandato per il futuro piano:

1. domain types e invarianti;
2. repository ports + fake in-memory;
3. Principal/LoginAlias resolution;
4. context/entitlement resolution;
5. session store + cookie policy;
6. Application Registry + LauncherService;
7. AuthProviderAdapter contract + fake;
8. route handlers/BFF;
9. UI states;
10. provider adapter concreto solo dopo provider gate/autorizzazione;
11. Browser Certification;
12. evidence/state map/receipt.

Questa sezione non è il piano di implementazione. Il piano viene scritto solo dopo l'approvazione umana della presente specifica.

## 19. Evidenze e Governance

La chiusura Phase 2 richiede almeno:

- test automatici exact-head;
- validator/contract checks applicabili;
- threat model aggiornato per OTP, alias, sessione, provider outage e revoca;
- Browser Certification;
- accessibility gate coerente con la governance del repository;
- evidence su cookie/session/logout;
- evidence provider gate se il provider reale viene qualificato;
- state map machine-readable aggiornata solo dopo le prove;
- receipt exact-head;
- Human Review della nuova superficie Access.

Nessun nodo o flusso viene promosso a `REAL` per deduzione.

## 20. State map — delta atteso

La baseline attuale contiene:

```text
trama_access.state = DESIGNED
professional_identity.runtimeState = NOT_IMPLEMENTED
```

Se e solo se tutti gli exit gate Phase 2 sono dimostrati da evidenze exact-head e live-provider pilot, il delta può promuovere il nodo `trama_access` secondo la semantica della state map vigente e aggiornare `professional_identity.runtimeState` a uno stato pilot implementato.

Restano invariati/non promossi per la sola Phase 2:

- `gateway_to_trama_access`;
- federazione Docente OS;
- federazione Arena;
- federazione Studio Atlas;
- modalità professionale Curricolo Atlas;
- Control Center privilegiato;
- learner identity.

La terminologia concreta del nuovo `runtimeState` deve rispettare il validator/state schema vigente al momento della chiusura; non si introducono enum arbitrari solo per il receipt.

## 21. Exit gate Phase 2

Phase 2 è qualificabile soltanto quando:

1. un Principal di test è pre-provisionato;
2. il LoginAlias/allowlist è pre-provisionato;
3. il binding `issuer + subject` è pre-provisionato e verificato;
4. l'OTP email reale funziona senza self-signup;
5. il Principal corretto viene risolto esclusivamente dal binding governato;
6. esiste esattamente un contesto attivo nel pilot;
7. la sessione Access è server-side, opaca e ≤ 8 ore;
8. il launcher mostra esattamente gli entitlement attivi;
9. le app non federate sono visibili ma non navigabili;
10. entitlement revocato non può essere lanciato;
11. logout locale invalida immediatamente la sessione;
12. provider outage e casi negativi principali falliscono chiusi;
13. nessun dato di prodotto o learner è entrato nel datastore Access;
14. nessun token/OTP/session secret è esposto in URL o `localStorage`;
15. i test exact-head sono PASS;
16. Browser Certification e Human Review sono PASS;
17. state map e receipt descrivono solo ciò che è realmente provato.

## 22. Gate successivi

L'approvazione di questa specifica **non** autorizza:

- scrittura del runtime;
- creazione del progetto Supabase;
- costi;
- deploy;
- configurazione Gateway;
- federazione dei prodotti;
- merge.

Dopo la review umana di questo documento, il passo successivo canonico è scrivere e far revisionare il **piano di implementazione Phase 2**. Solo dopo l'approvazione del piano e la scelta esplicita della modalità di esecuzione può iniziare l'implementazione.
