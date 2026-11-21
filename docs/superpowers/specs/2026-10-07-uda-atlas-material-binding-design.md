# UDA → Lezione → Studio Atlas → Materiali → Lezione — design v0.3

## Stato

**DESIGN APPROVED IN CHAT / WRITTEN SPEC AWAITING HUMAN REVIEW**

La v0.3 sostituisce la v0.2 dopo due finding emersi nella Human Review reale:

- **HR-03 — MATERIAL_CONTENT_NOT_VIEWABLE**: il materiale associato deve contenere un artefatto reale, controllabile e riapribile;
- **HR-04 — LESSON_ALIGNMENT_NOT_GUARANTEED**: la coerenza con UDA, classe e disciplina non basta; il materiale deve essere preparato per una lezione target già nota prima della materializzazione.

## Scopo

Il flusso canonico diventa:

**curricolo/UDA → lezione target → obiettivo ed esiti della lezione → materiale → preview → binding alla stessa lezione → riapertura**.

Il criterio di successo è:

**scegli la lezione → prepara materiale coerente con quella lezione → controlla il contenuto → associa alla stessa lezione → riapri dalla lezione**.

## Autorità

- **Arena** resta autorità curricolare.
- **Docente OS** resta autorità su classe/sezione, piano annuale, UDA, lezione canonica, stato della lezione e binding persistente.
- **Studio Atlas** resta ambiente specialistico di proposta, materializzazione e preview del materiale di lavoro.
- **TRAMA** governa contratto cross-product, versionamento, gate e invarianti.
- Il **docente** sceglie la lezione, controlla i materiali e decide il binding.
- Generazione, preview, binding e pubblicazione restano fasi separate.
- Il binding alla lezione non equivale a pubblicazione Atlas.
- Nessuna pubblicazione automatica viene introdotta.

La soluzione resta coerente con `docs/contracts/r4-p1-entry-contract.md`: produzione specialistica → anteprima/confronto → collegamento esplicito alla lezione → eventuale pubblicazione separata.

## Decisione architetturale

Si adotta:

**Lezione target prima di Atlas + LessonMaterialBrief canonico + artefatto strutturato + preview Studio Atlas + viewer Docente OS**.

Non vengono introdotti:

- database paralleli dei materiali;
- backend Atlas dedicato alle bozze;
- nuovi account;
- nuovi secret o provider esterni;
- URL pubblici fittizi per bozze locali.

La persistenza del materiale associato resta nel modello canonico già usato da Docente OS (`LessonDesignExtension`).

## Invariante di allineamento

Un materiale è `lesson-aligned` soltanto se:

1. Docente OS identifica una lezione target canonica **prima** dell'apertura di Atlas;
2. esiste una proiezione runtime approvata per quella lezione;
3. il brief Atlas deriva dalla proiezione senza inventare obiettivi o criteri;
4. Atlas materializza il contenuto usando quel brief;
5. il bundle restituisce la stessa identità lezione e lo stesso `briefFingerprint`;
6. Docente OS verifica identità e fingerprint al ritorno;
7. il binding è consentito soltanto alla stessa lezione target.

Se una condizione manca, il materiale non può essere rappresentato come pronto per il binding.

## Fonte canonica della lezione

Docente OS riusa la proiezione runtime già esistente.

`resolveRuntimeHumanTaskLessonProjection(...)` restituisce una `HumanTaskLessonProjection` approvata con almeno:

- `projectionId`, `grade`, `blockId`;
- `udaCode`, `udaTitle`;
- `packCode`, `period`;
- `title`, `durationMinutes`;
- `why`, `objective`, `outcomes[]`;
- `evidence`, `observation[]`, `assessmentNote`;
- `steps[]`, `resources[]`, `preparation[]`;
- `sourceAlignment`, `sources[]`.

La v0.3 **non crea una seconda definizione di lezione o obiettivo**. Costruisce un brief compatto da questa proiezione canonica.

Se una UDA contiene blocchi senza proiezione runtime approvata, tali blocchi non vengono offerti come target Atlas in questa slice.

## UX: scelta della lezione prima di Atlas

