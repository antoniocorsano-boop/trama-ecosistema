# UDA → Lezione → Studio Atlas → Materiali → Lezione — design v0.3

## Stato

**DESIGN APPROVED IN CHAT / WRITTEN SPEC AWAITING HUMAN REVIEW**

Questa v0.3 sostituisce la v0.2 dopo un rilievo emerso nella Human Review: la sola coerenza con UDA, classe e disciplina non garantisce che il materiale sia adatto alla **singola lezione** alla quale verrà associato.

Finding associati:

- **HR-03 — MATERIAL_CONTENT_NOT_VIEWABLE**: il materiale associato deve contenere un artefatto reale, controllabile e riapribile;
- **HR-04 — LESSON_ALIGNMENT_NOT_GUARANTEED**: il materiale deve essere preparato per una lezione target già nota prima della materializzazione, non associato arbitrariamente dopo la generazione.

## Scopo

Rendere operativo un flusso teacher-first in cui il materiale nasce da una catena didattica esplicita e verificabile:

**curricolo/UDA → lezione target → obiettivo ed esiti della lezione → materiale → preview → binding alla stessa lezione → riapertura**.

Il criterio di successo non è soltanto «il materiale compare in Materiali allegati», ma:

**scegli la lezione → prepara materiale coerente con quella lezione → controlla il contenuto → associa alla stessa lezione → riapri dalla lezione**.

## Autorità

- **Arena** resta autorità curricolare per baseline, provenienza, versione e stato del curricolo.
- **Docente OS** resta autorità sul contesto operativo: classe/sezione, piano annuale, UDA, lezione canonica, stato della lezione e binding persistente dei materiali.
- **Studio Atlas** resta ambiente specialistico di proposta, materializzazione e preview del materiale di lavoro.
- **TRAMA** governa contratto cross-product, versionamento, gate e invarianti.
- Il **docente** decide quale lezione preparare, quali materiali tenere e se associarli.
- Nessun materiale viene collegato a una lezione per il solo fatto di essere stato generato o visualizzato.
- Il binding alla lezione non equivale a pubblicazione Atlas.
- Nessuna pubblicazione automatica viene introdotta.

Questa separazione è coerente con `docs/contracts/r4-p1-entry-contract.md`: produzione specialistica, anteprima e confronto, collegamento esplicito alla lezione e pubblicazione separata restano fasi distinte.

## Decisione architetturale v0.3

Si adotta:

**Lezione target prima di Atlas + LessonMaterialBrief canonico + artefatto strutturato + preview Studio Atlas + viewer Docente OS**.

La v0.3 non introduce:

- un database parallelo dei materiali;
- un nuovo backend Atlas per le bozze;
- un nuovo account;
- nuovi secret o provider esterni;
- URL pubblici fittizi per bozze locali.

La persistenza del materiale associato resta nel modello canonico già usato da Docente OS (`LessonDesignExtension`).

## Invariante di allineamento

Un materiale è considerato **lesson-aligned** soltanto se:

1. Docente OS ha identificato una lezione target canonica prima dell'apertura di Atlas;
2. esiste una proiezione runtime approvata per quella lezione;
3. il brief passato ad Atlas deriva da quella proiezione senza inventare obiettivi o criteri;
4. Atlas materializza il contenuto usando il brief della lezione target;
5. il `MaterialBundle` riporta la stessa identità lezione e lo stesso fingerprint del brief;
6. Docente OS verifica identità e fingerprint al ritorno;
7. il binding avviene soltanto alla stessa lezione target.

Se una di queste condizioni manca, il materiale non può essere rappresentato come pronto per il binding.

## Fonte canonica della lezione

La v0.3 riusa l'autorità già esistente in Docente OS.

Per una lezione coperta dal runtime, `resolveRuntimeHumanTaskLessonProjection(...)` restituisce una `HumanTaskLessonProjection` approvata. Il modello già contiene almeno:

- `projectionId`;
- `grade`;
- `blockId`;
- `udaCode`;
- `udaTitle`;
- `packCode`;
- `period`;
- `title`;
- `durationMinutes`;
- `why`;
- `objective`;
- `outcomes[]`;
- `preparation[]`;
- `steps[]`;
- `resources[]`;
- `evidence`;
- `observation[]`;
- `assessmentNote`;
- `continuation`;
- `sourceAlignment`;
- `sources[]`.

