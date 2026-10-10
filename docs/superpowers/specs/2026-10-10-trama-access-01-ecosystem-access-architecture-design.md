# TRAMA ACCESS-01 — Ecosystem Access Architecture

**Status:** APPROVED DESIGN  
**Data:** 2026-10-10  
**Ambito:** accesso ecosistema, identità professionale, accesso pubblico, learner e governance  
**Repository:** `antoniocorsano-boop/trama-ecosistema`  
**Baseline iniziale:** `main@72989b065a598012d0aa43fc6cb3568dcfeb4fcf`

## 1. Scopo

Questa specifica congela l'architettura di accesso dell'intero ecosistema TRAMA affinché il modello non resti una semplice analisi conversazionale o un diagramma.

Il perimetro comprende:

- TRAMA Gateway;
- TRAMA Access;
- Docente OS;
- Arena;
- **Curricolo Atlas**;
- Studio Atlas;
- Atlas learner;
- Materiali;
- classi, gruppi e assegnazioni;
- Control Center;
- TRAMA governance e servizi condivisi quando incidono sui confini di accesso.

La specifica distingue applicazioni, capacità trasversali, superfici pubbliche, professionali, learner, governance e servizi non destinati direttamente agli utenti.

## 2. Terminologia canonica

Il nome canonico della superficie Atlas dedicata al curricolo è **Curricolo Atlas**.

Il dominio scolastico di riferimento è il **curricolo di istituto**. Arena è la superficie autorevole di gestione; Curricolo Atlas è la superficie di navigazione, consultazione e intelligibilità dello stato governato da Arena.

Ogni nuova UI, documento, contratto e metadato ACCESS-01 usa questa terminologia.

## 3. Principi di governo

### 3.1 Una identità professionale, autorità di prodotto indipendenti

TRAMA fornisce una identità condivisa per utenti adulti/professionali.

L'identità non rende nessun prodotto autorità sugli altri. Docente OS, Arena, Studio Atlas, Curricolo Atlas e Control Center conservano responsabilità e regole locali di autorizzazione.

- autenticazione: **chi è il professionista**;
- autorizzazione: **cosa può fare in un prodotto e contesto specifico**.

I due livelli restano separati.

### 3.2 Nessun account personale learner per impostazione predefinita

Atlas learner resta utilizzabile senza account personale TRAMA/Atlas per impostazione predefinita.

Non si introducono login learner, email learner, profili personali server-side globali o tracking cross-experience per semplificare il routing.

Quando il docente assegna un'esperienza a classe o gruppo, si preferiscono riferimenti limitati, ticket/codici o meccanismi equivalenti privacy-first invece di esportare identità nominali verso Atlas.

### 3.3 Quattro piani distinti

TRAMA distingue almeno:

1. **Piano pubblico** — nessuna identità professionale richiesta.
2. **Piano professionale** — identità adulta/professionale autenticata.
3. **Piano learner** — accesso child-safe alle esperienze senza account personale per impostazione predefinita.
4. **Piano governance** — accesso operativo privilegiato, con autorizzazione più forte e step-up quando richiesto.

Una stessa famiglia di prodotto può avere modalità pubblica e privilegiata, ma i due confini devono essere espliciti.

### 3.4 Nessuna app diventa shell implicita dell'ecosistema

- Docente OS è l'ambiente operativo del docente, non l'identity provider dell'ecosistema.
- Arena è l'autorità sul curricolo di istituto, non il portale professionale generale.
- Studio Atlas è l'ambiente di authoring, non il runtime studente.
- Control Center è osservabilità/governance, non il launcher ordinario.
- TRAMA Access è identità + ingresso/launcher, non una nuova dashboard completa.

### 3.5 Risorse trasversali non sono automaticamente applicazioni

Materiali e organizzazione classi/gruppi/assegnazioni sono capacità trasversali. Non diventano app autonome soltanto perché consumate da più prodotti.

Si preferiscono contratti condivisi e ownership esplicita rispetto a copie concorrenti.

## 4. Mappa delle superfici