### Lezione già nota

Se il docente arriva da una workspace/focus che contiene `sectionId + blockId`, Docente OS:

- mostra la lezione target;
- mostra titolo e obiettivo;
- precompila il target;
- abilita **Prepara materiali con Atlas** senza seconda selezione.

### UDA aperta dalla classe ma senza blockId

Docente OS mostra **Per quale lezione?** con le sole lezioni:

- della stessa sezione;
- della stessa UDA;
- coperte da una proiezione runtime approvata.

Ogni opzione mostra almeno titolo, periodo/posizione quando utile e obiettivo sintetico.

La CTA **Prepara materiali con Atlas** resta disabilitata finché non viene scelta una lezione.

### Manca il contesto classe

Atlas non si apre. L'utente riceve un'azione comprensibile per scegliere/aprire la classe, senza messaggi tecnici.

## LessonMaterialBrief v0.1

Schema:

`docente-os.lesson-material-brief/v0.1`

Il contratto è tipizzato e privo di dati studente.

### Identità

- `source = docente-os`;
- `sectionId`;
- `sectionLabel`;
- `grade`;
- `discipline`;
- `udaId`;
- `udaTitle`;
- `blockId`;
- `projectionId`;
- `packCode`;
- `period`.

### Intento didattico

- `lessonTitle`;
- `durationMinutes`;
- `why`;
- `objective`;
- `outcomes[]`;
- `evidence`;
- `observation[]`;
- `assessmentNote`.

### Riferimenti

- `sourceRefs[]`: riferimenti canonici **compatti** necessari a provenance/allineamento, preferibilmente codici e ruoli; non copie indiscriminate di documenti o URL;
- `returnUrl`: callback allowlistata verso Docente OS;
- `briefFingerprint`.

Non attraversano il contratto:

- identificatori di workspace non necessari al target didattico;
- dati personali degli studenti;
- risposte, profili, livelli individuali o note nominative.

## Riduzione controllata del brief

La `HumanTaskLessonProjection` completa può essere più ricca del necessario. Il brief non deve copiarla integralmente.

Per la prima slice bastano i campi sopra perché consentono di allineare i materiali a:

- tema della lezione;
- obiettivo;
- esiti attesi;
- evidenza richiesta;
- criteri di osservazione/valutazione;
- durata e collocazione nel percorso.

`steps[]`, `resources[]`, `preparation[]` e altri dettagli restano in Docente OS salvo prova, attraverso test, che un artefatto necessiti davvero di quei dati. Non si allarga il contratto preventivamente.

## briefFingerprint

Docente OS calcola un fingerprint deterministico del brief normalizzato.

Include almeno:

- `sectionId`;
- `udaId`;
- `blockId`;
- `projectionId`;
- `lessonTitle`;
- `objective`;
- `outcomes`;
- `evidence`;
- `observation`;
- `assessmentNote`.

Studio Atlas non modifica il fingerprint e lo restituisce nel bundle.

Al ritorno Docente OS ricostruisce il brief corrente della stessa lezione:

- fingerprint uguale → binding consentito;
- fingerprint diverso → fail-closed: **La lezione è cambiata dopo la preparazione dei materiali. Aggiorna i materiali prima di associarli.**

Il fingerprint è un controllo di coerenza, non una firma di sicurezza e non attribuisce autorità ad Atlas.

## Handoff verso Studio Atlas

Per questo flusso il precedente contesto UDA-only viene sostituito dal `LessonMaterialBrief`.

Atlas riceve un brief completo e validato; non richiede nuovamente classe, UDA o lezione.

La UI Atlas mostra sempre **Materiali per questa lezione** con almeno:

- classe;
- UDA;
- titolo lezione;
- obiettivo.

Il docente può quindi verificare il target prima della materializzazione.

## MaterialBundle v0.3

Schema:

`studio-atlas.material-bundle/v0.3`

Campi:

- `source = studio-atlas`;
- `bundleId`;
- `generatedAt`;
- `sourceUdaId`;
- `targetLesson`;
- `briefFingerprint`;
- `items[]`.

### targetLesson

