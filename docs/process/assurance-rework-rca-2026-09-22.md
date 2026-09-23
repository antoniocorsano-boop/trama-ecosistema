# RCA — Rework ripetuto nei gate di assurance TRAMA

**Data:** 2026-09-22  
**Ambito:** TRAMA-PW-01 e processo di sviluppo dei gate cross-product  
**Stato:** azioni preventive incorporate nel processo

## Sintomo

Una regola corretta a livello di prodotto — ogni write deve produrre feedback percepibile — è stata prima verificata solo indirettamente dai gate esistenti, poi trasformata troppo rapidamente in un nuovo gate euristico e propagata a più repository. Review successive hanno trovato casi non coperti e falsi positivi, causando rilavorazioni e rilanci CI evitabili.

## Cause radice

1. **Il requisito era documentato ma non eseguibile.** HVA/Human Interaction verificavano molte proprietà, ma non esisteva un'invariante automatica write → feedback.
2. **Il primo classifier è stato progettato sul caso osservato, non su una matrice avversariale.** Mancavano in partenza HTTP mutations, deletion regression, read-only form e cross-file mismatch.
3. **Rollout simultaneo prematuro.** La prima implementazione è stata replicata su più prodotti prima di essere stress-testata su un canary.
4. **Evidenza non legata alla singola write.** Keyword globali potevano produrre falsi PASS.
5. **Trigger incompleti.** Un gate corretto non serve se il workflow non parte su tutte le superfici pertinenti.
6. **Fail-closed incompleto.** Il run manuale poteva risultare verde senza base/head.
7. **Costo di assurance non stratificato.** Modifiche a un gate statico potevano attivare suite più costose prima che il gate stesso fosse stabile.

## Correzioni strutturali

- TRAMA-PW-01 ha un manifest di superfici: ogni mutation modificata deve legarsi a **una e una sola** superficie dichiarata.
- Ogni superficie dichiara file di feedback e test; la loro rimozione invalida il gate.
- Il classifier riconosce HTTP mutations, persistence e marker espliciti; i form read-only non sono mutation per il solo markup.
- Parole generiche come `error`, `success`, `pending` non costituiscono evidenza UI.
- I workflow dedicati girano su ogni PR e richiedono base/head anche in dispatch manuale.
- Il classifier ha self-test avversariali prima dell'enforcement.
- L'audit del codice storico è separato dalla protezione delle nuove/modificate superfici.
- Il rollout futuro segue **TRAMA → canary → review terza → altri prodotti**, mai replica simultanea della prima euristica.

## Regola di economia computazionale

Per un nuovo gate si usa il livello minimo sufficiente:

1. static check/classifier;
2. unit/self-test;
3. integration;
4. browser/E2E;
5. runtime/deploy.

Un livello superiore parte solo quando quello inferiore è stabile o quando il rischio richiede realmente quel livello.

## Stop rule

Non si promuove né si replica un nuovo gate se:
- la matrice avversariale non è completa;
- esiste un P1/P2 aperto sulla logica del gate;
- il self-test non copre almeno true positive, true negative, false-positive trap, false-negative trap, deletion e missing-context;
- il canary non ha review indipendente PASS.

## Effetto atteso

Ridurre il ciclo **implementa → CI costosa → review tardiva → correggi → rilancia** e spostare gli errori verso test statici/unitari economici, prima di browser, database e deploy.
