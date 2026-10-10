# ACCESS-01 Phase 2 — TRAMA Access Runtime Design

**Status:** REVIEW_REQUIRED  
**Data:** 2026-10-10  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline:** `main@e007a5e6f425eac5b0a7a757a4807a500f987924`  
**Roadmap:** ACCESS-01 Phase 2 — TRAMA Access runtime minimo  
**Precedenza:** `TRAMA-PROFESSIONAL-IDENTITY-01` e ACCESS-01 ecosystem access architecture

## 1. Scopo

Questa specifica definisce il runtime minimo di **TRAMA Access** per ACCESS-01 Phase 2.

L'obiettivo è rendere reale il solo piano di ingresso professionale mancante senza anticipare la federazione con Docente OS, Arena, Studio Atlas, Curricolo Atlas o Control Center. La Phase 2 deve dimostrare un flusso reale di autenticazione professionale, risoluzione del principal TRAMA, gestione di contesto ed entitlement coarse-grained, sessione locale Access, launcher e failure model fail-closed.

La fase mantiene il vincolo **zero-cost**: nessun piano a pagamento, add-on o spesa è autorizzato. Qualsiasi presupposto di free tier viene ricontrollato immediatamente prima del provisioning. Se il runtime non può essere qualificato entro le risorse gratuite disponibili, la fase si ferma e non adotta workaround che cambino il confine approvato.

## 2. Risultato atteso

A chiusura Phase 2, almeno un principal professionale di test reale deve poter:

1. avviare un login passwordless via email OTP/Magic Link;
2. completare l'autenticazione contro un provider dedicato a TRAMA Access;
3. essere risolto esclusivamente dalla coppia verificata `(issuer, subject)`;
4. ottenere un `principalId` TRAMA opaco e stabile;
5. aprire una sessione locale TRAMA Access con scadenza governata;
6. vedere un launcher composto solo dagli entitlement attivi assegnati;
7. perdere immediatamente un entitlement revocato;
8. eseguire logout locale indipendentemente dalla disponibilità del provider;
9. fallire chiuso negli stati di provider non disponibile, callback invalida, principal non autorizzato o sessione scaduta.

La fase non deve rendere reale alcuna federazione verso un prodotto.

## 3. Vincoli canonici ereditati da Phase 1

Phase 2 implementa, senza ridefinirli, i seguenti vincoli:

- l'identità autorevole deriva da **issuer + subject** verificati;
- email e metadati mutabili non sono authority key;
- il `principalId` TRAMA è opaco e non deve coincidere con gli UUID locali dei prodotti;
- `InstitutionalContext` ammette solo `PERSONAL` e `INSTITUTION`;
- `INSTITUTION` usa `institutionRef` opaco e non concede permessi di prodotto;
- gli entitlement centrali sono solo application-entry/application-mode;
- i permessi fini restano nei prodotti;
- `GOVERNANCE_OPERATOR` non autorizza operazioni sensibili senza step-up/MFA dedicato;
- nessun bearer token, JWT privilegiato o session secret compare in URL applicativi;
- nessun token cross-product viene condiviso via `localStorage`;
- il provider non diventa authority sul curricolo, lezioni, materiali, draft Studio Atlas o learner;
- nessuna identità learner viene introdotta nel piano professionale;
- logout locale e failure model devono restare sicuri anche durante outage del provider.

## 4. Decisioni Phase 2

### 4.1 Provider candidato

Il provider primario per Phase 2 è **Supabase Auth in un progetto dedicato esclusivamente a TRAMA Access**.

La scelta è implementativa e non altera il contratto provider-neutral. Keycloak resta opzione di portabilità/uscita e non viene eseguito in parallelo in questa fase.

Il server OAuth 2.1/OIDC di Supabase non è dipendenza necessaria della Phase 2. La federazione standard verso i prodotti viene qualificata separatamente a partire dalla Phase 3.

