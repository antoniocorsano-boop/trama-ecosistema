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

ADR-010 è approvata e integrata. Sono quindi consolidati:
- Atlas integrale come atlante intelligente del curricolo;
- biblioteca come dominio di Atlas, non come sua definizione;
- Officina materiali separata dalla regia Docente OS;
- principio «Riutilizza | Adatta | Crea nuova».

R3-F0 è approvato, integrato e attivo come primo slice di prodotto/design Atlas. Il perimetro resta NO_RUNTIME e privacy-first, senza autenticazione/account studenti né profilazione individuale.

### Assurance TypeSafe

TRAMA-SA-01 resta separato dal percorso prodotto. Il provider è advisory-only. Il gate one-shot HOLDOUT è integrato con pin di contenuto, serializzazione, consumo durevole e conservazione dell'evidenza; il HOLDOUT non è stato eseguito.

## Sequenza di lavoro

1. debito documentale e PR superate: completato;
2. gate TypeSafe R3B integrato senza eseguire il HOLDOUT: completato;
3. ADR-010 / Atlas integrale: approvata e integrata;
4. R3-F0 Product & Design Foundation: approvato, integrato e attivo;
5. eseguire il collaudo umano integrato ECO-02/P1 usando il runbook canonico;
6. solo dopo le evidenze, valutare ulteriori runtime cross-product.

## Non autorizzato da questo checkpoint

- attivazione di DOS-A1;
- pubblicazione automatica Docente OS → Atlas;
- OutcomeAggregateSnapshot;
- account, login o autenticazione studenti in Atlas, esclusi dall'architettura privacy-first;
- profili, tracking o personalizzazione individuale degli studenti in Atlas;
- motori Officina materiali in runtime;
- chiusura automatica di ECO-02/P1;
- promozione di TypeSafe a gate decisionale.
