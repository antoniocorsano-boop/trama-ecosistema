# TRAMA Development Continuity Protocol v1

**Data:** 28 settembre 2026  
**Stato:** PROPOSED / PROCESS GOVERNANCE / NO_RUNTIME_AUTHORIZATION  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS  
**Collegato a:** TRAMA-ADR-015 · ProjectContextSnapshot v1 · TRAMA Context Pack v1

## 1. Scopo

Evitare che ogni nuova sessione di lavoro ricostruisca da zero stato, decisioni, vincoli, lavori paralleli e razionali già consolidati.

Il protocollo definisce come usare insieme:

1. **fonti canoniche del repository** per stato e decisioni;
2. **TRAMA Control Center / Project Knowledge Base** come proiezione read-only dello stato reale;
3. **TRAMA Context Pack** come contesto minimo mirato per il lavoro corrente;
4. **memoria conversazionale** come indice sintetico delle invarianti stabili, mai come fonte tecnica canonica;
5. **second-brain storico** come archivio consultabile, non come prova dello stato corrente.

## 2. Principio operativo

> **Non ricostruire ciò che è già governato; verifica ciò che può essere cambiato.**

Una nuova sessione non deve partire da una rilettura indiscriminata di chat, PR e documenti. Deve partire dal contesto operativo corrente e approfondire solo gli elementi volatili necessari.

## 3. Gerarchia pratica delle fonti

Per iniziare o riprendere un lavoro:

1. ADR e contratti approvati;
2. `STATUS.md`;
3. `ROADMAP.md` e piano operativo corrente;
4. ProjectContextSnapshot / Context Pack;
5. stato vivo di repository, PR, workflow ed exact head;
6. documenti di implementazione;
7. second-brain e materiali storici;
8. memoria conversazionale come indice e supporto di orientamento.

Se due fonti divergono, prevale la fonte canonica più autorevole e più fresca.

## 4. Protocollo di avvio di una nuova sessione

Prima di proporre nuove fasi o nuova architettura, l'agente deve:

1. identificare dominio, capability o workstream richiesto;
2. recuperare il Context Pack pertinente, se disponibile;
3. leggere solo le fonti canoniche necessarie a interpretarlo;
4. verificare gli elementi volatili: PR aperte, exact head, gate, workflow, dipendenze e lavori paralleli;
5. individuare eventuale negative knowledge pertinente;
6. riprendere dal **next valid action** già coerente con il quadro corrente;
7. creare nuova governance solo se emerge un cambiamento reale di contratto, authority, confine di sicurezza o decisione irreversibile.

È un errore di processo ricominciare da una nuova analisi generale quando il workstream dispone già di stato, vincoli e next action verificabili.

## 5. Modalità di sviluppo ordinaria

Per modifiche interne a un confine già governato si applica il **ciclo continuo end-to-end**:

```text
stato corrente verificato
→ implementazione
→ test
→ correzione
→ test
→ verifica integrata
→ revisione tecnica conclusiva
→ Human Review finale, se richiesta
→ merge
```

Durante questo ciclo:

- evitare nuove sottofasi meramente nominali;
- evitare micro-approvazioni prive di una decisione reale;
- evitare review complete dopo ogni correzione locale;
- raggruppare i controlli tecnici quando non aumenta il rischio;
- correggere nello stesso ciclo i rilievi non strutturali;
- interrompere il flusso solo per blocker reali, ambiguità di authority, rischio di perdita dati, modifica di contratto o decisione umana sostanziale.

## 6. Quando è richiesta governance rafforzata

Una nuova fase governata o una Human Review intermedia è giustificata quando cambia almeno uno dei seguenti elementi:

- authority tra prodotti o domini;
- contratto pubblico o schema persistente;
- confine di sicurezza o privacy;
- capacità di write o automazione autonoma;
- semantics di approvazione/promozione;
- migrazione irreversibile o perdita potenziale di dati;
- requisito normativo o istituzionale;
- baseline canonica condivisa tra più prodotti.

In assenza di tali cambiamenti, la governance esistente deve essere riusata.

## 7. Memoria a strati

### 7.1 Memoria conversazionale

Conserva soltanto informazioni stabili e ad alta utilità, per esempio:

- invarianti architetturali;
- modalità di lavoro concordate;
- authority fondamentali;
- riferimenti a capability e fonti da consultare.

Non deve contenere una replica estesa dello stato delle PR o del repository.

### 7.2 Project Knowledge Base

Conserva o proietta in forma strutturata:

- capability;
- workstream;
- decisioni;
- razionali;
- invarianti;
- PR e exact head pertinenti;
- blocker;
- dipendenze;
- negative knowledge;
- next candidate actions;
- provenance e freshness.

### 7.3 Second-brain storico

Mantiene:

- analisi precedenti;
- ricerche;
- ipotesi;
- percorsi scartati;
- materiali di supporto.

Ogni elemento storico deve essere distinguibile dallo stato corrente.

## 8. Regola di promozione nella memoria progettuale

Non ogni conversazione genera nuova knowledge persistente.

Un elemento entra nella Project Knowledge Base quando soddisfa almeno una condizione:

- modifica una decisione attiva;
- introduce o rimuove un vincolo;
- chiude o apre un blocker;
- produce un apprendimento da errore riusabile;
- stabilisce una regola di processo applicabile oltre la singola modifica;
- cambia il next valid action di un workstream;
- chiude una capability o ne modifica lo stato.

Dettagli effimeri, tentativi locali e diagnostica transitoria restano nelle evidenze tecniche o nella cronologia della PR.

Per evidenze runtime provenienti da collector, in particolare `RepositoryObservation`, la promozione segue obbligatoriamente l'architettura `evidence -> Promotion Proposal -> governed write actor -> PR -> Human Review -> merge -> materialized views`. Il collector non può scrivere direttamente nella Project Knowledge Base. La persistenza di uno stato osservato è quindi una decisione di governance separata dalla sua raccolta.

Riferimenti fondanti: `docs/architecture/trama-repository-observation-promotion-v1.md` e `docs/adr/TRAMA-ADR-016-project-knowledge-observation-promotion.md`.

## 9. Knowledge Event minimo

Per decisioni di processo persistenti usare un evento strutturato equivalente a:

```json
{
  "type": "DECISION",
  "subject": "development-continuity",
  "statement": "Per sviluppo ordinario usare un ciclo continuo end-to-end fino a risultato verificabile; governance rafforzata solo quando cambiano authority, contratti, sicurezza o decisioni irreversibili.",
  "status": "CURRENT",
  "scope": ["TRAMA", "Arena", "Atlas", "Docente OS"],
  "sourceRefs": [],
  "validFrom": "2026-09-28"
}
```

## 10. Caso di riferimento: Docente OS PR #625

La PR #625 è il primo caso operativo di applicazione del protocollo.

Obiettivo di processo:

- completare il flusso end-to-end dell'importazione orario;
- non aprire nuove micro-fasi per ogni controllo;
- eseguire implementazione, test e correzioni nello stesso ciclo;
- mantenere fail-closed, DRAFT-first e controllo docente;
- effettuare una revisione tecnica conclusiva;
- richiedere una decisione umana soltanto sul risultato completo o su un vero cambio di governance.

Il caso #625 costituisce **precedente di processo**, non eccezione locale.

## 11. Criterio di successo

Il protocollo funziona quando, aprendo una nuova sessione, è possibile rispondere rapidamente e con fonti verificabili a:

- dove siamo;
- cosa governa il lavoro corrente;
- cosa è già stato deciso;
- cosa non va rifatto;
- quali approcci sono già stati scartati;
- quali lavori paralleli possono interferire;
- qual è la prossima azione valida.

Se per rispondere occorre rileggere lunghe sequenze di chat, la Project Knowledge Base non sta ancora svolgendo correttamente il proprio ruolo.

## 12. Invarianti

- nessuna chat è fonte tecnica canonica;
- il Control Center resta read-only e non crea authority;
- il Context Pack non autorizza write;
- provenance e freshness restano obbligatorie;
- negative knowledge non viene cancellata;
- stato storico e stato corrente restano distinti;
- DOS-A1 resta `RUNTIME_DEFERRED` finché non esplicitamente autorizzato;
- Human Review non viene eliminata dove è richiesta: viene collocata nel punto in cui esiste una decisione reale da assumere.
