# TRAMA ACCESS-01 Ecosystem Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` or `superpowers:executing-plans` for each active phase. This is the master roadmap; every implementation phase receives its own focused plan before code changes begin.

**Goal:** trasformare i prodotti e le capacità TRAMA già esistenti in un ecosistema coerente con una identità professionale condivisa, accesso learner privacy-first, governance esplicita e user flow cross-product dimostrati da evidenze.

**Architecture:** le autorità dei singoli prodotti restano indipendenti. Nodi e integrazioni sono valutati separatamente: l'esistenza di un prodotto non rende reale il flusso verso un altro prodotto. Ogni fase si chiude solo quando evidenze exact-head provano il confine dichiarato e la state map machine-readable viene aggiornata.

**Spec:** `docs/superpowers/specs/2026-10-10-trama-access-01-ecosystem-access-architecture-design.md`

## Global Constraints

- Nome canonico: **Curricolo Atlas**.
- Una identità professionale TRAMA; autorità di prodotto indipendenti.
- Nessun account personale learner per impostazione predefinita.
- Arena resta autorità sul curricolo di istituto.
- Curricolo Atlas resta consultazione, navigazione e intelligibilità; non è autorità di modifica.
- Studio Atlas resta authoring professionale; Atlas learner resta learner runtime.
- Gateway resta pubblico e non è identity provider.
- Control Center pubblico e Control Center privilegiato restano distinti.
- Materiali e classi/gruppi/assegnazioni sono capacità trasversali, non automaticamente app autonome.
- Nessun bearer token, password, JWT privilegiato o contesto personale sensibile negli URL.
- Nessun merge o deploy automatico senza decisione esplicita applicabile.
- DOS-A1 resta `RUNTIME_DEFERRED` salvo decisione autorizzata separata.

## Review Focus

1. Un nodo `REAL` non deve far sembrare operative integrazioni non dimostrate.
2. La federazione professionale non deve indebolire autorizzazioni locali o RLS.
3. Le assegnazioni learner non devono propagare silenziosamente registri nominali o creare identità learner globali.
4. Curricolo Atlas pubblico/professionale e Control Center pubblico/privilegiato non devono produrre leak di dati o autorità.
5. Logout, scadenza sessione e indisponibilità dell'identity provider devono fallire in sicurezza senza rompere le superfici pubbliche.

---

## Modello operativo: una roadmap, un solo fronte implementativo attivo

In ogni momento:

- al massimo **una fase implementativa** è `ACTIVE`;
- documentazione e review possono preparare la fase successiva, ma il runtime non si sviluppa in parallelo salvo eccezione esplicita;
- ogni fase usa branch/PR dedicati, piano focalizzato, TDD RED→GREEN, certificazione exact-head, Human Review quando necessaria e delta della state map;
- un nodo o un flusso passa a `REAL` solo con evidenza riproducibile;
- i blocker restano associati alla fase e non ridefiniscono silenziosamente il target;
- un difetto estraneo scoperto durante una fase si corregge solo se blocca la fase, altrimenti si registra e si rinvia.

### Pacchetto obbligatorio di chiusura fase

1. artefatto implementativo o documentale;
2. test e certificazione exact-head;
3. evidenza sicurezza/privacy adeguata al confine;
4. Human Review quando cambia l'esperienza utente;
5. aggiornamento di `governance/access/trama-ecosystem-state-v0.2.json` o successore;
6. aggiornamento della mappa visuale solo dopo lo stato machine-readable;
7. receipt breve con ciò che diventa `REAL` e ciò che resta `PARTIAL/DESIGNED/DEFERRED`.

---

# Roadmap

## Phase 0 — Baseline canonica e Gateway pubblico sicuro

**Scopo:** consolidare la baseline persistente e rendere il Gateway pubblico utilizzabile anche quando l'ingresso professionale non è ancora disponibile.

**Deliverable:**
- spec ACCESS-01 pronta per review/integrazione;
- state map machine-readable;
- mappa AS-IS/TARGET e analisi critica;
- landing pubblica visibile senza destinazione professionale fittizia;
- assenza di `VITE_TRAMA_ENTRY_HREF` gestita fail-closed senza blank screen.

**Exit gate:** Gateway pubblico visibile; azioni professionali non navigabili se la destinazione manca; state map ed evidenze allineate al comportamento certificato.

**Delta atteso:** superficie pubblica Gateway `REAL`; `Gateway → TRAMA Access` resta `DESIGNED`.

---

