# UDA → Studio Atlas → Materiali → Lezione — design v0.2

## Stato

**DESIGN APPROVED IN CHAT / WRITTEN SPEC AWAITING HUMAN REVIEW**

Questa v0.2 sostituisce il criterio incompleto della v0.1 secondo cui placeholder o sole preview descrittive potevano essere sufficienti per chiudere il flusso. La Human Review reale del 07/10/2026 ha dimostrato che il binding UDA → Atlas → lezione può risultare tecnicamente riuscito pur lasciando il docente senza alcun contenuto da aprire.

Finding associato: **HR-03 — MATERIAL_CONTENT_NOT_VIEWABLE**.

## Scopo

Rendere operativo un flusso teacher-first che parte da una UDA già contestualizzata in Docente OS, apre Studio Atlas senza perdere contesto, permette al docente di preparare e controllare materiali reali, torna in Docente OS per un'associazione esplicita alla lezione e consente di riaprire il contenuto associato dalla lezione.

Il criterio di successo non è più soltanto «il materiale compare in Materiali allegati», ma:

**prepara → controlla il contenuto → associa → riapri dalla lezione**.

## Autorità

- **Docente OS** resta autorità su classe/sezione, UDA, lezione e binding persistente dei materiali.
- **Studio Atlas** resta ambiente di proposta, authoring e preview del materiale di lavoro.
- **Arena** resta autorità curricolare; nessun contenuto generato da Atlas modifica il curricolo.
- **TRAMA** governa il contratto di interoperabilità e i gate.
- Il **docente** decide sempre se il materiale è utilizzabile e se associarlo alla lezione.
- Nessuna scrittura persistente in Docente OS avviene per effetto dell'apertura di Atlas, della sola preparazione o della sola preview.
- Il binding alla lezione non equivale a pubblicazione Atlas.
- Nessuna pubblicazione automatica viene introdotta.

Questa separazione è coerente con `docs/contracts/r4-p1-entry-contract.md`, in particolare con il flusso minimo «produzione specialistica → anteprima e confronto → collegamento alla lezione → pubblicazione separata».

## Decisione architetturale v0.2

Si adotta **Artefatto strutturato + preview Studio Atlas + viewer Docente OS**.

Non viene introdotto un nuovo backend di storage Atlas, un database parallelo, un account aggiuntivo o un URL pubblico fittizio per ogni bozza.

Ogni materiale selezionato deve invece contenere uno **snapshot strutturato e autosufficiente** sufficiente a:

1. essere mostrato in Studio Atlas prima del ritorno;
2. attraversare il contratto cross-product;
3. essere persistito nel record di estensione lezione già esistente in Docente OS;
4. essere riaperto con un viewer interno Docente OS;
5. restare distinguibile da una futura risorsa Atlas pubblicata.

La persistenza canonica resta quindi quella già usata da `LessonDesignExtension`; non viene creato un secondo archivio materiali.

## Slice v0.2

Origine unica: UDA/focus operativo di Progetta.

Destinazione unica: una lezione della sezione corrente.

Tipi materiale:

- `presentation`
- `worksheet`
- `guide`
- `rubric`

La v0.2 richiede contenuti reali e leggibili per tutti e quattro i tipi. Non richiede ancora esportazione in PPTX/PDF/DOCX, pubblicazione Atlas o generazione visuale tramite provider esterni.

Visual Factory e provider live possono arricchire un materiale in futuro, ma **non sono prerequisito** per la fruibilità minima: il materiale deve essere valido anche come artefatto strutturato testuale/accessibile senza dipendere da compute esterno.

## Contratti

### TeachingContextSnapshot v0.1

Resta invariato:

- `schema = docente-os.teaching-context/v0.1`
- `source = docente-os`
- `udaId`, `udaTitle`
- `grade`, `sectionId?`, `sectionLabel?`
- `discipline`
- `blockId?`, `packId?`, `period?`
- `returnUrl`

Nessun dato studente.

### MaterialBundle v0.2

Nuovo schema:

`studio-atlas.material-bundle/v0.2`

Campi bundle:

- `source = studio-atlas`
- `bundleId`
- `sourceUdaId`
- `generatedAt`
- `items[]`

Ogni item contiene:

- `materialId`
- `type`
- `title`
- `description`
- `origin = atlas`
- `artifact`
- `provenance`
- `publicUrl?`

`publicUrl` è opzionale e indica esclusivamente una risorsa Atlas realmente pubblicata/apribile. Non viene sintetizzato per le bozze.

### MaterialArtifact v0.1

`artifact` è una discriminated union per tipo materiale.

#### PresentationArtifact

- `kind = presentation`
- `slides[]`
  - `slideId`
  - `title`
  - `body[]`
  - `speakerNote?`

Criterio minimo: almeno 3 slide non vuote.

#### WorksheetArtifact

- `kind = worksheet`
- `intro?`
- `tasks[]`
  - `taskId`
  - `prompt`
  - `responseMode = short-text | long-text | checklist | table`
  - `support?`

Criterio minimo: almeno 2 attività non vuote.

#### GuideArtifact

