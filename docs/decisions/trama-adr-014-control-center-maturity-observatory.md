# TRAMA-ADR-014 — Control Center v2 come osservatorio read-only di maturità ed evidenze

**Stato:** PROPOSED  
**Data:** 2026-09-24  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS · Assurance · Adozione  
**Runtime:** NO NEW WRITE AUTHORITY

## Contesto

Il Control Center v1 rende leggibili stato GitHub, pull request, workflow e priorità, ma non rappresenta in modo strutturato la maturità dell’ecosistema, le evidenze che sostengono uno stato, i gate bloccanti, le dipendenze e l’evoluzione nel tempo.

L’espansione del cruscotto non deve creare una nuova fonte autorevole né sostituire STATUS.md, ROADMAP.md, ADR, contratti o review umane.

## Decisione proposta

1. Il Control Center può evolvere in **osservatorio read-only di maturità ed evidenze** dell’ecosistema.
2. La maturità è rappresentata con livelli 0–5 basati su prerequisiti ed evidenze, non con un punteggio unico.
3. Ogni ambito distingue almeno `confirmedLevel`, `candidateLevel`, `confidence`, evidenze e gate bloccanti.
4. Il sistema può calcolare stati candidati e segnalare il prossimo gate, ma non può promuovere autonomamente un livello, chiudere un pilota, approvare un ADR o autorizzare runtime.
5. Le fonti vengono normalizzate in uno snapshot tipizzato e versionato, preferibilmente generato fuori dal browser.
6. La UI può visualizzare fasi, matrice di maturità, grafo dell’ecosistema, evidenze, rischi, dipendenze, storico ed espansioni candidate.
7. La migrazione dalla v1 alla v2 deve essere incrementale e mantenere un percorso di rollback.
8. Il frontend target può adottare React/TypeScript e librerie mature di componenti, grafici e grafi, purché accessibilità, PWA, read-only e sicurezza restino invarianti.

## Confini

- STATUS.md resta fonte canonica dello stato corrente.
- ROADMAP.md resta fonte della sequenza canonica.
- Arena resta authority curricolare.
- Docente OS resta authority del contesto e della decisione professionale.
- Atlas non acquisisce authority curricolare.
- Nessuna visualizzazione costituisce approvazione.
- Nessuna “espansione candidata” equivale ad autorizzazione.
- DOS-A1 resta `RUNTIME_DEFERRED`.
- R3-P4 resta soggetto ai propri gate distinti.
- Il Control Center non raccoglie dati personali di studenti o docenti.

## Impatto sul controllo umano

**STRENGTHENED.** L’obiettivo è rendere più visibile perché uno stato è dichiarato, quali prove lo sostengono e quale decisione umana manca.

## Stato implementativo

Questa ADR è una proposta di architettura e governance. Non autorizza la sostituzione della v1, l’introduzione di nuove write, nuove automazioni decisionali o cambiamenti runtime nei prodotti osservati.

## Documenti collegati

- `docs/product/trama-control-center-v2-maturity-intelligence.md`
- `docs/assurance/trama-maturity-evidence-model.md`
- `docs/architecture/trama-control-center-v2-architecture.md`
- `docs/design/trama-control-center-v2-ui-spec.md`
- `docs/strategy/trama-control-center-v2-implementation-plan.md`

## Gate di approvazione

Prima di promuovere questa ADR:

1. review di coerenza con STATUS/ROADMAP;
2. review del modello maturità/evidenze;
3. conferma che non introduca authority implicita;
4. conferma accessibilità e privacy-by-design;
5. HUMAN EXACT-HEAD REVIEW — PASS.
