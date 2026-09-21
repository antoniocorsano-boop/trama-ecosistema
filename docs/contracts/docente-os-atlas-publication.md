# Contratto Docente OS verso Atlas — pubblicazione didattica

**Stato:** PROPOSED  
**Data:** 21 settembre 2026  
**Scope:** Docente OS → Atlas  
**Decisione collegata:** TRAMA-ADR-008

## 1. Scopo

Consentire al docente di pubblicare in Atlas contenuti e materiali già preparati nel proprio workspace professionale, senza duplicare l'editor didattico, senza creare una seconda fonte curricolare e senza trasferire dati personali degli studenti.

## 2. Principi invarianti

- **preparazione ≠ pubblicazione**;
- **manifest di pubblicazione ≠ ricevuta/stato Atlas**;
- **uso in lezione ≠ pubblicazione**;
- **pubblicazione ≠ approvazione curricolare o istituzionale**;
- Arena resta l'autorità del curricolo;
- Docente OS resta il luogo della decisione professionale;
- Atlas resta autorità solo per lo stato della propria pubblicazione e delle proprie risorse;
- nessun dato personale studente è autorizzato nel flusso.

## 3. Flusso target

Docente OS  
→ anteprima minimizzata  
→ conferma esplicita del docente  
→ `LessonPublicationManifest`  
→ Atlas  
→ validazione dei gate  
→ creazione/aggiornamento/ritiro  
→ `PublicationReceipt`  
→ Docente OS

La ricevuta Atlas non modifica retroattivamente il manifest e non attribuisce ad Atlas autorità sul curricolo o sul contesto professionale del docente.

## 4. LessonPublicationManifest

Il `LessonPublicationManifest` è una **richiesta versionata e immutabile per singola submission**. Descrive ciò che Docente OS chiede ad Atlas di pubblicare, aggiornare o ritirare.

### 4.1 Campi minimi

- `manifestId`;
- `manifestVersion`;
- `idempotencyKey`;
- `operation`: `CREATE | UPDATE | WITHDRAW`;
- `sourceLessonRef`;
- `sourceDocenteOsRef`;
- `publicationId` opzionale per `CREATE`, obbligatorio per `UPDATE/WITHDRAW`;
- `expectedPublicationVersion` opzionale per `CREATE`, obbligatorio per `UPDATE/WITHDRAW`;
- `discipline`;
- `grade`;
- `schoolYear` solo se necessario alla comprensione o al routing;
- `sectionScope` solo quando strettamente necessario e autorizzato dalla policy di visibilità;
- `sequenceLabel` preferito alla data esatta;
- `lessonDate` opzionale e pubblicabile solo se pedagogicamente necessario;
- `title`;
- `summaryForStudents`;
- `visibility`;
- `curriculumBinding`;
- `learningObjectRefs[]`;
- `materialRefs[]`;
- `provenance`;
- `requestedAt`.

### 4.2 Binding curricolare autorevole

`curriculumBinding` deve contenere almeno:

- `authority: "Arena"`;
- `curriculumVersionRef`;
- `authorityState`;
- `authorityReceiptRef` quando Arena lo emette per quella baseline/versione;
- `curriculumObjectiveRefs[]`.

Il manifest **non trasporta una seconda copia autorevole degli obiettivi curricolari**. Eventuali etichette testuali mostrate per leggibilità sono proiezioni non autorevoli, ricostruibili dai riferimenti Arena.

Un eventuale testo didattico formulato dal docente deve essere distinto semanticamente, ad esempio come `teacherLearningIntent`, e non può essere presentato come obiettivo curricolare Arena.

### 4.3 Ciclo di vita del manifest

Stati locali Docente OS:

- `DRAFT`;
- `PREVIEWED`;
- `CONFIRMED`;
- `SUBMITTED`;
- `SUPERSEDED` per una nuova submission relativa alla stessa intenzione editoriale.

Solo `CONFIRMED` può essere inviato. Dopo l'invio il payload della submission resta immutabile; ogni variazione genera una nuova versione del manifest.

## 5. PublicationReceipt

La `PublicationReceipt` è la risposta autorevole di Atlas sull'esito della richiesta. È distinta dal manifest.

Campi minimi:

- `receiptId`;
- `manifestId`;
- `idempotencyKey`;
- `publicationId`;
- `publicationVersion`;
- `status`: `PUBLISHED | UPDATED | WITHDRAWN | REJECTED`;
- `contentDigest`;
- `processedAt`;
- `supersedesPublicationVersion` quando applicabile;
- `withdrawnAt` quando applicabile;
- `rejectionReasons[]` quando `REJECTED`;
- `atlasProvenance`.

La ricevuta certifica esclusivamente l'operazione Atlas. Non certifica approvazione curricolare, qualità didattica generale o approvazione istituzionale.

## 6. Versionamento, concorrenza, idempotenza e reversibilità

- `CREATE` produce la prima `publicationVersion`;
- `UPDATE` produce una nuova versione e deve dichiarare `expectedPublicationVersion`;
- `WITHDRAW` produce uno stato di ritiro tracciabile senza cancellare la storia;
- Atlas rifiuta un aggiornamento se `expectedPublicationVersion` non coincide con la versione corrente;
- la stessa `idempotencyKey` con lo stesso digest deve restituire lo stesso esito/receipt senza duplicare la pubblicazione;
- la stessa `idempotencyKey` con payload differente deve essere rifiutata;
- un contenuto ritirato può essere ripubblicato solo con nuova intenzione/versione esplicita, non per riattivazione implicita.

