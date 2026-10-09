# TRAMA-TERM-01 — Ricevuta di integrazione cross-ecosystem

**Stato:** INTEGRATED / HUMAN_REVIEW_APPROVED / MANUAL_MERGE_COMPLETE  
**Data:** 2026-10-09

## Decisione consolidata

Il dominio scolastico italiano usa come vocabolario canonico **curricolo / curricolo di istituto**. Le forme inglesi legacy restano ammesse esclusivamente dove necessarie per compatibilità tecnica, contratti v1, persistenza, identificatori infrastrutturali o evidenze storiche governate.

I guardrail anti-regressione coprono sia il termine inglese principale sia la sua forma aggettivale, senza distinzione tra maiuscole e minuscole.

## Integrazioni completate

| Componente | PR | Head qualificato | Merge commit | Destinazione |
| --- | --- | --- | --- | --- |
| TRAMA / Studio Atlas | #263 | `2a8dffa09b8dd24b70e87e011fc23cd2f1c20b6e` | `3a105bcc77c1e80f5fa8d11fd12139c77b49195f` | `main` |
| Arena | #346 | `926d13bc37cd083b04f7903e63cb031c98de090b` | `189ebe9da05c737c37654a450adf46910888e25e` | `main` |
| Atlas | #82 | `b43840a7bbb66f7143a1800e0d005845e3ac5ec4` | `c322b07a68d4508ec437941f8688012765e88848` | `main` |
| Docente OS | #699 | `fc31bdceb79c5d8a0552b9cbd16ed88580b96e9d` | `c945190857feccf8bbee4356029ff93550b6b659` | `develop` |

Tutti i merge sono stati eseguiti manualmente con controllo dell'exact head; nessun auto-merge è stato usato.

## Evidenze pre-integrazione

Prima dei merge risultavano verdi, sugli exact head sopra indicati:

- TRAMA: 17/17 workflow PASS;
- Arena: 8/8 workflow PASS;
- Atlas: 13/13 workflow PASS;
- Docente OS: tutti i workflow applicabili PASS, inclusi Product CI, Human Interaction Model e TRAMA TERM-01 Curricolo Vocabulary.

## Compatibilità preservata

- Arena resta l'unica autorità istituzionale sul curricolo;
- Atlas resta proiezione/navigazione e non fonte di autorità;
- Docente OS resta workspace operativo del docente;
- nessun contratto v1 è stato rinominato in place;
- nessuna tabella, RPC, payload wire o chiave persistita legacy è stata rinominata distruttivamente;
- gli identificatori pubblicati v1, i riferimenti di versione già in uso e lo slug storico del repository Atlas restano compatibility surface finché non esiste una transizione governata;
- DOS-A1 resta `RUNTIME_DEFERRED`.

## Debito legacy governato

- Atlas: 210 occorrenze residue classificate, 0 non classificate;
- Docente OS: baseline legacy congelata a 1494 occorrenze; il guard impedisce crescita del debito;
- TRAMA e Arena conservano debito storico/tecnico preesistente, ma i guard diff-aware impediscono nuove introduzioni non autorizzate del lessico inglese legacy.

## Relazione con le receipt precedenti

Le receipt che riportano stati come `HUMAN_REVIEW_REQUIRED / NO_MERGE` restano **evidenze storiche pre-integrazione** e non vengono riscritte retroattivamente. La presente ricevuta registra lo stato successivo e prevale come evidenza di closeout dell'integrazione TRAMA-TERM-01.

## Residuo infrastrutturale chiuso

La descrizione GitHub del repository Atlas è stata allineata a **“Atlas — visualizzatore intelligente del curricolo di istituto”** il 2026-10-09, senza rinominare il repository né modificare URL, GitHub Pages path, branch predefinito o impostazioni di accesso. La rinomina fisica del repository resta differita e richiederà una transizione governata separata.