### 4.2 Metodo di autenticazione

Il pilot usa **email OTP/Magic Link passwordless**.

Non sono introdotti in Phase 2:

- password locali;
- Google/Microsoft/social login;
- identity linking automatico fra provider;
- federazione con directory istituzionali;
- account learner.

L'email è un dato di bootstrap dell'autenticazione e non diventa chiave autorevole di identity linking o autorizzazione.

### 4.3 Pilot chiuso

Phase 2 non espone una registrazione pubblica.

L'auto-signup deve essere disabilitato. Un utente può diventare principal TRAMA solo se il pilot lo considera preventivamente autorizzato secondo il flusso definito nel piano di implementazione.

La risposta UI alla richiesta di login deve essere neutra e non deve rivelare se un indirizzo appartiene o meno al pilot.

## 5. Trust boundaries

### 5.1 Supabase Auth

Responsabilità:

- autenticare il professionista via passwordless;
- produrre una identità verificabile;
- gestire il proprio lifecycle di autenticazione.

Non possiede:

- principal TRAMA canonici;
- entitlement TRAMA;
- dati applicativi dei prodotti;
- ruoli fini di Docente OS, Arena, Studio Atlas, Curricolo Atlas o Control Center;
- dati learner.

### 5.2 TRAMA Access Runtime

Responsabilità:

- consumare una prova di autenticazione verificata;
- risolvere `(issuer, subject)` nel principal TRAMA;
- applicare il lifecycle del principal;
- risolvere contesto ed entitlement;
- creare e revocare la sessione locale Access;
- comporre il launcher;
- applicare il failure model.

TRAMA Access non è una dashboard generale dell'ecosistema e non assume authority dei prodotti.

### 5.3 TRAMA Access Store

Contiene solo dati necessari al piano identitario Phase 2.

Sono esclusi in modo esplicito:

- lezioni;
- curricolo di istituto;
- materiali;
- classi o gruppi didattici;
- workspace di prodotto;
- draft Studio Atlas;
- dati learner;
- permessi fini dei prodotti;
- token provider persistiti come record applicativi.

### 5.4 Launcher

Il launcher è una proiezione degli entitlement attivi, non una authority autonoma.

Una destinazione può apparire come disponibile solo se esiste una coppia canonica application/entitlement attiva. In Phase 2 le destinazioni prodotto non diventano navigazioni federate reali: il launcher deve rappresentarle con uno stato esplicito non ingannevole, equivalente a **"disponibile dalla fase di federazione"**.

Fixture o harness controllati possono essere usati nei test, ma non vengono sostituiti con URL temporanei dei prodotti.

### 5.5 Prodotti e Gateway

Restano fuori dal trust boundary Phase 2:

- TRAMA Gateway;
- Docente OS;
- Arena;
- Curricolo Atlas;
- Studio Atlas;
- Atlas learner;
- Control Center.

Il Gateway resta pubblico e non viene ancora configurato verso TRAMA Access. Nessun prodotto riceve token o sessioni TRAMA Access in questa fase.

## 6. Modello dati minimo

Il modello logico contiene quattro sole entità Phase 2.

### 6.1 `professional_principal`

Campi concettuali:

- `principal_id` — identificatore TRAMA opaco, generato server-side;
- `issuer` — issuer esatto verificato;
- `subject` — subject esatto verificato;
- `status` — almeno `ACTIVE` o `DISABLED`;
- timestamp tecnici necessari al lifecycle.

Vincoli:

- unique `(issuer, subject)`;
- nessuna unique key basata su email;
- nessun linking automatico su nome, email, dominio o metadati mutabili.

### 6.2 `principal_context`

Campi concettuali:

- `principal_id`;
- `context_type` = `PERSONAL | INSTITUTION`;
- `institution_ref` nullable per `PERSONAL`, obbligatorio per `INSTITUTION`;
- stato/lifecycle se necessario.