La v0.3 non crea una seconda definizione di obiettivo o lezione. Costruisce un brief compatto da questa proiezione canonica.

Se la UDA contiene blocchi per i quali non esiste una proiezione runtime approvata, tali blocchi non vengono offerti come lezione target per la preparazione Atlas in questa slice.

## UX: scelta della lezione prima di Atlas

La superficie UDA di Docente OS cambia ordine logico.

### Caso A — la lezione è già nel contesto

Se il docente arriva dalla workspace di una lezione o da un focus che contiene già `sectionId + blockId`, Docente OS:

- mostra la lezione target;
- mostra titolo e obiettivo in linguaggio leggibile;
- precompila il contesto;
- abilita **Prepara materiali con Atlas** senza una seconda selezione.

### Caso B — la UDA è aperta dal contesto classe ma senza blockId

Docente OS mostra **Per quale lezione?** con le sole lezioni canoniche della stessa UDA e della stessa sezione per cui esiste una proiezione runtime approvata.

Ogni opzione mostra almeno:

- titolo lezione;
- posizione/periodo quando utile;
- obiettivo sintetico.

La CTA **Prepara materiali con Atlas** resta disabilitata finché non viene scelta una lezione.

### Caso C — manca il contesto classe

Il sistema non apre Atlas. Offre un'azione comprensibile per scegliere/aprire la classe, evitando messaggi tecnici.

## LessonMaterialBrief v0.1

Nuovo contratto tipizzato e privo di dati studente.

`schema = docente-os.lesson-material-brief/v0.1`

Campi:

### Identità

- `source = docente-os`
- `workspaceContextRef` non esportato come dato sensibile; il contratto usa soltanto riferimenti operativi necessari al ritorno
- `sectionId`
- `sectionLabel`
- `grade`
- `discipline`
- `udaId`
- `udaTitle`
- `blockId`
- `projectionId`
- `packCode`
- `period`

### Intento didattico

- `lessonTitle`
- `durationMinutes`
- `why`
- `objective`
- `outcomes[]`
- `evidence`
- `observation[]`
- `assessmentNote`

### Riferimenti

- `sourceRefs[]` con soli riferimenti canonici necessari a provenance/allineamento;
- `returnUrl` allowlistata;
- `briefFingerprint`.

Non vengono inclusi dati personali degli studenti, risposte, profili, livelli individuali o note nominative.

## Riduzione controllata del brief

La `HumanTaskLessonProjection` completa può essere più ricca del necessario. Il `LessonMaterialBrief` non deve copiarla integralmente.

Per la prima slice sono sufficienti i campi sopra elencati perché consentono di costruire materiali coerenti con:

- tema della lezione;
- obiettivo;
- esiti attesi;
- evidenza richiesta;
- criteri di osservazione/valutazione;
- durata e collocazione nel percorso.

`steps[]`, `resources[]`, `preparation[]` e altri dettagli possono restare in Docente OS nella v0.3, salvo prova che un tipo di artefatto necessiti davvero di uno di tali campi. YAGNI: non si allarga il contratto senza un test che lo renda necessario.

## briefFingerprint

Docente OS calcola un fingerprint deterministico del brief canonico normalizzato.

Il fingerprint deve includere almeno:

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

### Scopo

Il fingerprint impedisce che un materiale preparato per una versione precedente della lezione venga associato silenziosamente dopo una modifica canonica significativa.

Al ritorno Docente OS ricostruisce il brief corrente della stessa lezione e confronta il fingerprint:

- uguale → binding consentito;
- diverso → fail-closed con messaggio: **La lezione è cambiata dopo la preparazione dei materiali. Aggiorna i materiali prima di associarli.**

Il fingerprint è un controllo di coerenza, non una firma di sicurezza e non attribuisce autorità ad Atlas.

## Teaching handoff verso Studio Atlas

La v0.3 sostituisce, per questo flusso, il precedente contesto UDA-only con il `LessonMaterialBrief`.

Studio Atlas deve ricevere un brief già completo e validato. Non deve chiedere nuovamente al docente di scegliere UDA, classe o lezione.

La UI Atlas mostra sempre un blocco **Materiali per questa lezione** con almeno:

- classe;
- UDA;
- titolo lezione;
- obiettivo.

In questo modo il docente può controllare visivamente che il materiale venga preparato per la lezione corretta prima ancora di selezionare il tipo di artefatto.