| Superficie/capacità | Natura | Utente principale | Piano | Autorità principale |
| --- | --- | --- | --- | --- |
| TRAMA Gateway | soglia pubblica | chiunque | Pubblico | nessuna sui dati di prodotto |
| TRAMA Access | identità + launcher | professionisti/adulti | Professionale | identità/ingresso |
| Docente OS | ambiente operativo | docenti | Professionale | workspace/workflow docente |
| Arena | autorità sul curricolo | professionisti autorizzati | Professionale | curricolo di istituto |
| Curricolo Atlas | navigazione/intelligibilità | pubblico/professionisti secondo policy | Pubblico + Professionale | lettura/navigazione su stato Arena |
| Studio Atlas | authoring esperienze | docenti/autori | Professionale | lifecycle authoring |
| Atlas learner | learner runtime | studenti | Learner | esecuzione esperienza, non identità personale |
| Materiali | risorsa condivisa | professionisti; learner indirettamente | Trasversale | ownership/provenance/riferimenti |
| Classi/Gruppi/Assegnazioni | targeting didattico | docenti | Professionale → Learner | targeting teacher-side |
| Control Center pubblico | stato/evidenze | chiunque | Pubblico | osservabilità pubblica |
| Control Center privilegiato | governance/operazioni | operatori autorizzati | Governance | operazioni governate |
| TRAMA governance | contratti/policy/confini | ecosistema | Governance | lifecycle e authority boundaries |
| Servizi/adapters condivisi | infrastruttura | app/servizi | machine-to-machine | responsabilità limitata |

## 5. Due catene canoniche distinte

### 5.1 Catena del curricolo

```text
Arena
  │ stato autorevole del curricolo di istituto
  ▼
Curricolo Atlas
  │ navigazione / consultazione / intelligibilità
  ▼
Docente OS / Studio Atlas / altri contesti professionali
```

Regole:

- Arena conserva authority di modifica e approvazione.
- Curricolo Atlas non diventa una seconda authority.
- Le modalità pubblica e professionale di Curricolo Atlas possono differire, ma ogni scrittura sullo stato canonico passa da un percorso governato Arena.
- Docente OS e Studio Atlas possono collegarsi a Curricolo Atlas senza copiare l'authority del curricolo nei propri domini.

### 5.2 Catena delle esperienze

```text
Studio Atlas
   │ author / validate / publish sotto governance
   ▼
Atlas learner
   │ esperienza learner
   ▼
Studente
```

Regole:

- Studio Atlas è authoring professionale.
- Atlas learner non è ambiente di authoring.
- L'accesso studente non implica account personale TRAMA.
- Preview e pubblicazione preservano la separazione tra sessione professionale e runtime learner.

## 6. Ruolo di Docente OS

Docente OS è l'ambiente operativo canonico del docente.

Può orchestrare altri domini:

```text
Lezione / progettazione
  ├── consulta curricolo → Curricolo Atlas
  ├── governa curricolo → Arena, se autorizzato
  ├── usa/riferisce materiale → Materiali
  ├── crea esperienza → Studio Atlas
  └── apre/assegna esperienza → Atlas learner
```

L'orchestrazione è integrazione, non trasferimento di ownership.

Docente OS mantiene le proprie regole locali di workspace membership e autorizzazione dati.

## 7. TRAMA Access

### 7.1 Responsabilità

TRAMA Access possiede soltanto:

- ingresso/sign-in professionale;
- stabilimento/federazione della sessione professionale;
- contesto istituzionale/professionale minimo per il routing;
- entitlement a livello applicazione;
- launch verso applicazioni autorizzate;
- coordinamento logout dove tecnicamente supportato.

Non possiede:

- dati del curricolo;
- lezioni;
- contenuto dei materiali;
- draft Studio Atlas;
- profili/progressi learner personali;
- permessi fini interni ai prodotti;
- decisioni di governance appartenenti al Control Center/TRAMA.

### 7.2 Modello minimo

```text
Principal
  ├── InstitutionalContext
  └── ApplicationEntitlement
```

Esempi:

```text
DOCENTE_OS      USE
CURRICOLO_ATLAS READ
STUDIO_ATLAS    AUTHOR
ARENA           ENTER
CONTROL_CENTER  GOVERNANCE_OPERATOR
```

Gli entitlement permettono l'ingresso in un prodotto/modalità. I permessi fini restano locali.

### 7.3 Launcher

TRAMA Access resta un launcher/context selector leggero. Se una sola destinazione è rilevante, può essere usata continuazione diretta.

Le destinazioni derivano da configurazione/entitlement governati e non da una lista UI permanente hard-coded.

## 8. Architettura dell'identità professionale

### 8.1 Provider dedicato e separato dai dati di prodotto

TRAMA usa un identity provider dedicato all'ecosistema, separato dai database di prodotto.

La prima implementazione può usare un progetto Supabase Auth dedicato se le app si integrano tramite contratti standard OAuth/OIDC e non dipendono da dettagli interni del database di un prodotto.

Il piano identitario non contiene lezioni Docente OS, dati Arena, draft Studio Atlas, contenuti Materiali o registri learner.

### 8.2 Identità ecosistemica e identità locale

Esiste concettualmente un principal professionale TRAMA stabile.