`institution_ref` è opaco. Non si deduce da email, dominio o nome dell'istituto.

### 6.3 `principal_entitlement`

Contiene solo una delle coppie canoniche:

- `DOCENTE_OS / USE`;
- `CURRICOLO_ATLAS / READ`;
- `STUDIO_ATLAS / AUTHOR`;
- `ARENA / ENTER`;
- `CONTROL_CENTER / GOVERNANCE_OPERATOR`.

Campi concettuali:

- `principal_id`;
- `application`;
- `entitlement`;
- `status` = almeno `ACTIVE | REVOKED`;
- timestamp tecnici.

Non contiene permessi fini, RLS, membership workspace o diritti di pubblicazione/modifica.

### 6.4 `access_session`

Campi concettuali:

- digest del session secret;
- `principal_id`;
- `issued_at`;
- `expires_at`;
- `revoked_at` nullable;
- timestamp tecnico di ultima verifica server-side se necessario.

Il datastore conserva solo il digest del segreto di sessione, mai il segreto in chiaro.

### 6.5 Entità non introdotte in Phase 2

Il mapping `(principalId, application) -> localSubjectRef` non viene ancora materializzato: appartiene alla federazione prodotto, a partire dalla Phase 3.

## 7. Lifecycle del principal

### 7.1 Risoluzione

Dopo autenticazione valida:

```text
verified provider identity
        ↓
exact (issuer, subject)
        ↓
professional_principal
        ↓
principalId TRAMA
```

Se `(issuer, subject)` corrisponde a un principal `ACTIVE`, il principal viene riutilizzato.

Se non esiste, può essere creato solo attraverso il pilot pre-autorizzato. Se il soggetto non è autorizzato, il flusso termina in `ACCESS_DENIED`.

### 7.2 Linking

Se in futuro la stessa persona compare con un altro issuer o subject, TRAMA considera la nuova coppia un principal distinto finché una procedura governata successiva non autorizzi esplicitamente il linking.

Non esiste linking automatico per email.

### 7.3 Disabilitazione

`principal.status = DISABLED`:

- impedisce nuove sessioni;
- rende invalide le sessioni esistenti alla successiva verifica server-side;
- non viene aggirato da una sessione client-side stale.

## 8. Lifecycle degli entitlement

Gli entitlement vengono letti server-side al caricamento del launcher e prima di qualunque operazione che dipenda dal loro stato.

`entitlement.status = REVOKED` rimuove immediatamente l'applicazione dal launcher. La sessione Access può restare valida, ma non conserva uno snapshot privilegiato precedente.

Nuovi entitlement o escalation non vengono concessi durante un outage del provider senza una revalidation valida secondo il contratto Phase 1.

## 9. Sessione TRAMA Access

### 9.1 Separazione provider/sessione

La prova di autenticazione del provider serve a stabilire l'identità. TRAMA Access crea poi una sessione applicativa propria.

I token Supabase:

- non sono salvati come sessioni applicative TRAMA;
- non vengono inoltrati ai prodotti;
- non vengono inseriti in URL;
- non vengono conservati in `localStorage` condiviso.

### 9.2 Session secret

La sessione usa un segreto casuale di almeno 256 bit.

Il browser riceve il segreto soltanto in cookie:

- `HttpOnly`;
- `Secure`;
- `SameSite=Lax`;
- scoped al runtime Access.

Il datastore conserva `SHA-256(secret)` o costruzione crittografica equivalente definita nel piano e coperta da test.

### 9.3 Durata

Phase 2 usa un TTL assoluto massimo di **8 ore**, non sliding.

Alla scadenza è richiesta una nuova autenticazione passwordless.

### 9.4 Logout

Logout locale:

- revoca immediatamente la sessione TRAMA Access;
- funziona anche se Supabase Auth è indisponibile;
- non dichiara un logout globale cross-product inesistente.

