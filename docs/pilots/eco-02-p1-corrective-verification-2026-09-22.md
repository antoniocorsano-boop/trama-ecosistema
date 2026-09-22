# ECO-02/P1 — Verifica correttiva del 22 settembre 2026

**Stato:** EVIDENCE RECORDED / NOT FINAL COLLAUDO / PILOT STILL ACTIVE  
**Perimetro:** Tecnologia · 2C · B01 «Il territorio agricolo come sistema»

## Regola di validità

Questa sessione **non costituisce il collaudo umano finale** previsto dal runbook, perché durante la prova è stato necessario un intervento tecnico sul database Beta.

L'evidenza resta utile per:
- confermare il lifecycle P9;
- individuare difetti reali di prodotto/release;
- preparare il successivo collaudo pulito.

## Evidenze PASS osservate

- classe e lezione corrette riconoscibili;
- sequenza canonica preservata;
- proposta docente non adottata automaticamente;
- nuova proposta P9 visibile in «Da controllare»;
- prima conferma esplicita → ingresso nella sequenza;
- modifica di un elemento già accettato;
- invalidazione della precedente accettazione;
- ritorno a «Da controllare»;
- seconda conferma esplicita;
- versione modificata effettivamente visibile nella modalità lezione;
- nessun doppione percettivo dopo la seconda conferma;
- registrazione TeachingSession riuscita;
- minuti registrati separati dalla decisione di completamento;
- 100% della guida non equivale a completamento del blocco;
- completamento didattico richiesto come decisione professionale separata;
- nessun dato personale studente necessario o mostrato.

## Difetto tecnico emerso

Dopo lo scarto della proposta precedente, «Crea proposta» ha generato errore server:

- digest: `3652667202`;
- log Beta: `Lesson design proposal uniqueness conflict could not be resolved`.

Causa confermata:
- il codice applicativo conteneva già il comportamento P9 post-dismissal;
- il DB Beta non aveva applicato la migrazione canonica `0069_lesson_design_tool_reproposal_after_dismissal`;
- l'indice live continuava a deduplicare anche i record `DISMISSED`.

Correzione controllata eseguita sul solo Beta:
- applicata migrazione canonica 0069;
- verificato indice con clausola `status <> 'DISMISSED'`;
- Production non toccata.

Retest successivo: **PASS**.

## Drift DB ulteriore rilevato

L'audit della storia Beta 0060–0074 ha evidenziato anche l'assenza di:

- 0062 — teaching_adjustment_extension_kind;
- 0067 — dos_cal_01_knowledge_calendar_source;
- 0068 — dos_cal_01_link_integrity.

Quindi il watermark 0074, da solo, non dimostrava una lineage completa.

Follow-up Docente OS:
- PR #579 — Runtime Release migration lineage contract;
- startup e Runtime Health devono richiedere sia watermark esatto sia lineage completa;
- prima del merge/deploy devono essere riconciliate le migrazioni mancanti sul solo Beta.

## Rilievi UX P9

1. Nella vista «Nella sequenza», il contenuto della domanda accettata non era visibile finché non si apriva «Modifica».
2. «Frase · Evento · Micro-video · Domanda · Verifica rapida» apparivano come controlli interattivi pur essendo una legenda statica.

Follow-up Docente OS:
- PR #578 — testo effettivo visibile nella card accettata;
- legenda esplicita «Tipi previsti · non sono comandi».

## Configurazione cattedra

La schermata classe mostrava «Educazione civica — 2 h/settimana».

Audit Beta:
- tre assignment PROVISIONAL da 120 min/settimana su 1C, 2C, 3C;
- nessun riferimento da orario o adozioni librarie.

Correzione Beta:
- rimosse le sole tre assegnazioni provvisorie errate;
- Tecnologia resta CONFIRMED a 120 min/settimana;
- Educazione civica non viene sostituita con un altro falso carico settimanale.

## Stato del pilota

ECO-02/P1 resta **ACTIVE**.

Il collaudo finale potrà essere eseguito solo dopo:
1. integrazione e pubblicazione delle correzioni UX P9;
2. riconciliazione della lineage DB Beta e integrazione del nuovo Runtime Release Contract;
3. Runtime Health verde;
4. prova completa Arena → Docente OS → preparazione → decisione materiali → modalità lezione → registrazione, senza interventi tecnici durante il test.

Qualunque chiusura richiede ancora un rapporto umano finale e una distinta HUMAN EXACT-HEAD REVIEW.

## Invarianti

- Arena resta autorità curricolare;
- Docente OS resta workspace professionale;
- nessuna adozione automatica;
- nessun dato personale studente;
- DOS-A1 resta RUNTIME_DEFERRED;
- Production non è stata modificata.