## Phase 1 — Contratto provider-neutral per identità professionale

**Scopo:** definire il confine identitario stabile prima di creare un runtime.

**Deliverable:**
- `Principal`, `InstitutionalContext`, `ApplicationEntitlement`;
- regole OAuth/OIDC per relying application;
- mapping identità TRAMA → identità locale di prodotto;
- semantica sessione/logout/failure;
- threat model per token, redirect, privilegi e outage provider;
- decision record sul provider candidato, senza dati di prodotto nel piano identitario.

**Exit gate:** contratto e threat model approvati; nessun prodotto obbligato a condividere database o schema di autorizzazione.

---

## Phase 2 — TRAMA Access runtime minimo

**Scopo:** costruire solo il layer di ingresso professionale mancante.

**Deliverable:**
- servizio/app TRAMA Access minimale;
- identity provider candidato dietro protocolli standard;
- launcher guidato da entitlement governati;
- stati sicuri per non autenticato e provider indisponibile;
- nessun dato di lezioni, curricolo, materiali, draft Studio Atlas o learner nel datastore Access.

**Exit gate:** principal di test autenticato, entitlement limitati, launcher corretto, logout funzionante e destinazioni non autorizzate fail-closed.

---

## Phase 3 — Pilot di federazione Docente OS

**Scopo:** provare l'architettura contro il prodotto autenticato più maturo senza trasferire autorità a TRAMA Access.

**Deliverable:**
- ingresso pilot tramite identità professionale TRAMA;
- mapping governato verso identità/sessione locale Docente OS;
- workspace membership e RLS restano autorità locale;
- test per route non autenticata, entitlement revocato, sessione scaduta, isolamento secondo utente e logout.

**Exit gate:** `Gateway/Access → Docente OS → autorizzazione locale → logout` funziona end-to-end senza regressione dell'isolamento workspace.

---

## Phase 4 — Federazione professionale Studio Atlas

**Scopo:** sostituire il confine auth professionale mancante con il percorso TRAMA canonico, preservando l'autorità Studio Atlas.

**Deliverable:**
- federazione professionale Studio Atlas;
- ownership/autorizzazione dei draft legata a identità locale governata;
- preview learner senza trasferimento della sessione professionale;
- persistenza remota trattata come capacità separata salvo piano/gate specifico.

**Exit gate:** professionista autorizzato entra via TRAMA Access; accesso non autorizzato fallisce in sicurezza; nessuna credenziale professionale raggiunge Atlas learner.

---

## Phase 5 — Curricolo Atlas pubblico/professionale

**Scopo:** preservare la superficie pubblica reale aggiungendo contesto professionale senza creare una seconda autorità sul curricolo.

**Deliverable:**
- modalità pubblica e professionale esplicite;
- modalità pubblica senza login;
- modalità professionale con contesto limitato per progettazione, materiali e authoring;
- nessun write path che bypassi Arena;
- deep-link context opaco/limitato e risolto sotto autorizzazione della destinazione.

**Exit gate:** uso pubblico invariato; arricchimento professionale funzionante; nessun leak; nessuna modifica del curricolo attraverso Curricolo Atlas.

---

## Phase 6 — Arena: contesto istituzionale e ruoli

**Scopo:** federare l'identità professionale mantenendo in Arena l'autorità istituzionale sul curricolo.

**Deliverable:**
- principal e contesto istituzionale ricevuti tramite confine standard;
- Arena governa read/edit/approve/publish;
- test per mismatch istituzione, revoca entitlement e modifica non autorizzata;
- accesso a Curricolo Atlas non concede mai authority di scrittura Arena.

**Exit gate:** autenticazione e autorizzazione locale dimostrate indipendentemente.

---

## Phase 7 — Contratto privacy-first assegnazioni → Atlas learner

**Scopo:** rendere utilizzabile il targeting per classe/gruppo senza account personale learner.

**Deliverable:**
- contratto di assegnazione con dati minimi;
- codice/ticket/link limitato, scadenza e regole anti-replay;
- nessun registro nominale nel handoff predefinito;
- retention/reset/delete documentati;
- learner flow senza email, account o profilo personale cross-experience.

**Exit gate:** docente indirizza classe/gruppo/assegnazione e learner apre l'esperienza senza identità personale Atlas e senza disclosure non necessaria.

---

## Phase 8 — Shared Material Contract

**Scopo:** trasformare i materiali da concetti locali duplicati a risorsa governata cross-product senza creare prematuramente una nuova app.

