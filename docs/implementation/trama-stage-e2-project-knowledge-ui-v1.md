# TRAMA Stage E2 — Project Knowledge UI Implementation v1

**Stato:** PROPOSED / IMPLEMENTATION / READ_ONLY  
**Data:** 2026-09-29  
**Perimetro:** TRAMA Control Center Home · Project Knowledge v2  
**Base:** Stage E0 + Stage E1

## 1. Obiettivo

Integrare nella Home reale del Control Center la comunicazione human-readable progettata in E0 e prototipata in E1, senza attivare il Live Overlay remoto.

## 2. Sorgente dati

La UI legge esclusivamente il Context Pack locale:

`./data/context-packs/project-knowledge.json`

Il file resta una proiezione governata e non diventa nuova authority.

La UI NON:
- interroga GitHub;
- avvia collector;
- esegue polling;
- promuove snapshot;
- modifica repository;
- autorizza runtime.

## 3. Fail-closed pre-live

Finché il Context Pack non contiene `effectiveContext`, la vista deve mostrare:

- informazioni di riferimento disponibili;
- aggiornamenti recenti non ancora disponibili in questa vista;
- nessuna pretesa di stato live;
- nessuna azione richiesta.

Questo è lo stato atteso della baseline corrente.

## 4. Mapping

La traduzione tecnica→utente è isolata in:

`control-center/project-knowledge-state.js`

Il modulo è puro rispetto alla rete e produce:
- `normal`;
- `empty`;
- `partial`;
- `review`;
- `blocked`;
- `offline`;
- `unavailable`;
- `error`.

Gli enum interni restano nel dettaglio tecnico.

## 5. Integrazione Home

La Home aggiunge una sezione **Stato delle informazioni** prima delle viste di maturità.

Struttura:
1. sintesi complessiva;
2. informazioni di riferimento;
3. aggiornamenti recenti;
4. eventuale messaggio di attenzione;
5. dettagli tecnici progressivi.

Il Control Center resta READ_ONLY. Una condizione che richiede verifica viene descritta, ma la Home non presenta pulsanti che fingano una capacità di approvazione o verifica non posseduta.

## 6. Offline/PWA

Il Context Pack e il modulo di mapping sono asset locali del bundle.

Il service worker:
- usa network-first sul Context Pack locale;
- conserva l'ultima risposta valida;
- permette alla UI di distinguere `offline-cache` da dato appena verificato.

La cache PWA non crea authority e non è presentata come dato live.

## 7. Accessibilità

La sezione:
- usa `role=status` e `aria-live=polite`;
- mantiene testo oltre al colore;
- usa `details/summary` nativi;
- mantiene focus e semantica esistenti;
- collassa a singola colonna su mobile;
- non richiede overflow orizzontale per comprendere lo stato.

## 8. Test

`scripts/test_stage_e2_project_knowledge_ui.cjs` verifica:

- assenza di falso live quando `effectiveContext` manca;
- mapping normal/empty/partial/review/blocked/offline;
- separazione fra stato primario e termini tecnici;
- actionRequired distinto da capacità runtime.

La Governance CI esegue il test.

## 9. Confini

E2 non:
- attiva LiveRepositoryOverlay;
- enrola semantic anchors;
- modifica ADR-018;
- aggiunge telemetria;
- cambia authority;
- introduce GitHub App;
- abilita DOS-A1.

## 10. Criteri di qualificazione

- Home reale usa il mapping E0/E1;
- Context Pack locale è unica sorgente Project Knowledge della sezione;
- baseline senza `effectiveContext` degrada in modo esplicito e non allarmistico;
- offline non viene confuso con live;
- nessun controllo fittizio di approvazione;
- mobile e dettagli tecnici restano accessibili;
- test mapping PASS;
- Governance PASS;
- Build Control Center PASS;
- review tecnica/UX;
- HUMAN EXACT-HEAD REVIEW — PASS.

## 11. Passaggio a E3

E3 verifica con utenti reali la comprensione della superficie E2.

L'attivazione futura del Live Overlay resta una decisione separata.
