# TRAMA Control Center v2 — Maturity & Ecosystem Intelligence

**Data:** 24 settembre 2026  
**Stato:** PROPOSTA DI PRODOTTO / DOCUMENTATION-ONLY / READ_ONLY / NO NUOVA AUTORIZZAZIONE RUNTIME  
**Sostituisce:** nessun documento. Estende `trama-control-center-v1.md`.

## 1. Scopo

Evolvere il Control Center da cruscotto di attività GitHub a **strumento di monitoraggio intelligente dell’intero ecosistema TRAMA**.

La v2 deve rispondere, in pochi secondi, a cinque domande:

1. **Dove siamo** nella sequenza R1–R5?
2. **Quanto è maturo** ciascun ambito e su quali evidenze?
3. **Che cosa blocca** il livello successivo?
4. **Quali dipendenze** collegano Arena, Atlas, Docente OS, assurance, adozione e governance?
5. **Quale espansione è ammissibile dopo**, senza aprire cantieri prematuri?

Il Control Center non diventa una nuova authority. È una superficie di lettura, sintesi e audit.

## 2. Principi invarianti

La v2 mantiene i vincoli della v1:

- sola lettura;
- nessuna approvazione automatica;
- nessuna scrittura su GitHub o sugli altri prodotti;
- nessuna promozione implicita;
- nessuna modifica dei confini Arena / Atlas / Docente OS;
- DOS-A1 resta `RUNTIME_DEFERRED`;
- Atlas resta privacy-first;
- la review umana exact-head resta distinta dalle evidenze automatiche.

Nuovo principio:

> **Ogni indicatore di maturità deve essere spiegabile, riproducibile e collegato alle evidenze che lo giustificano.**

## 3. Cosa cambia rispetto alla v1

La v1 osserva principalmente:

- repository;
- pull request;
- workflow;
- priorità;
- stato di connettività.

La v2 aggiunge:

- fasi R1–R5;
- matrice di maturità;
- evidenze tipizzate;
- gate residui;
- dipendenze;
- rischi e debito di verifica;
- storia dell’avanzamento;
- candidati di espansione;
- mappa relazionale dell’ecosistema;
- spiegabilità di ogni stato.

## 4. Ambiti monitorati

La prima tassonomia comprende:

1. Governo e authority;
2. Arena;
3. Atlas;
4. Docente OS;
5. Interoperabilità cross-product;
6. Accessibilità;
7. Sicurezza e privacy;
8. Operatività e runtime;
9. Assurance;
10. Documentazione e memoria canonica;
11. Esperienza docente;
12. Adozione e istituto.

La tassonomia può evolvere, ma deve essere versionata.

## 5. Modello di maturità

Ogni ambito usa livelli 0–5:

- **L0 — Non definito:** nessun perimetro verificabile.
- **L1 — Definito:** intenti, confini e ownership documentati.
- **L2 — Progettato:** contratti, specifiche e gate definiti.
- **L3 — Implementato:** capacità disponibile nella superficie prevista.
- **L4 — Verificato:** evidenze automatiche e umane sufficienti nel contesto reale previsto.
- **L5 — Stabilizzato:** evidenza nel tempo, regressioni governate, manutenzione e adozione coerenti.

Il livello non è una media estetica. Un ambito può essere:

- `confirmedLevel`: livello effettivamente sostenuto dalle evidenze;
- `candidateLevel`: livello potenzialmente raggiungibile dopo i gate aperti;
- `confidence`: LOW / MEDIUM / HIGH;
- `blockingGates`: gate che impediscono la promozione;
- `evidenceFreshness`: freschezza delle prove.

## 6. Tipi di evidenza

Le evidenze riconosciute sono almeno:

- `DOCUMENT_CANONICAL`;
- `CONTRACT_APPROVED`;
- `PR_EXACT_HEAD`;
- `AUTOMATED_TEST`;
- `SECURITY_GATE`;
- `ACCESSIBILITY_GATE`;
- `RUNTIME_CANARY`;
- `HUMAN_REVIEW`;
- `REAL_CASE_VALIDATION`;
- `PROMOTION_DECISION`;
- `REGRESSION_HISTORY`;
- `ADOPTION_EVIDENCE`.

Ogni evidenza deve avere:

- identificativo;
- ambito;
- riferimento;
- data;
- stato;
- origine;
- livello di affidabilità;
- eventuale scadenza/freschezza;
- relazione con uno o più gate.

## 7. Regole di promozione

Un livello superiore è confermato solo se:

1. tutti i prerequisiti del livello sono soddisfatti;
2. i gate obbligatori sono chiusi;
3. le evidenze richieste sono presenti e sufficientemente fresche;
4. non esiste un blocco esplicito di governance;
5. quando richiesto, è presente una decisione umana di promozione.

La dashboard può suggerire “candidato a L4”, ma non può promuovere autonomamente.

## 8. Struttura della schermata principale

### 8.1 Fascia fasi R1–R5
Mostra:

- fase;
- stato;
- percentuale solo se derivata da sotto-gate deterministici;
- gate residui;
- collegamento alle evidenze.

### 8.2 Indicatori sintetici
Non più semplici contatori GitHub, ma:

- aree con maturità confermata;
- gate aperti;
- evidenze recenti;
- evidenze invecchiate;
- espansioni candidate;
- regressioni riaperte.

### 8.3 Matrice di maturità
Righe = ambiti.  
Colonne = livelli 0–5.

La matrice mostra:

- livello confermato;
- livello candidato;
- confidenza;
- motivazione sintetica;
- drill-down alle evidenze.

### 8.4 Ecosistema vivo
Mappa relazionale:

- TRAMA;
- Arena;
- Atlas;
- Docente OS;
- Assurance;
- Adozione;
- principali programmi e gate.

Le relazioni devono distinguere:

- authority;
- dipendenza;
- flusso dati;
- pubblicazione;
- validazione;
- dipendenza futura non autorizzata.

### 8.5 Attenzione richiesta
Pannello ordinato per urgenza operativa:

- gate umano;
- gate runtime;
- evidenza scaduta;
- regressione;
- dipendenza bloccante.

### 8.6 Prossime espansioni
Mostra capacità future solo se:

- dipendenze dichiarate;
- prerequisiti leggibili;
- stato `PLANNED`, `ELIGIBLE_FOR_DESIGN` o `BLOCKED`;
- nessuna confusione con capacità autorizzate.

## 9. Viste

### Vista strategica
Per capire maturità, fasi, rischi, dipendenze e prossime espansioni.

### Vista operativa
Per seguire gate, PR, workflow, canary, evidenze recenti e attività necessarie.

### Vista tecnica
Per exact head, identificatori, schema dati, workflow e riferimenti diretti.

### Vista storia
Per confrontare snapshot nel tempo e individuare:

- avanzamenti;
- regressioni;
- stalli;
- ripetizioni dello stesso problema.

## 10. Mobile, desktop e LIM

### Desktop
Dashboard completa a tre colonne con matrice, grafo e pannelli di attenzione.

### Mobile
Nessuna compressione della dashboard desktop. Ordine:

1. fase corrente;
2. attenzione richiesta;
3. maturità per ambito;
4. evidenze;
5. prossime espansioni;
6. grafo in vista semplificata.

### LIM
Priorità a:

- fase;
- stato ecosistema;
- 3–5 criticità principali;
- mappa ecosistema;
- leggibilità a distanza.

## 11. Stato e fiducia

Ogni valore mostrato deve avere uno dei seguenti stati:

- `FRESH`;
- `STALE`;
- `PARTIAL`;
- `UNVERIFIED`;
- `BLOCKED`.

Il Control Center deve rendere visibile quando un dato è vecchio o parziale.

## 12. Definizione di successo

La v2 è utile quando permette di capire senza aprire GitHub:

- quale fase è realmente in corso;
- perché un ambito è considerato maturo o non maturo;
- quale evidenza manca;
- quale gate è bloccante;
- quale sviluppo può iniziare senza violare la sequenza canonica;
- se l’ecosistema sta migliorando o semplicemente producendo più attività.

## 13. Non-obiettivi

Non sono obiettivi della v2:

- gestione progetti generalista;
- sostituzione di GitHub;
- sostituzione di STATUS.md;
- nuova authority;
- scoring competitivo;
- ranking tra prodotti;
- automazioni decisionali;
- telemetria individuale di studenti o docenti.

## 14. Dipendenze documentali

Questa specifica va letta insieme a:

- `STATUS.md`;
- `ROADMAP.md`;
- `docs/strategy/atomic-operating-plan-2026-09-22.md`;
- `docs/product/trama-control-center-v1.md`;
- `docs/vision/TRAMA-ECOSYSTEM-BASELINE-2026-09-23.md`;
- `docs/architecture/trama-control-center-v2-architecture.md`;
- `docs/design/trama-control-center-v2-ui-spec.md`;
- `docs/assurance/trama-maturity-evidence-model.md`;
- `docs/strategy/trama-control-center-v2-implementation-plan.md`.
