# TRAMA Consolidation Checkpoint — 21 settembre 2026

## Scopo

Riconciliare lo stato reale dell'ecosistema dopo il consolidamento Arena ↔ Docente OS, il pilota P9, l'hardening della registrazione lezione e la definizione del ruolo target di Atlas.

Questo checkpoint è descrittivo e di governo. Non autorizza nuove capacità runtime.

## Stato consolidato

### Governo

- TRAMA resta un livello di governo, non una quarta applicazione.
- Arena resta l'unica autorità curricolare.
- Atlas governa identità, versione e stato delle proprie risorse e pubblicazioni.
- Docente OS governa contesto professionale e decisioni del docente.
- Drive resta autorevole soltanto per i documenti dichiarati tali.

### Arena → Docente OS

Il modello professionale guidato è consolidato:
- baseline persistente per classe + disciplina + anno + versione;
- provenienza e applicabilità verificabili;
- nessun file manuale richiesto per ogni lezione;
- nessuna persistenza o adozione equivale ad approvazione istituzionale.

### Docente OS

Sono disponibili evidenze reali di:
- preparazione contestualizzata;
- proposta teacher-editable;
- registrazione della TeachingSession con receipt;
- decisione di completamento separata dalla registrazione dei minuti;
- release assurance selettiva app + DB + runtime.

Queste evidenze rafforzano il pilota ma non chiudono ECO-02/P1 senza il collaudo umano integrato finale.

### Atlas

Le decisioni ADR-007/008 sono approvate. Il runtime di pubblicazione resta non implementato.

Il prossimo snodo è ADR-010:
- Atlas integrale come atlante intelligente del curricolo;
- biblioteca come dominio di Atlas, non come sua definizione;
- Officina materiali separata dalla regia Docente OS;
- principio «Riutilizza | Adatta | Crea nuova».

Dopo ADR-010, il primo slice raccomandato è R3-F0.

### Assurance TypeSafe

TRAMA-SA-01 resta separato dal percorso prodotto. Il provider è advisory-only e il one-shot HOLDOUT non deve partire finché il gate non garantisce input autorizzato, consumo unico e conservazione dell'evidenza in caso di errore.

## Sequenza di lavoro

1. chiusura del debito documentale e delle PR superate;
2. consolidamento del gate TypeSafe R3B senza eseguire il HOLDOUT;
3. review umana di ADR-010 / Atlas integrale;
4. avvio di R3-F0 come slice separato;
5. collaudo umano integrato ECO-02/P1;
6. solo dopo le evidenze, valutazione di ulteriori runtime cross-product.

## Non autorizzato da questo checkpoint

- attivazione di DOS-A1;
- pubblicazione automatica Docente OS → Atlas;
- OutcomeAggregateSnapshot;
- autenticazione studenti;
- motori Officina materiali in runtime;
- chiusura automatica di ECO-02/P1;
- promozione di TypeSafe a gate decisionale.