## MaterialBundle v0.3

Nuovo schema:

`schema = studio-atlas.material-bundle/v0.3`

Campi bundle:

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

Un item privo di `artifact`, `targetBlockId` o `briefFingerprint` non è un materiale v0.3 valido.

`publicUrl` è opzionale e indica esclusivamente una risorsa Atlas realmente pubblicata. Non viene inventato per una bozza.

## MaterialArtifact v0.1

`artifact` resta una discriminated union tipizzata.

### PresentationArtifact

- `kind = presentation`;
- `slides[]` con `slideId`, `title`, `body[]`, `speakerNote?`;
- minimo 3 slide non vuote.

La presentazione deve sviluppare **l'obiettivo della lezione**, non riassumere genericamente l'intera UDA.

### WorksheetArtifact

- `kind = worksheet`;
- `intro?`;
- `tasks[]` con `taskId`, `prompt`, `responseMode`, `support?`;
- minimo 2 attività non vuote.

Le attività devono esercitare almeno uno degli `outcomes` della lezione e produrre, quando pertinente, l'`evidence` prevista.

### GuideArtifact

- `kind = guide`;
- `sections[]` con `sectionId`, `heading`, `paragraphs[]`, `callout?`;
- minimo 2 sezioni non vuote.

La guida deve sostenere la comprensione dell'obiettivo e dei concetti necessari alla lezione target, non diventare un manuale generico dell'UDA.

### RubricArtifact

- `kind = rubric`;
- `criteria[]` con `criterionId`, `label`, `levels[]`;
- minimo 2 criteri e almeno 3 livelli per criterio.

I criteri devono derivare prioritariamente da `observation[]`, `evidence` e `assessmentNote`. È vietato introdurre criteri non riconducibili al brief senza marcarli come proposta separata.

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

Nella prima implementazione è ammesso `deterministic-template` per produrre artefatti reali senza provider esterno. Il risultato non deve essere descritto come generazione AI né come materiale pubblicato.

## Regole di materializzazione lesson-first

Per ogni tipo, Studio Atlas usa il `LessonMaterialBrief` come boundary obbligatorio.

Regole minime:

1. `lessonTitle` e `objective` devono essere riconoscibili nel materiale;
2. almeno un `outcome` deve essere concretamente coperto;
3. worksheet e rubric devono mantenere un legame verificabile con `evidence` e/o `observation`;
4. il materiale non deve allargarsi all'intera UDA quando il brief riguarda una singola lezione;
5. se il brief non contiene abbastanza informazioni per un tipo di artefatto, Atlas deve dichiararlo e non produrre un placeholder `COMPLETED`.

La materializzazione deterministica iniziale deve essere specifica per il brief. Un template che cambia soltanto il titolo non è sufficiente.

## Preview Studio Atlas

Il flusso diventa:

1. valida `LessonMaterialBrief`;
2. mostra contesto lezione e obiettivo;
3. docente sceglie i tipi di materiale;
4. Atlas materializza gli artefatti selezionati;
5. mostra **Controlla i materiali** con il contenuto reale;
6. il docente può escludere un materiale o tornare alla selezione;
7. Atlas produce `MaterialBundle v0.3` soltanto per artefatti validi;
8. CTA unica **Continua con N materiali**.

La preview deve mostrare il contenuto essenziale e il riferimento alla lezione target.

## Ritorno in Docente OS

Il ritorno non deve più presentare un selettore libero di lezione.

La pagina mostra:

- **Materiali preparati per**;
- classe;
- titolo della lezione target;
- UDA;
- elenco materiali;
- CTA **Associa a questa lezione**.

Docente OS verifica prima della CTA:

- sezione esistente e appartenente al workspace corrente;
- `blockId` appartenente alla stessa UDA;
- `projectionId` corrente;
- `briefFingerprint` corrente;
- artefatti validi.

Se i controlli passano, il binding è consentito soltanto alla lezione target del bundle.

## Cambio della lezione target

Il docente può cambiare idea, ma il sistema non deve riusare silenziosamente un materiale preparato per un'altra lezione.

La pagina di ritorno può offrire un'azione secondaria **Prepara per un'altra lezione**.

Questa azione:

- non modifica `targetLesson` nel bundle esistente;
- non associa i materiali;
- riporta alla scelta della lezione;
- richiede una nuova materializzazione o futura operazione esplicita di adattamento.