- `kind = guide`
- `sections[]`
  - `sectionId`
  - `heading`
  - `paragraphs[]`
  - `callout?`

Criterio minimo: almeno 2 sezioni non vuote.

#### RubricArtifact

- `kind = rubric`
- `criteria[]`
  - `criterionId`
  - `label`
  - `levels[]`
    - `level`
    - `descriptor`

Criterio minimo: almeno 2 criteri e almeno 3 livelli per criterio.

### Provenance v0.1

Ogni item conserva almeno:

- `producer = studio-atlas`
- `sourceUdaId`
- `generationMode = deterministic-template | assisted | imported | adapted`
- `sourceRefs[]`
- `createdAt`

Nella prima implementazione il percorso può usare `deterministic-template` per produrre artefatti reali senza provider esterno. Questo non deve essere presentato come generazione AI né come materiale pubblicato.

## Regole di materializzazione

La v0.2 non deve limitarsi a cambiare il titolo delle card.

Per ciascun materiale Studio Atlas deve costruire un contenuto coerente con almeno:

- titolo UDA;
- disciplina;
- classe/grado;
- tipo di artefatto;
- eventuali campi già disponibili nel `TeachingContextSnapshot`.

La prima implementazione può usare una materializzazione **deterministica e locale**, purché il contenuto sia reale, leggibile e specifico per il contesto ricevuto. Non sono richiesti API token, provider paid o nuovi secret.

È vietato restituire un item considerato `COMPLETED` se contiene solo titolo/descrizione senza `artifact` valido.

## Preview Studio Atlas

Il flusso Studio Atlas diventa:

1. ricezione e validazione del `TeachingContextSnapshot`;
2. scelta dei tipi di materiale;
3. materializzazione degli artefatti selezionati;
4. **preview leggibile dei contenuti**;
5. possibilità di tornare alla selezione o escludere un materiale;
6. CTA unica **Continua con N materiali**;
7. produzione del `MaterialBundle v0.2` soltanto per artefatti validi.

La preview deve mostrare il contenuto essenziale, non soltanto il nome del tipo.

Per mobile, presentazioni e rubriche devono essere consultabili verticalmente senza overflow orizzontale obbligatorio.

## Persistenza Docente OS

Dopo conferma «Associa alla lezione», Docente OS continua a creare/accettare `LessonDesignExtension` nel repository canonico già esistente.

Per gli item Atlas, `payload` deve includere:

- `bundleId`
- `materialId`
- `materialType`
- `sourceUdaId`
- `artifact`
- `provenance`
- `publicUrl?`

Non viene aggiunta una nuova tabella o repository solo per questa slice.

Il campo `body` dell'estensione resta una sintesi descrittiva; **non è l'artefatto**. L'artefatto vive nel payload tipizzato.

La deduplica resta per `sourceUdaId + materialId`.

## Viewer Docente OS

In «Materiali allegati» ogni materiale Atlas valido deve offrire **Apri**.

`Apri` apre una route/viewer Docente OS autenticata e contestuale alla lezione, non una pagina pubblica nuova.

Il viewer:

- recupera il `LessonDesignExtension` già associato;
- verifica che appartenga alla lezione corrente;
- valida `artifact` e `materialType`;
- renderizza il tipo corretto;
- mostra titolo e provenienza in linguaggio utente;
- consente di tornare alla lezione;
- non espone ID tecnici come contenuto primario.

Se `publicUrl` è presente perché il materiale è stato realmente pubblicato in Atlas, può comparire una seconda azione «Apri su Atlas». Per una bozza locale, l'azione canonica resta «Apri» nel viewer Docente OS.

## Viewer per tipo

### Presentazione

Visualizzazione a schede/slide verticali su mobile, con numerazione e note docente separate dal contenuto principale.

### Scheda di lavoro

Visualizzazione stampabile/leggibile delle attività; nessuna raccolta di risposte studente nella v0.2.

### Guida

Visualizzazione editoriale lineare con sezioni e callout.

### Rubrica

Visualizzazione accessibile dei criteri; su mobile i livelli possono diventare blocchi verticali invece di una tabella larga.

## UX canonica end-to-end

1. Da UDA contestualizzata: **Prepara materiali con Atlas**.
2. Studio Atlas: **Scegli i materiali**.
3. Studio Atlas: **Controlla i materiali** con contenuti reali.
4. Studio Atlas: **Continua con N materiali**.
5. Docente OS: **Associa i materiali alla lezione**.
6. Dopo binding: apertura della lezione canonica.
7. In **Materiali allegati**, ogni item ha **Apri**.
8. `Apri` mostra il contenuto persistito anche senza connessione a Studio Atlas.

Il docente non deve tornare in Atlas per leggere una bozza già associata alla propria lezione.

## Trasporto

Il handoff browser può continuare a usare fragment URL versionato e validato perché:

- non introduce secret;
- non richiede backend server-to-server;
- il payload non contiene dati studente.

Tuttavia il payload v0.2 è più ricco. Devono quindi essere applicati limiti espliciti di dimensione e testati i casi reali dei quattro artefatti.