**Deliverable:**
- identità stabile del materiale;
- owner/workspace/contesto;
- autore/origine/provenance;
- lifecycle/versioning quando necessario;
- riferimenti a curricolo, lezioni/progettazione, Studio Atlas ed esperienze learner;
- semantica di condivisione, proiezione, export;
- adapter che referenziano invece di copiare quando appropriato.

**Exit gate:** almeno due superfici reali consumano lo stesso riferimento governato mantenendo provenance e autorità chiare.

---

## Phase 9 — Confine Control Center privilegiato

**Scopo:** introdurre accesso privilegiato solo quando esistono vere operazioni protette.

**Deliverable:**
- separazione esplicita pubblico/privilegiato;
- entitlement governance dedicato;
- step-up/MFA per operazioni sensibili/irreversibili;
- audit/receipt;
- login professionale ordinario non concede poteri di governance.

**Exit gate:** una operazione privilegiata deliberatamente limitata è eseguibile solo con entitlement + step-up e produce receipt verificabile; Control Center pubblico resta invariato.

---

## Phase 10 — Continuità cross-app e hardening deep-link

**Scopo:** rendere l'ecosistema continuo senza trasformarlo in monolite.

**Deliverable:**
- convenzioni per deep-link/context limitati;
- nessuna credenziale o dato personale sensibile negli URL;
- comportamento coerente di ritorno/navigazione;
- test di scadenza sessione e logout cross-product;
- nuova verifica locale di autorizzazione a ogni destinazione.

**Exit gate:** user journey rappresentativi attraversano almeno tre superfici professionali senza loop di login, leak di token o confusione di privilegi.

---

## Phase 11 — Cutover Gateway → TRAMA Access

**Scopo:** attivare il CTA professionale solo quando la destinazione è reale e qualificata.

**Deliverable:**
- URL production TRAMA Access certificato;
- `VITE_TRAMA_ENTRY_HREF` punta all'endpoint canonico;
- `Entra in TRAMA` / `Accedi` testati dal Gateway pubblico reale;
- failure/recovery se Access non è disponibile;
- nessun URL temporaneo di prodotto.

**Exit gate:** `Gateway → TRAMA Access → applicazione autorizzata` funziona in produzione e la superficie pubblica resta utilizzabile anche con Access indisponibile.

---

## Phase 12 — Qualificazione ecosistema e chiusura roadmap

**Scopo:** dimostrare il target come ecosistema e non come somma di app verdi.

**Journey minimi certificati:**

1. Pubblico → Gateway → Curricolo Atlas pubblico.
2. Pubblico → Gateway → Control Center pubblico.
3. Professionista → Gateway → TRAMA Access → Docente OS.
4. Professionista → TRAMA Access → Curricolo Atlas professionale → percorso governato Arena.
5. Professionista → TRAMA Access → Studio Atlas → confine preview/pubblicazione Atlas learner.
6. Docente → assegnazione classe/gruppo → Atlas learner senza account personale.
7. Operatore governance → TRAMA Access → step-up → operazione Control Center privilegiata, se autorizzata.
8. Materiale condiviso referenziato da almeno due superfici reali con provenance intatta.

**Exit gate:** evidenze exact-head dimostrano journey e confini; nessun flusso `REAL` è privo di riferimento verificabile.

---

# Catena delle dipendenze

`Baseline/Gateway safety → Identity contract → TRAMA Access → Docente OS pilot → Studio Atlas → Curricolo Atlas → Arena → Assignment/Learner → Materiali → Control Center privilegiato → Cross-app hardening → Gateway cutover → Ecosystem qualification`

## Anti-stall rules

- Non risolvere problemi di maturità estranei solo perché emergono nella fase attiva.
- Non rendere permanente una scelta provider/tool prima dell'approvazione del contratto che la richiede.
- Non chiudere una fase con evidenze mancanti chiamandola "quasi fatta": resta `PARTIAL`.
- Non promuovere un nodo perché esiste la UI: nodo e flusso sono indipendenti.
- Non ridurre l'autorità locale di prodotto per semplificare SSO.
- Non creare identità learner per semplificare le assegnazioni.
- Non creare una app Materiali autonoma senza una decisione prodotto successiva.
- Non attivare Control Center privilegiato prima di avere operazioni protette esplicite.

## Reporting canonico

Ogni aggiornamento roadmap riporta solo:

- fase attiva;
- exact head / PR;
- evidenze chiuse;
- blocker;
- delta state map;
- prossimo passo canonico.