Le applicazioni possono mantenere identificatori/sessioni locali propri. Non è richiesto che gli UUID locali coincidano tra prodotti.

Un adapter governato può associare il principal TRAMA all'identità locale.

### 8.3 Portabilità provider

Il confine usa protocolli standard OAuth 2.x / OpenID Connect per evitare dipendenza architetturale da un singolo provider.

Il provider è sostituibile; il contratto TRAMA è l'autorità architetturale.

## 9. Curricolo Atlas

### 9.1 Modalità pubblica

Quando lo stato dell'istituto è pubblicabile sotto governance, Curricolo Atlas consente consultazione non autenticata.

La modalità pubblica non espone dati professionali solo perché la stessa UI può renderizzare entrambe le modalità.

### 9.2 Modalità professionale

Il professionista autenticato può ricevere contesto aggiuntivo verso progettazioni, materiali o authoring.

Il contesto professionale non concede authority di modifica: le scritture restano governate da Arena.

## 10. Arena

Arena richiede identità professionale per la gestione privilegiata del curricolo.

TRAMA Access concede al massimo entitlement di ingresso; Arena governa i propri ruoli read/edit/approve/publish.

Il contesto istituzionale è parte essenziale dell'autorizzazione.

## 11. Studio Atlas

Studio Atlas adotta l'identità professionale TRAMA invece di creare un login concorrente.

Conserva ownership e autorizzazione dei propri draft.

Il percorso `Vedi come studente` attraversa un confine governato verso Atlas learner e non trasferisce la sessione professionale.

## 12. Atlas learner

Atlas learner resta fuori dal piano identitario professionale.

Per classi/gruppi il sistema teacher-side può emettere un riferimento o codice limitato:

```text
Docente OS / contesto professionale
   │ selezione classe/gruppo
   ▼
Assignment
   │ experience reference + token/codice limitato
   ▼
Atlas learner
```

Il handoff predefinito non include il registro nominale né un identificatore personale learner valido tra esperienze.

Ogni eccezione richiede decisione CHILD-SAFE/privacy esplicita e analisi di necessità.

## 13. Materiali

I Materiali sono prima di tutto risorsa/capacità governata condivisa.

Il contratto deve poter esprimere almeno:

- identificatore stabile;
- owner/workspace/contesto;
- autore/origine;
- provenance;
- disciplina/dominio quando rilevante;
- riferimenti al curricolo;
- riferimenti a lezioni/progettazione;
- riferimenti Studio Atlas / esperienza Atlas;
- condivisione/proiezione/export;
- lifecycle/versioning quando necessario.

Si referenzia la stessa risorsa tra prodotti invece di creare copie concorrenti quando appropriato.

## 14. Classi, gruppi e assegnazioni

L'organizzazione teacher-side non dimostra né richiede account personali Atlas.

Docente OS o altro sistema professionale autorizzato può gestire classi e gruppi per progettazione e assegnazione.

Il confine learner riceve solo i dati minimi per aprire l'esperienza. Dati nominali teacher-side non propagano silenziosamente verso Atlas.

## 15. Control Center

### 15.1 Pubblico

Può mostrare informazioni governate non sensibili: stato ecosistema, evidenze, maturità, contratti e release.

Può restare non autenticato.

### 15.2 Privilegiato

Se esistono operazioni sensibili o irreversibili — authority changes, promozioni, mutazioni configurazione, runtime actions, approvazioni governate — il semplice login professionale non basta.

Servono entitlement governance dedicato e step-up/MFA dove richiesto.

Un utente TRAMA ordinario non acquisisce poteri di governance perché autenticato.

## 16. Gateway

TRAMA Gateway resta soglia pubblica e superficie identitaria/narrativa.

Non conserva credenziali, non diventa IdP e non inferisce autorizzazioni di prodotto.

`Entra in TRAMA` e `Accedi` puntano in futuro al TRAMA Access canonico.

Fino a quel momento, l'assenza di `VITE_TRAMA_ENTRY_HREF` resta fail-closed **senza abbattere la landing pubblica**. Non si inventa un URL temporaneo di prodotto.

## 17. Navigazione e deep link

Dopo autenticazione, i deep link possono evitare un ritorno obbligatorio al launcher.

Un URL non contiene bearer token, credenziali raw, JWT privilegiati o contesto personale sensibile.

I riferimenti di contesto sono opachi/limitati e risolti dall'app destinazione sotto la propria autorizzazione.

## 18. Servizi machine-to-machine

Knowledge/evidence, connector/runtime, sync/import, Visual Factory, Runtime Adapter e servizi analoghi non sono destinazioni del launcher.

Usano contratti machine-to-machine separati e restano subordinati ai rispettivi confini di governance.

