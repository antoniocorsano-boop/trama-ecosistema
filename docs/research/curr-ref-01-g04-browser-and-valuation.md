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

## 3. Pacchetto autonomo G04 e tracciamento della produzione
**Confezionato e verificato** [nella PR #801 di Docente OS](https://github.com/antoniocorsano-boop/docente-os-2026-27/pull/801), revisione `5c883687f02dc2eeda9cc368ef3048a345c81a13` ([Product CI PASS](https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/44680662326)).
Il pacchetto `G04-prova-offline-DocenteOS` è l'artefatto numero `14604146864` del controllo GitHub e contiene un solo file HTML eseguibile offline generato **dal componente React G04 reale** (non una seconda implementazione), il manifesto di provenienza e le istruzioni per Android. La procedura verifica la firma SHA-256, il montaggio effettivo in Chromium e l'interazione di selezione/conferma; 160 prove di prodotto e quattro configurazioni Chromium risultano positive.

- SHA-256 ZIP: `967a084236c28748cb8f970071f9f4193e28bb1cb62c6c1f90384b8cc97c6ce0`;
- SHA-256 HTML: `69a33b1adc379f7994247b2aad77a0f360bbfad08642047c3d3b0c6b7b373622`;
- [Registro strutturato di coordinamento](curr-ref-01-g04-coordination.json), che distingue fonte, riferimento editoriale, componente dimostrativo e contratto locale di valutazione.

**Stato di coordinamento:** i riferimenti sono tracciati e il componente di Docente OS è stato effettivamente riusato; non esiste un trasferimento runtime di criteri confermati verso Registro. La conferma nella pagina non è una conferma valutativa, il master Arena 1.3 non è vigente, l'uso su smartphone fisico deve ancora essere verificato. Il pacchetto non è una distribuzione dell'app e non richiede accesso ai dati scolastici.

## 4. Decisione successiva
La prossima lavorazione non è un'altra matrice teorica: è il **collaudo autenticato su un ambiente dimostrativo isolato**, con schermate 320/390 px e verifica manuale su smartphone, seguito dalla decisione su un'eventuale funzione di anteprima nel Registro. Non eseguire prove collegate alla base Supabase reale, non modificare rami paralleli DOC-01/VAL-01 e non far passare dati individuali dall'applicazione.

Stato di integrazione: **candidato tecnico; distribuzione e ricezione nel Registro non autorizzate**. Il riesame professionale E-R4 rimane aperto.

## 5. G04e — Semplificazione su mobile dopo la prova Android

È stata modificata **la stessa componente Docente OS `G04CriteriaPanel`**, non è stata costruita una seconda interfaccia né un nuovo sistema di valutazione. I due criteri della lezione B25, i loro testi originali e le evidenze attese restano integralmente disponibili; al primo ingresso sono mostrati i titoli, mentre le descrizioni complete si espandono su richiesta.

- Gerarchia compatta «Cosa vuoi osservare?» → due caselle → conferma e stato, con ingombro verticale verificato in Chromium a 320/390 px e ingrandimento simulato al 200%.
- Eliminati gli avvisi ripetuti dal documento offline. Conservata la dichiarazione breve e visibile di **nessun salvataggio, voto o invio al Registro**; la provenienza e i limiti istituzionali rimangono espandibili.
- Denominazione corretta: «Riferimento curricolare locale proposto: confrontare soluzioni (competenza candidata)», **non** «nucleo fondante».
- Comportamento invariato: scelta in memoria della pagina, conferma esplicita, revoca se cambia la selezione, nessun utilizzo di identificativi di studenti, nessuna promozione del master Arena.

**Evidenza tecnica:** [Product CI Docente OS 44687998879](https://github.com/antoniocorsano-boop/docente-os-2026-27/actions/runs/44687998879) **PASS**; 160/160 prove applicative, 4/4 configurazioni del navigatore, controllo del file HTML autonomo e dell'impronta SHA-256. Il nuovo pacchetto `G04-prova-offline-DocenteOS`, artefatto GitHub `14606948888`, contiene la prova v1.1. SHA-256 HTML `24049d21cc84dcaa22828d1ef7a9161213820af6aff4b9f3e9296352c22aee5b`; SHA-256 ZIP `3e0ac38537d326c414207b36e8a37e0a150add4bcbc6522f6cf4213985afbbf4`.

[Registro strutturato delle revisioni e delle responsabilità](curr-ref-01-g04-coordination.json). Le immagini Android precedenti riguardano **la versione 1.0** e non valgono come collaudo su dispositivo fisico della nuova versione compatta 1.1. Quest'ultima richiede un controllo manuale su telefono, soprattutto leggibilità delle descrizioni espandibili e posizione del pulsante di conferma.

**Stato di integrazione:** PR #801 ancora in bozza, PR TRAMA #348 aperta; nessun collegamento di dati con Registro Docente, nessun rilascio operativo, nessuna adozione curricolare automatica.