## 7. Policy di visibilità e minimizzazione

Principio: **pubblicare solo il contesto necessario al destinatario**.

- `schoolYear`: incluso solo quando serve a disambiguare o contestualizzare il percorso;
- `grade`: ammesso come informazione didattica di base;
- `sectionScope`: **OMIT_BY_DEFAULT**; ammesso soltanto se necessario al routing o alla comprensione e se la visibilità scelta lo consente;
- `lessonDate`: **OMIT_BY_DEFAULT**; preferire `sequenceLabel` o posizione nel percorso;
- identificativi interni di classe, registro, studente o calendario non sono pubblicabili;
- Atlas non deve dedurre o ricostruire contesto aggiuntivo da dati non presenti nel manifest.

Ogni valore di `visibility` deve avere un meccanismo di enforcement reale prima del runtime. Non sono ammessi stati nominalmente “riservati” che restino tecnicamente accessibili come pubblici.

## 8. Gate di eleggibilità alla pubblicazione

Prima di restituire `PUBLISHED` o `UPDATED`, Atlas deve verificare i gate seguenti.

### 8.1 Diritti e licenze

Per ogni materiale pubblicato deve essere disponibile almeno:

- titolarità o base d'uso dichiarata;
- licenza o riferimento ai diritti quando applicabile;
- attribuzione richiesta;
- assenza di materiale con stato diritti sconosciuto.

Un materiale non eleggibile deve essere escluso, sostituito o portare la submission a `REJECTED`; non può essere pubblicato silenziosamente.

### 8.2 Accessibilità

Target: **WCAG 2.2 livello AA** per le superfici pubbliche e i materiali digitali controllabili dall'ecosistema.

Il gate richiede:

- controlli automatici pertinenti;
- verifica umana per aspetti non affidabilmente automatizzabili;
- testo alternativo o equivalente per contenuti visivi quando richiesto;
- struttura, contrasto, navigazione da tastiera e focus verificati per le superfici Atlas;
- documentazione di eventuali limiti dei formati esterni.

La sola esecuzione di uno scanner automatico non equivale al superamento del gate.

## 9. Dati vietati

Non devono transitare:

- nomi studenti;
- identificativi personali studenti;
- valutazioni individuali;
- annotazioni personali del docente;
- diario completo;
- calendario personale o dettagli non necessari;
- credenziali;
- segreti;
- dati sanitari, comportamentali o altre categorie personali riferite agli studenti.

## 10. Autorità

### Docente OS

- decide se pubblicare;
- prepara anteprima e manifest;
- decide cosa includere tra i contenuti eleggibili;
- mantiene il contesto professionale completo;
- conserva la receipt come evidenza dell'operazione Atlas.

### Atlas

- valida i gate di pubblicazione;
- conserva identità, versione e stato della pubblicazione;
- rende la pubblicazione navigabile secondo la visibilità effettivamente applicata;
- emette la `PublicationReceipt`;
- gestisce versionamento e ritiro.

### Arena

- resta autorevole per curricolo, applicabilità, stato e versione;
- fornisce i riferimenti usati nel `curriculumBinding`;
- non viene sostituita da copie di obiettivi presenti in Docente OS o Atlas.

## 11. Compatibilità con gli altri flussi

Questo contratto governa soltanto **Docente OS → Atlas** per la pubblicazione didattica.

Restano distinti:

1. **Arena → Atlas**: proiezione pubblicabile del curricolo, sempre legata alla fonte Arena;
2. **Arena → Docente OS**: baseline curricolare autorevole per il lavoro docente;
3. **Atlas → Docente OS**: proposta di risorse/LO, modificabile, sostituibile o escludibile;
4. **Docente OS → Atlas**: manifest esplicito di pubblicazione.

La `PublicationReceipt` è la risposta di controllo all'operazione n. 4, non un nuovo canale curricolare.

## 12. Registro delle fonti

Finché TRAMA-ADR-007 e TRAMA-ADR-008 restano `PROPOSED`, `docs/knowledge/source-registry.json` non deve essere promosso per dichiarare nuove autorità già operative.

**Gate di promozione:** quando TRAMA-ADR-007 sarà eventualmente portata ad `APPROVED`, lo stesso pacchetto di promozione deve aggiornare il source registry per dichiarare esplicitamente:
- Atlas come autorità delle pagine/pubblicazioni Atlas e del relativo stato editoriale;
- Arena invariata come autorità del curricolo;
- Docente OS invariato come autorità del contesto e delle decisioni professionali.

## 13. Stato implementativo

**NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME**

L'adozione finale richiede almeno:

- schema versionato di `LessonPublicationManifest`;
- schema versionato di `PublicationReceipt`;
- privacy review;
- security review;
- definizione ed enforcement della visibility policy;
- gate diritti/licenze;
- piano WCAG 2.2 AA con test automatici + umani;
- UX della preview/conferma;
- test di idempotenza, conflitto di versione, update e withdraw;
- pilot umano;
- recepimento separato nei repository Atlas e Docente OS;
- nuova review umana sull'exact head TRAMA.