- `sectionId`;
- `sectionLabel`;
- `blockId`;
- `projectionId`;
- `lessonTitle`.

`targetLesson` è immutabile nel bundle restituito.

## MaterialBundleItem v0.3

Ogni item contiene:

- `materialId`;
- `type`;
- `title`;
- `description`;
- `origin = atlas`;
- `targetBlockId`;
- `briefFingerprint`;
- `artifact`;
- `provenance`;
- `publicUrl?`.

Un item privo di `artifact`, `targetBlockId` o `briefFingerprint` non è valido.

`publicUrl` è opzionale e indica soltanto una risorsa realmente pubblicata in Atlas; non viene inventato per una bozza.

## MaterialArtifact v0.1

### Presentazione

`kind = presentation`, con almeno 3 slide non vuote (`slideId`, `title`, `body[]`, `speakerNote?`).

La presentazione sviluppa **l'obiettivo della lezione**, non un riassunto generico dell'intera UDA.

### Scheda di lavoro

`kind = worksheet`, con almeno 2 attività (`taskId`, `prompt`, `responseMode`, `support?`).

Le attività esercitano almeno uno degli `outcomes` e, quando pertinente, producono l'`evidence` prevista.

### Guida

`kind = guide`, con almeno 2 sezioni (`sectionId`, `heading`, `paragraphs[]`, `callout?`).

La guida sostiene l'obiettivo e i concetti necessari alla lezione target, non diventa un manuale generico dell'UDA.

### Rubrica

`kind = rubric`, con almeno 2 criteri e almeno 3 livelli per criterio.

I criteri derivano prioritariamente da `observation[]`, `evidence` e `assessmentNote`. Criteri ulteriori devono essere marcati come proposta, non come parte della baseline.

## Provenance v0.2

Ogni item conserva almeno:

- `producer = studio-atlas`;
- `sourceUdaId`;
- `targetBlockId`;
- `projectionId`;
- `briefFingerprint`;
- `generationMode = deterministic-template | assisted | imported | adapted`;
- `sourceRefs[]`;
- `createdAt`.

La prima implementazione può usare `deterministic-template` per produrre artefatti reali senza provider esterno. Il risultato non viene presentato come generazione AI né come materiale pubblicato.

## Regole di materializzazione lesson-first

Per ogni materiale Atlas usa il `LessonMaterialBrief` come boundary obbligatorio.

Regole minime:

1. `lessonTitle` e `objective` sono riconoscibili nel materiale;
2. almeno un `outcome` è concretamente coperto;
3. worksheet e rubric mantengono un legame verificabile con `evidence` e/o `observation`;
4. il materiale non si allarga all'intera UDA se il brief riguarda una singola lezione;
5. se il brief non basta per un artefatto, Atlas lo dichiara e non produce un placeholder `COMPLETED`;
6. un template che cambia soltanto il titolo non è considerato materializzazione lesson-specific.

## Preview Studio Atlas

Flusso:

1. valida `LessonMaterialBrief`;
2. mostra lezione e obiettivo;
3. docente sceglie i tipi di materiale;
4. Atlas materializza gli artefatti;
5. mostra **Controlla i materiali** con contenuto reale;
6. il docente può escludere un materiale o tornare alla selezione;
7. Atlas produce `MaterialBundle v0.3` soltanto per artefatti validi;
8. CTA unica **Continua con N materiali**.

La preview mostra sempre il riferimento alla lezione target.

## Ritorno in Docente OS

Il ritorno **non** presenta più un selettore libero di lezione.

Mostra:

- **Materiali preparati per**;
- classe;
- titolo della lezione target;
- UDA;
- elenco materiali;
- CTA **Associa a questa lezione**.

Prima della CTA Docente OS verifica:

- sezione esistente e appartenente al contesto corrente;
- `blockId` appartenente alla stessa UDA;
- `projectionId` corrente;
- `briefFingerprint` corrente;
- artefatti validi.

Il binding è consentito soltanto alla lezione target del bundle.

## Cambio della lezione target

Il docente può cambiare idea, ma non può spostare silenziosamente materiale preparato per un'altra lezione.