Nella v0.3 non esiste “sposta questi materiali su un'altra lezione” senza adattamento.

## Persistenza Docente OS

Dopo **Associa a questa lezione**, Docente OS continua a usare `LessonDesignExtension` e il repository canonico già esistente.

Per gli item Atlas, `payload` include almeno:

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

Non viene aggiunta una tabella o repository parallelo.

Il `body` dell'estensione resta sintesi leggibile; non sostituisce l'artefatto.

La deduplica deve includere almeno `targetBlockId + materialId`, mantenendo l'identità del materiale all'interno della lezione target.

## Viewer Docente OS

In **Materiali allegati**, ogni materiale v0.3 valido offre **Apri**.

`Apri` apre un viewer Docente OS autenticato e contestuale alla lezione.

Il viewer:

- recupera l'estensione associata alla lezione corrente;
- verifica `targetBlockId` e ownership della lezione;
- valida `artifact` e `materialType`;
- mostra titolo, contenuto e provenienza in linguaggio utente;
- mostra **Preparato per: <titolo lezione>**;
- consente di tornare alla lezione;
- non espone ID tecnici come informazione primaria.

Se `publicUrl` rappresenta una risorsa realmente pubblicata in Atlas, può comparire una seconda azione **Apri su Atlas**.

## Viewer per tipo

### Presentazione

Slide verticali su mobile, numerazione chiara, note docente separate dal contenuto principale.

### Scheda di lavoro

Attività leggibili e stampabili. Nessuna raccolta di risposte studente nella v0.3.

### Guida

Struttura editoriale lineare con sezioni e callout.

### Rubrica

Criteri e livelli accessibili; su mobile i livelli diventano blocchi verticali quando necessario, evitando tabelle larghe obbligatorie.

## Trasporto

Il fragment URL versionato può restare il transport adapter iniziale perché non richiede secret né backend server-to-server e non contiene dati studente.

Il payload v0.3 è però più ricco. L'implementazione deve misurare la dimensione reale di:

- `LessonMaterialBrief`;
- bundle con un materiale;
- bundle con quattro materiali minimi validi.

Se il payload realistico supera il limite sicuro scelto e testato, l'implementazione si ferma e propone un transport adapter separato. Non è autorizzato:

- aumentare arbitrariamente il limite;
- comprimere in modo opaco senza contratto;
- introdurre storage nascosto;
- passare a query string con contenuto didattico come scorciatoia.

## Errori e fail-closed

Devono essere distinti almeno:

- UDA senza classe;
- UDA senza lezione runtime coperta;
- lezione target non valida;
- `LessonMaterialBrief` malformato;
- mismatch `sectionId`;
- mismatch `udaId`;
- mismatch `blockId`;
- mismatch `projectionId`;
- `briefFingerprint` obsoleto;
- artefatto non materializzato;
- artefatto malformato;
- bundle troppo grande;
- errore di persistenza;
- materiale associato non più decodificabile.

Nessuno di questi stati può essere presentato come completamento riuscito.

## Sicurezza e privacy

- nessun dato studente;
- nessun wildcard origin;
- callback limitata alle origini Docente OS configurate;
- nessun token/API key nel browser;
- nessun nuovo secret richiesto;
- nessun HTML arbitrario nel contratto;
- artefatti come dati strutturati tipizzati;
- viewer Docente OS senza rendering di markup non fidato;
- nessuna telemetria aggiuntiva richiesta.

## Accessibilità

Target: WCAG 2.2 AA.

Minimo:

- heading semantici;
- controllo da tastiera;
- stato selezionato non affidato al colore;
- target touch >= 44 px;
- focus visibile;
- feedback di errore percepibile;
- nessun overflow orizzontale obbligatorio per rubriche/presentazioni su mobile;
- contenuto leggibile da tecnologie assistive.

## Compatibilità

### Legacy v0.1

I binding metadata-only già creati durante la Human Review restano leggibili come legacy ma non mostrano **Apri** se manca un artefatto.

### Design v0.2 non implementato

La v0.2 della specifica è superseded dalla v0.3 prima della sua implementazione completa. Non deve essere introdotto un nuovo runtime `MaterialBundle v0.2` solo per compatibilità con un design non ancora qualificato.

### Nuovo runtime