DOS-A1 resta `RUNTIME_DEFERRED` salvo decisione autorizzata separata.

## 19. Invarianti sicurezza/privacy

- niente password o bearer token persistenti tra app tramite URL;
- niente hack di token condivisi via `localStorage`;
- niente autorizzazione basata soltanto su email/metadati mutabili;
- niente escalation implicita cross-product;
- niente account learner creato per comodità delle assegnazioni;
- niente registro nominale esportato in Atlas per impostazione predefinita;
- dati di prodotto sotto RLS/autorizzazione locale equivalente;
- operazioni Control Center privilegiate con entitlement esplicito;
- Gateway non autorevole per autenticazione o permessi di prodotto.

## 20. Classi di utente iniziali

| Classe | Account personale | Superfici tipiche |
| --- | --- | --- |
| Visitatore pubblico | no | Gateway, Curricolo Atlas pubblico, Control Center pubblico |
| Studente/learner | no account personale TRAMA di default | Atlas learner |
| Docente/professionista | sì | Docente OS, Curricolo Atlas, Studio Atlas secondo entitlement |
| Responsabile del curricolo / professionista autorizzato | sì | superfici professionali + ruoli Arena |
| Operatore governance | sì + verifica forte quando necessaria | Control Center privilegiato |

## 21. Sequenza implementativa

1. congelare e approvare ACCESS-01;
2. definire il contratto provider-neutral di identità professionale;
3. creare identity provider candidato senza dati di prodotto;
4. costruire TRAMA Access minimale;
5. federare Docente OS come primo pilot;
6. provare login, autorizzazione locale, logout e failure mode end-to-end;
7. federare Studio Atlas;
8. definire modalità pubblica/professionale di Curricolo Atlas;
9. integrare Arena con contesto istituzionale e ruoli locali;
10. formalizzare Control Center pubblico/privilegiato e step-up;
11. definire contratto assegnazioni/learner;
12. definire Material Contract condiviso;
13. solo dopo certificazione di TRAMA Access, configurare `VITE_TRAMA_ENTRY_HREF` sul suo endpoint canonico.

## 22. Evidenze e qualificazione

ACCESS-01 non è implementato solo perché esiste una schermata di login.

Le evidenze devono dimostrare almeno:

- Gateway sempre utilizzabile pubblicamente;
- autenticazione professionale attraverso il confine canonico;
- route professionali non autenticate fail-closed o redirect sicuro;
- launch autorizzato nelle app pilot;
- autorizzazioni locali ancora efficaci dopo federazione;
- logout/scadenza sessione definiti e testati;
- nessuna credenziale nei URL/evidenze pubbliche;
- separazione modalità pubblica/professionale Curricolo Atlas;
- authority Arena non ottenibile dal solo accesso Curricolo Atlas;
- sessione Studio Atlas mai trasferita ad Atlas learner;
- learner senza account personale;
- assegnazione senza export nominale learner di default;
- Control Center pubblico separato da operazioni privilegiate;
- governance privilegiata con entitlement e verifica forte quando specificato;
- riferimenti Materiali con provenance/ownership preservati;
- terminologia **Curricolo Atlas** coerente.

Le prove sono exact-head, riproducibili e legate a contratti governati, non soltanto screenshot.

## 23. Non-obiettivi

ACCESS-01 non autorizza:

- acquisto immediato di un nuovo identity provider;
- migrazione immediata di tutti gli utenti;
- UI completa di amministrazione organizzazioni/tenant;
- account learner;
- una nuova app Materiali;
- trasferimento di ownership tra Arena, Studio Atlas e Docente OS;
- operazioni write privilegiate Control Center senza decisione separata;
- merge/deploy automatici;
- modifica dello stato DOS-A1.

## 24. Dichiarazione canonica

> **TRAMA fornisce una identità professionale e un'architettura di ingresso coerente preservando autorità di prodotto indipendenti. Accesso pubblico, professionale, learner e governance sono piani distinti. Arena è autorevole per il curricolo di istituto; Curricolo Atlas ne fornisce navigazione e intelligibilità. Studio Atlas crea esperienze; Atlas learner le esegue senza richiedere per impostazione predefinita un account personale. Docente OS orchestra il lavoro docente senza diventare authority dell'ecosistema. Materiali e assegnazioni sono capacità trasversali. Control Center separa osservabilità pubblica da governance privilegiata.**

## 25. Decision record

Direzione di design approvata il 2026-10-10 e governata tramite PR #268.

Ogni futura modifica materiale a identity authority, politica learner, confine Arena/Curricolo Atlas, confine Studio Atlas/Atlas learner o separazione Control Center pubblico/privilegiato richiede una nuova decisione governata.