Azione secondaria consentita: **Prepara per un'altra lezione**.

Questa azione:

- non modifica il bundle esistente;
- non associa i materiali;
- torna alla scelta della lezione;
- richiede nuova materializzazione o, in una futura slice, un adattamento esplicito.

Nella v0.3 non esiste rebinding cross-lesson senza adattamento.

## Persistenza Docente OS

Dopo **Associa a questa lezione**, Docente OS continua a usare `LessonDesignExtension` e il repository canonico esistente.

Il payload Atlas include almeno:

- `bundleId`;
- `materialId`;
- `materialType`;
- `sourceUdaId`;
- `targetBlockId`;
- `projectionId`;
- `briefFingerprint`;
- `artifact`;
- `provenance`;
- `publicUrl?`.

Nessuna nuova tabella o repository parallelo.

Il `body` dell'estensione resta una sintesi leggibile; l'artefatto vive nel payload tipizzato.

La deduplica include almeno `targetBlockId + materialId`.

## Viewer Docente OS

In **Materiali allegati**, ogni nuovo materiale valido offre **Apri**.

`Apri` apre un viewer Docente OS autenticato e contestuale alla lezione.

Il viewer:

- recupera l'estensione della lezione corrente;
- verifica `targetBlockId` e ownership;
- valida `artifact` e `materialType`;
- mostra contenuto, titolo e provenienza;
- mostra **Preparato per: <titolo lezione>**;
- consente di tornare alla lezione;
- non espone ID tecnici come contenuto primario.

Se esiste un `publicUrl` reale, può comparire anche **Apri su Atlas**.

### Presentazione

Slide verticali su mobile, numerazione chiara, note docente separate.

### Scheda di lavoro

Attività leggibili e stampabili; nessuna raccolta di risposte studente.

### Guida

Struttura editoriale lineare con sezioni e callout.

### Rubrica

Criteri e livelli accessibili; su mobile i livelli diventano blocchi verticali quando necessario.

## Trasporto

Il fragment URL versionato può restare l'adapter iniziale: nessun secret, nessun backend server-to-server, nessun dato studente.

L'implementazione deve però misurare la dimensione reale di:

- `LessonMaterialBrief`;
- bundle con un artefatto;
- bundle con quattro artefatti minimi validi.

Se il payload realistico supera il limite sicuro scelto e testato, il lavoro si ferma e propone un adapter distinto. Non è autorizzato:

- aumentare arbitrariamente il limite;
- introdurre storage nascosto;
- spostare contenuto didattico in query string come scorciatoia.

## Errori fail-closed

Devono essere distinti almeno:

- UDA senza classe;
- UDA senza lezione runtime coperta;
- lezione target non valida;
- `LessonMaterialBrief` malformato;
- mismatch sezione/UDA/block/projection;
- `briefFingerprint` obsoleto;
- artefatto non materializzato o malformato;
- bundle troppo grande;
- errore di persistenza;
- materiale associato non più decodificabile.

Nessuno di questi stati può apparire come completamento riuscito.

## Sicurezza e privacy

- nessun dato studente;
- nessun wildcard origin;
- callback allowlistata;
- nessun token/API key nel browser;
- nessun nuovo secret;
- nessun HTML arbitrario nel contratto;
- artefatti come dati strutturati tipizzati;
- viewer senza markup non fidato;
- nessuna telemetria aggiuntiva richiesta.

## Accessibilità

Target: WCAG 2.2 AA.

Minimo:

- heading semantici;
- controllo da tastiera;
- stato selezionato non affidato al colore;
- target touch >= 44 px;
- focus visibile;
- errori percepibili;
- nessun overflow orizzontale obbligatorio per rubriche/presentazioni su mobile;
- contenuti leggibili da tecnologie assistive.

## Compatibilità

### Legacy v0.1

I binding metadata-only già creati restano leggibili come legacy ma non mostrano **Apri** se manca un artefatto.

### v0.2 non implementata

La v0.2 della specifica è superseded dalla v0.3 prima della sua implementazione completa. Non si introduce un runtime `MaterialBundle v0.2` solo per compatibilità con un design non qualificato.