I nuovi materiali lesson-aligned usano `MaterialBundle v0.3` e `LessonMaterialBrief v0.1`.

## Non-obiettivi v0.3

- esportazione PPTX/PDF/DOCX;
- editor ricco completo;
- provider AI esterno;
- Visual Factory live obbligatoria;
- storage Atlas persistente delle bozze;
- pubblicazione automatica;
- condivisione pubblica;
- account studente;
- raccolta risposte studenti;
- personalizzazione per singolo studente;
- modifica del curricolo Arena;
- adattamento automatico a una lezione diversa;
- DOS-A1.

## Test e qualificazione

### Docente OS — lesson selection e brief

TDD obbligatorio:

- dalla UDA mostra soltanto lezioni della stessa UDA/sezione con proiezione runtime approvata;
- preselect del block quando già presente nel contesto;
- CTA Atlas disabilitata senza target lesson;
- costruzione `LessonMaterialBrief` dalla proiezione canonica;
- nessun obiettivo inventato;
- fingerprint deterministico;
- nessun dato studente;
- browser-safe envelope.

### Studio Atlas

TDD obbligatorio:

- validazione `LessonMaterialBrief`;
- rendering contesto lezione/obiettivo;
- schema `MaterialBundle v0.3`;
- validazione discriminata dei quattro artifact;
- materializzazione lesson-specific dei quattro tipi;
- worksheet/rubric coerenti con evidence/observation;
- preview reale prima del ritorno;
- rifiuto metadata-only;
- propagazione immutata di `targetLesson` e `briefFingerprint`;
- browser runtime senza dipendenze Node-only;
- limite dimensione envelope;
- typecheck/build.

### Docente OS — ritorno e binding

TDD obbligatorio:

- decode/validate `MaterialBundle v0.3`;
- nessun selettore libero di lezione al ritorno;
- verifica section/UDA/block/projection/fingerprint;
- rifiuto di bundle preparato per altra lezione;
- persistenza artifact nel repository canonico esistente;
- nessun binding prima della conferma;
- viewer per quattro tipi;
- ownership lezione/materiale;
- legacy v0.1 senza falso **Apri**;
- feedback percepibile;
- Product CI, Design Policy, HVA, WCAG/browser certification.

### Journey browser exact-head

Il journey di accettazione deve provare realmente:

**UDA 1A → scegli lezione canonica → Atlas mostra titolo+obiettivo della stessa lezione → seleziona 4 materiali → preview lesson-aligned → continua → Docente OS mostra la stessa lezione target → associa → Materiali allegati → Apri ciascun materiale → contenuto visibile e riferito alla stessa lezione**.

Deve inoltre esistere un caso negativo:

**prepara materiali → cambia la proiezione/fingerprint o tenta un target diverso → binding rifiutato fail-closed**.

Il journey non deve dipendere da provider esterni.

## Criteri di accettazione

La funzione è completa soltanto se:

- il docente sceglie la lezione prima di Atlas;
- la lezione è una proiezione runtime canonica, non una stringa libera;
- Atlas riceve obiettivo/esiti/evidenza derivati dalla lezione target;
- i materiali sono realmente materializzati;
- il docente li controlla prima del ritorno;
- il bundle è vincolato alla stessa lezione tramite identità + fingerprint;
- Docente OS non consente rebinding silenzioso ad altra lezione;
- il binding usa la persistenza canonica già esistente;
- ogni materiale nuovo è riapribile tramite **Apri**;
- il viewer mostra contenuto reale e la lezione per cui è stato preparato;
- il flusso funziona senza provider o secret aggiuntivi;
- tutti i gate automatici sull'exact head sono PASS;
- Human Review finale mobile e desktop verifica coerenza didattica, contenuto e riapertura;
- nessun merge/deploy production avviene prima della decisione umana.

## Decisione Human Review

Stato corrente: **REWORK**.

Evidenze già acquisite:

- UDA → Atlas: PASS;
- selezione materiali: PASS;
- ritorno Atlas → Docente OS: PASS;
- associazione alla lezione: PASS;
- comparsa in **Materiali allegati**: PASS;
- contenuto realmente visualizzabile: **FAIL / HR-03**;
- coerenza con la singola lezione preparata prima della generazione: **NON GARANTITA / HR-04**.

La v0.3 chiude HR-03 e HR-04 soltanto quando il journey completo lesson-first viene verificato su exact head.