Se il bundle completo supera in modo realistico il limite sicuro del trasporto URL, **l'implementazione deve fermarsi e proporre un transport adapter distinto**; non è autorizzato aumentare arbitrariamente il limite né introdurre storage nascosto come workaround.

Questo è un gate tecnico dell'implementazione, non un'autorizzazione implicita a introdurre backend.

## Errori e fail-closed

Devono essere distinti almeno:

- contesto UDA invalido;
- artefatto Atlas non materializzato;
- artefatto malformato;
- bundle troppo grande;
- mismatch UDA;
- mismatch lezione;
- errore di persistenza;
- materiale associato non più decodificabile.

In nessuno di questi casi un placeholder può essere rappresentato come materiale completato.

Un errore dopo la materializzazione non deve cancellare la preview disponibile durante la sessione Atlas.

## Sicurezza e privacy

- nessun dato studente nel contratto;
- nessun wildcard origin;
- callback limitata alle origini Docente OS configurate;
- nessun token/API key nel browser;
- nessun nuovo secret richiesto dalla v0.2;
- nessun HTML arbitrario attraversa il contratto: l'artefatto è dati strutturati;
- il viewer Docente OS renderizza strutture tipizzate, non markup non fidato;
- nessuna telemetria aggiuntiva richiesta.

## Accessibilità

Target: WCAG 2.2 AA per le nuove superfici.

Minimo richiesto:

- heading semantici;
- controllo completo da tastiera;
- stato selezionato non affidato solo al colore;
- target touch >= 44 px;
- rubriche fruibili senza scroll orizzontale obbligatorio su mobile;
- focus visibile;
- feedback percepibile in caso di errore;
- contenuto strutturato leggibile da tecnologie assistive.

## Compatibilità

`MaterialBundle v0.1` non viene reinterpretato retroattivamente come artefatto completo.

Docente OS può continuare a leggere i binding v0.1 già creati come **legacy metadata-only**, ma non deve mostrare «Apri» quando manca un artefatto valido.

I nuovi binding creati dalla v0.2 devono richiedere `MaterialBundle v0.2`.

Non è richiesto migrare automaticamente i quattro materiali creati durante la Human Review precedente.

## Non-obiettivi v0.2

- esportazione PPTX/PDF/DOCX;
- editor ricco completo;
- generazione visuale live;
- provider AI esterno;
- storage Atlas persistente delle bozze;
- condivisione pubblica del materiale;
- pubblicazione automatica;
- account studente;
- raccolta delle risposte degli studenti;
- modifica del curricolo Arena;
- DOS-A1.

## Test e qualificazione

### Studio Atlas

TDD obbligatorio:

- schema `MaterialBundle v0.2`;
- validazione discriminata dei quattro artifact;
- materializzazione contestuale dei quattro tipi;
- preview reale prima del ritorno;
- rifiuto di item metadata-only;
- browser runtime senza dipendenze Node-only;
- limite dimensione envelope;
- build/typecheck.

### Docente OS

TDD obbligatorio:

- decode/validate `MaterialBundle v0.2`;
- persistenza artifact nel repository canonico esistente;
- nessun binding prima della conferma;
- deduplica invariata;
- viewer per quattro tipi;
- ownership lezione/materiale;
- legacy v0.1 senza falso «Apri»;
- feedback percepibile;
- Product CI, Design Policy, HVA, WCAG/browser certification.

### Journey browser exact-head

Il journey di accettazione deve provare realmente:

**UDA 1A → Studio Atlas → seleziona 4 materiali → preview contenuto → continua → Docente OS → seleziona lezione → associa → Materiali allegati → Apri ciascun materiale → contenuto visibile**.

Il test può usare contenuti deterministici e non deve dipendere da provider esterni.

## Criteri di accettazione

La funzione è completa soltanto se:

- una UDA reale entra in Atlas con contesto corretto;
- i materiali selezionati vengono materializzati in contenuti reali;
- il docente può controllarli prima del ritorno;
- il bundle contiene artifact tipizzati e validi;
- nessuna associazione avviene prima della conferma in Docente OS;
- il binding usa la persistenza canonica già esistente;
- la lezione mostra i materiali associati;
- ogni nuovo materiale v0.2 è riapribile tramite **Apri**;
- il viewer mostra il contenuto reale e non soltanto titolo/descrizione;
- il flusso resta utilizzabile senza provider esterno o secret aggiuntivi;
- tutti i gate automatici sull'exact head sono PASS;
- Human Review finale mobile e desktop verifica contenuto, comprensibilità e riapertura;
- nessun merge/deploy production avviene prima della decisione umana.

## Decisione Human Review HR-03

Stato corrente: **REWORK**.

Il flusso v0.1 ha dimostrato:

- UDA → Atlas: PASS;
- selezione dei quattro materiali: PASS;
- ritorno Atlas → Docente OS: PASS;
- associazione alla lezione: PASS;
- comparsa in «Materiali allegati»: PASS;
- contenuto realmente visualizzabile: **FAIL**.

La v0.2 chiude HR-03 solo quando il journey completo «preview → associa → Apri» viene verificato su exact head.