### Nuovo runtime

I nuovi materiali lesson-aligned usano `LessonMaterialBrief v0.1` e `MaterialBundle v0.3`.

## Non-obiettivi

- export PPTX/PDF/DOCX;
- editor ricco completo;
- provider AI esterno;
- Visual Factory live obbligatoria;
- storage Atlas persistente delle bozze;
- pubblicazione/condivisione automatica;
- account studente;
- raccolta risposte studenti;
- personalizzazione individuale;
- modifica curricolo Arena;
- adattamento automatico cross-lesson;
- DOS-A1.

## Test e qualificazione

### Docente OS — scelta lezione e brief

TDD obbligatorio:

- dalla UDA mostra soltanto lezioni della stessa UDA/sezione con proiezione runtime approvata;
- preselect del block quando già presente nel contesto;
- CTA Atlas disabilitata senza target;
- costruzione `LessonMaterialBrief` dalla proiezione canonica;
- nessun obiettivo inventato;
- fingerprint deterministico;
- nessun dato studente;
- envelope browser-safe.

### Studio Atlas

TDD obbligatorio:

- validazione `LessonMaterialBrief`;
- rendering lezione/obiettivo;
- schema `MaterialBundle v0.3`;
- validazione dei quattro artifact;
- materializzazione lesson-specific;
- worksheet/rubric coerenti con evidence/observation;
- preview reale;
- rifiuto metadata-only;
- propagazione immutata di target/fingerprint;
- limite dimensione envelope;
- typecheck/build.

### Docente OS — ritorno e binding

TDD obbligatorio:

- decode/validate `MaterialBundle v0.3`;
- nessun selettore libero di lezione al ritorno;
- verifica section/UDA/block/projection/fingerprint;
- rifiuto bundle per altra lezione;
- persistenza artifact nel repository canonico;
- nessun binding prima della conferma;
- viewer per quattro tipi;
- ownership lezione/materiale;
- legacy v0.1 senza falso **Apri**;
- feedback percepibile;
- Product CI, Design Policy, HVA, WCAG/browser certification.

### Journey exact-head

Caso positivo:

**UDA 1A → scegli lezione canonica → Atlas mostra titolo+obiettivo della stessa lezione → seleziona 4 materiali → preview lesson-aligned → continua → Docente OS mostra la stessa lezione → associa → Materiali allegati → Apri ciascun materiale → contenuto visibile e riferito alla stessa lezione**.

Caso negativo:

**prepara materiali → cambia proiezione/fingerprint o tenta un target diverso → binding rifiutato fail-closed**.

Nessun provider esterno è richiesto dal test.

## Criteri di accettazione

La funzione è completa soltanto se:

- il docente sceglie la lezione prima di Atlas;
- la lezione deriva da una proiezione runtime canonica;
- Atlas riceve obiettivo/esiti/evidenza della lezione target;
- i materiali sono realmente materializzati;
- il docente li controlla prima del ritorno;
- il bundle è vincolato alla stessa lezione tramite identità + fingerprint;
- Docente OS non consente rebinding silenzioso ad altra lezione;
- il binding usa la persistenza canonica;
- ogni nuovo materiale è riapribile tramite **Apri**;
- il viewer mostra contenuto reale e target lesson;
- il flusso funziona senza provider/secret aggiuntivi;
- tutti i gate automatici exact-head sono PASS;
- Human Review mobile e desktop verifica coerenza didattica, contenuto e riapertura;
- nessun merge/deploy production avviene prima della decisione umana.

## Stato Human Review

**REWORK**.

Evidenze già acquisite:

- UDA → Atlas: PASS;
- selezione materiali: PASS;
- ritorno Atlas → Docente OS: PASS;
- associazione alla lezione: PASS;
- comparsa in **Materiali allegati**: PASS;
- contenuto realmente visualizzabile: **FAIL / HR-03**;
- coerenza con la singola lezione preparata prima della generazione: **NON GARANTITA / HR-04**.

La v0.3 chiude HR-03 e HR-04 soltanto quando il journey lesson-first completo viene verificato su exact head.