Un logout coordinato o globale resta fuori scope finché i prodotti non sono federati e il comportamento non è dimostrato.

## 10. Flusso di autenticazione

### 10.1 `SIGNED_OUT`

TRAMA Access mostra la superficie minima di accesso professionale e una sola azione di autenticazione passwordless.

### 10.2 Richiesta Magic Link/OTP

L'utente inserisce l'email. Il runtime invoca il provider con auto-signup disabilitato.

La UI restituisce un messaggio neutro anche quando l'indirizzo non è ammesso al pilot.

### 10.3 Callback

La callback deve verificare quanto richiesto dal profilo passwordless/PKCE adottato e rifiutare callback non valide.

Dopo la verifica provider:

```text
issuer + subject
   ↓
principal resolution
   ↓
principal ACTIVE?
   ↓
create Access session
   ↓
load current entitlements
   ↓
launcher
```

### 10.4 Esiti

- principal noto e attivo → `AUTHENTICATED`;
- principal nuovo ma pilot-pre-authorized → creazione governata e `AUTHENTICATED`;
- principal non autorizzato → `ACCESS_DENIED`;
- principal disabilitato → `ACCESS_DENIED`;
- callback/PKCE/state/verifica provider invalida → `FAIL_CLOSED`;
- provider indisponibile per nuovo login → `PROVIDER_UNAVAILABLE` / fail-closed.

## 11. Stati UI canonici

La Browser Certification deve coprire almeno:

- `SIGNED_OUT`;
- `MAGIC_LINK_SENT`;
- `AUTH_CALLBACK_PROCESSING`;
- `AUTHENTICATED`;
- `NO_ENTITLEMENTS`;
- `ENTITLEMENTS_AVAILABLE`;
- `ACCESS_DENIED`;
- `PROVIDER_UNAVAILABLE`;
- `SESSION_EXPIRED`.

Gli errori non devono esporre token, stack trace, dettagli del provider o informazioni che permettano user enumeration.

## 12. Failure model

### 12.1 Nuovo login con provider indisponibile

Fallisce chiuso. Non viene creata alcuna sessione Access.

### 12.2 Sessione Access già valida

Può continuare solo entro il TTL assoluto locale e senza acquisire nuovi privilegi.

### 12.3 Provider verification non disponibile

Una nuova autenticazione o una nuova escalation fallisce chiusa.

### 12.4 Entitlement revocato

La revoca ha effetto alla successiva risoluzione server-side e non richiede logout globale.

### 12.5 Principal disabilitato

La sessione non deve continuare a essere considerata valida dopo la successiva verifica server-side.

### 12.6 Superfici pubbliche

Un outage TRAMA Access/Supabase non deve abbattere:

- TRAMA Gateway;
- Curricolo Atlas pubblico;
- Control Center pubblico.

## 13. Deployment zero-cost

### 13.1 Preflight obbligatorio

Prima del provisioning, il piano di implementazione deve verificare:

1. disponibilità di un progetto Supabase Free senza upgrade;
2. disponibilità di un runtime Render Free compatibile con il pilot;
3. assenza di add-on o servizi a pagamento obbligatori;
4. compatibilità del canale email gratuito con il principal di test;
5. mantenimento di tutte le restrizioni del presente design.

Se una condizione fallisce, provisioning e implementazione live si fermano e richiedono una nuova decisione.

### 13.2 Supabase

Uso consentito in Phase 2:

- Auth passwordless;
- Postgres per le quattro entità Access;
- primitive strettamente necessarie alla sicurezza del runtime.

Non vengono aggiunti Storage, Realtime o altre capacità salvo necessità dimostrata e nuova valutazione di perimetro.

Il progetto è dedicato a TRAMA Access e non viene riutilizzato come database dei prodotti.

### 13.3 Email del pilot

Il design non autorizza l'introduzione automatica di un servizio SMTP esterno.

