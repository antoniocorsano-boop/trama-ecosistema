# CURR-REF-01/G04 — Collaudo nel navigatore e riscontro del destinatario valutativo

**Stato:** prova automatizzata isolata; non è collaudo su telefono fisico né integrazione di Registro Docente. **Data:** 20 novembre 2026.

## 1. Implementazione concreta
[Docente OS PR #801](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/801), ramo `curr-ref-01/g04-observation-criteria-ui`: la schermata **Osserva** della lezione B25 presenta due criteri della proposta G03 e permette la loro selezione e una conferma **in memoria di pagina**. La conferma si annulla alla modifica della scelta e non è trasferita né conservata. Non cambia l'azione di registrazione della lezione, né importa dati personali, né calcola un esito valutativo. La proiezione viene mostrata solo se i principali identificativi e contenuti della fonte B25 coincidono; il master Arena v1.3 rimane provvisorio e non vigente.

[Prova Chromium automatizzata](https://github.com/antoniocorsano-boop/docente-os-2026-27/blob/curr-ref-01/g04-observation-criteria-ui/product/scripts/g04-browser-smoke.mjs): monta i componenti React effettivi e i fogli di stile della schermata in una pagina **temporanea isolata**, senza avviare l'applicazione autenticata e senza credenziali Supabase. Verifica selezione, conferma, revoca, struttura accessibile e assenza di ingombro orizzontale a 320 e 390 pixel, con zoom ordinario e simulato al 200%. La prima esecuzione completa della prova: [Product CI 44677992190](https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/44677992190) positiva, quattro configurazioni superate; la stessa procedura ha superato 160/160 prove. Successivi aggiornamenti di accessibilità e documentazione richiedono il controllo del nuovo stato CI. Un ingrandimento simulato non sostituisce la verifica del ridimensionamento caratteri su Android.

**Non ancora verificati:** intera navigazione con accesso autenticato, assistenti vocali e tecnologie assistive, smartphone fisico, comportamento effettivo con la dimensione caratteri impostata nel sistema, accettazione professionale dei due criteri. Nessun rilascio pubblico o impiego su dati reali.

## 2. Raccordo con il modello già presente in Registro Docente
L'analisi ha riletto, in sola consultazione, i seguenti file già esistenti:
- `src/assessment/assessmentEvidence.ts`, blob `29ae8d1d6b5c712192b41eadbce2fb1bf9e78de1`. Il contratto **AssessmentEvidenceV1** richiede `CriterionRevision` con `revisionId`, `confirmedByTeacher`, `confirmedAt` e i riferimenti alle revisioni di apprendimento; `AssessmentDefinitionRevision` mantiene `source: {kind:'explicit-activity', activityId}`, con data, periodo, stato e criteri;
- `src/assessment/assessmentRevisionBindings.ts`, blob `1d6f490a712ba29c2778535b9979d5335865ed9b`. Propone legami congelati fra revisioni locali ed evidenze, subordinati a conferme e all'identità delle verifiche; non crea un trasferimento esterno;
- `src/assessment/assessmentEvidenceProjection.ts`, blob `59fab229418fe8d55d8ab81a93a34e927118beb8`. La proiezione individuale resta interna al Registro e non certifica competenze;
- `src/planning/planningFrameResolver.ts`, blob `0c5dfcd837c8917646cc3bbc782b6915566df79e`. La cornice Arena autorevole richiede **APPROVED + VIGENTE**. Il master 1.3 non soddisfa questa condizione.

### Decisione di interoperabilità
Un'identità tecnica di lezione (`projectionId`, UdA e blocco) **non coincide automaticamente** con l'`activityId` locale del Registro. Analogamente la conferma temporanea del pannello G04 **non coincide** con `confirmedByTeacher` nelle revisioni valutative. Non creare oggetti `CriterionRevision` con date fittizie, né utilizzare `CR-G01-01/02` come revisioni già approvate. Le proposte devono essere riesaminate nel contesto della classe da un docente abilitato prima di acquisire lo stato richiesto dai contratti.

Il percorso praticabile resta circoscritto: **anteprima non personale dell'attività → scelta consapevole del docente → verifica del contesto locale nel Registro → eventuale acquisizione conforme e confermata di obiettivi e criteri → osservazioni individuali solo nel Registro**. Non è stato attivato alcuno di questi passaggi di acquisizione. Non serve un secondo sistema di valutazione né un archivio di osservazioni in TRAMA.

## 3. Decisione successiva
La prossima lavorazione non è un'altra matrice teorica: è il **collaudo autenticato su un ambiente dimostrativo isolato**, con schermate 320/390 px e verifica manuale su smartphone, seguito dalla decisione su un'eventuale funzione di anteprima nel Registro. Non eseguire prove collegate alla base Supabase reale, non modificare rami paralleli DOC-01/VAL-01 e non far passare dati individuali dall'applicazione.

Stato di integrazione: **candidato tecnico; distribuzione e ricezione nel Registro non autorizzate**. Il riesame professionale E-R4 rimane aperto.