Se il provider email gratuito disponibile al momento del provisioning consente il pilot soltanto verso indirizzi appartenenti all'organizzazione del progetto, il principal di prova reale deve usare un indirizzo compatibile. Se ciò non è possibile, la prova live si ferma e viene richiesta una decisione separata.

### 13.4 Render

Il runtime pilot può essere ospitato come singolo web service zero-cost su Render, con UI e backend same-origin.

Vincoli:

- nessun Render Postgres;
- filesystem locale trattato come effimero;
- persistenza esclusivamente nello store Access previsto;
- sleep/cold-start del free tier accettati per il pilot;
- la raggiungibilità del pilot non equivale a readiness production del Gateway.

## 14. Controlli di sicurezza

### 14.1 Segreti

- service-role key e credenziali privilegiate restano server-side;
- nessun secret viene committato;
- nessun secret viene inviato al browser;
- nessun secret compare nei log applicativi.

### 14.2 Accesso alle tabelle

Il browser non accede direttamente alle tabelle Access.

Le policy datastore devono essere fail-closed per client `anon/authenticated` e il backend è il percorso applicativo autorizzato.

### 14.3 Redirect

- callback e redirect URI in allowlist esatta;
- nessuna wildcard;
- nessun redirect arbitrario controllato dall'utente.

### 14.4 CSRF/session fixation

Le operazioni mutative richiedono protezioni coerenti con cookie same-origin, inclusa verifica `Origin` e meccanismo CSRF dove necessario.

Una nuova autenticazione non deve riutilizzare una sessione preesistente controllabile dall'attaccante.

### 14.5 Logging

È vietato loggare:

- Magic Link/OTP;
- access token/refresh token;
- session secret;
- cookie;
- credenziali privilegiate;
- URL contenenti materiale di autenticazione.

I log possono contenere identificatori tecnici non sensibili necessari alla diagnosi, senza trasformare email o metadati mutabili in authority key.

## 15. Test e certificazione

### 15.1 Unit/contract tests

Devono provare almeno:

- exact `(issuer, subject)` resolution;
- creazione/reuse del `principalId`;
- rifiuto del linking per email;
- lifecycle `ACTIVE/DISABLED`;
- context `PERSONAL/INSTITUTION`;
- validazione delle sole coppie entitlement canoniche;
- revoca entitlement;
- hashing/session lookup;
- TTL assoluto;
- logout locale;
- failure modes.

### 15.2 Adversarial tests

Devono coprire almeno:

- email-as-authority;
- issuer o subject manipolati;
- callback/provider assertion invalida;
- token scaduto o non verificabile;
- redirect non allowlisted;
- session fixation;
- session secret in URL/localStorage;
- accesso diretto browser alle tabelle;
- entitlement stale dopo revoca;
- principal disabilitato con sessione ancora presente;
- user enumeration via messaggi login;
- privilege change durante provider outage;
- dati di prodotto o learner inseriti impropriamente nello store Access.

### 15.3 Browser Certification

Deve certificare gli stati UI canonici e almeno:

- login request;
- callback success/failure;
- zero entitlement;
- entitlement disponibili;
- revoca durante sessione;
- expiry;
- logout;
- provider unavailable.

### 15.4 Live pilot proof

Almeno una prova reale deve dimostrare:

```text
passwordless real provider
→ verified issuer + subject
→ principalId TRAMA
→ Access session
→ governed entitlement launcher
→ entitlement revocation
→ local logout
```

La prova live è separata dalla CI deterministica. La CI può usare provider doubles/harness per i test riproducibili, ma non sostituisce la prova reale di chiusura fase.

## 16. Human Review

È richiesta Human Review perché Phase 2 introduce una nuova esperienza professionale osservabile.

La review deve valutare almeno:

- chiarezza dello stato non autenticato;
- assenza di linguaggio tecnico del provider nell'UX ordinaria;
- messaggio neutro dopo richiesta email;
- leggibilità degli stati `ACCESS_DENIED`, `PROVIDER_UNAVAILABLE`, `SESSION_EXPIRED`;
- launcher non ingannevole rispetto alle integrazioni ancora non reali;
- logout facilmente individuabile;
- coerenza visuale con l'identità TRAMA senza trasformare Access in una dashboard complessa.

La Human Review non può promuovere un flow prodotto a `REAL` in assenza di prova tecnica end-to-end.

## 17. State map delta consentito

Solo dopo il pacchetto completo di evidenze Phase 2:

### `trama_access`

Può passare da `DESIGNED` a `REAL` esclusivamente nel boundary:

> runtime Access pilot reale con autenticazione, principal, sessione, entitlement, launcher e failure model dimostrati.

Il nodo `REAL` non implica alcuna federazione prodotto.

### `professional_identity`

Può passare da `DESIGNED` a `PARTIAL`, con uno `runtimeState` esplicito equivalente a:

`ACCESS_RUNTIME_REAL_PRODUCT_FEDERATION_NOT_IMPLEMENTED`

La formulazione finale deve essere validata dalla governance state-map esistente e non introdotta se incompatibile con i validator correnti.

### Flow che restano `DESIGNED`

Restano non promossi:

- `gateway_to_trama_access`;
- `trama_access_to_docente_os`;
- `trama_access_to_studio_atlas`;
- `trama_access_to_curricolo_atlas_professional`;
- `trama_access_to_arena`;
- `trama_access_to_control_center_privileged`.

## 18. Out of scope

Phase 2 non autorizza:

- cutover del Gateway;
- federazione Docente OS;
- federazione Studio Atlas;
- modalità professionale Curricolo Atlas;
- federazione Arena;
- Control Center privilegiato operativo;
- OAuth/OIDC relying-party nei prodotti;
- mapping `localSubjectRef`;
- global logout cross-product;
- social login;
- SMTP a pagamento;
- identity linking automatico;
- account learner;
- migrazione utenti;
- condivisione del database Access con i prodotti;
- inserimento di dati di prodotto nello store Access.

## 19. Exit gate Phase 2

Phase 2 può essere chiusa solo quando sono contemporaneamente vere tutte le condizioni seguenti:

1. progetto provider dedicato zero-cost qualificato;
2. runtime pilot realmente raggiungibile;
3. login passwordless reale completato;
4. exact `(issuer, subject)` risolto in `principalId`;
5. store Access limitato alle entità approvate;
6. sessione locale con TTL e revoca provati;
7. launcher entitlement-driven provato;
8. revoca entitlement provata durante una sessione;
9. logout locale provato anche indipendentemente dal provider;
10. failure model provato;
11. suite unit/contract e adversarial PASS;
12. Browser Certification PASS sull'exact head;
13. Human Review completata;
14. receipt exact-head con state-map delta conservativo;
15. nessuna federazione prodotto dichiarata `REAL`.

## 20. Sequenza di implementazione attesa

Il futuro piano di implementazione deve rispettare almeno questa dipendenza logica:

```text
preflight zero-cost
→ schema/runtime contracts
→ RED tests
→ Access Store
→ principal/context/entitlement domain
→ local session
→ passwordless provider adapter
→ callback/failure model
→ launcher
→ security/adversarial hardening
→ Browser Certification
→ live pilot proof
→ Human Review
→ exact-head evidence
→ state-map delta
```

Il piano può suddividere ulteriormente le attività, ma non può anticipare il provisioning live prima del preflight né promuovere flow prodotto durante Phase 2.

## 21. Decision boundary dopo questa specifica

L'approvazione di questa specifica autorizza la preparazione del piano Phase 2. Non crea automaticamente risorse esterne e non autorizza costi.

La creazione del progetto Supabase dedicato, del servizio pilot Render e delle configurazioni live avviene soltanto durante l'esecuzione del piano approvato e resta subordinata al preflight zero-cost.
