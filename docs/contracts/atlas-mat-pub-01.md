# ATLAS-MAT-PUB-01 — Pubblicazione canonica dei materiali didattici Atlas

**Versione:** 0.1  
**Data:** 2026-09-23  
**Stato:** PROPOSED  
**Governance:** TRAMA-ADR-008 · TRAMA-ADR-010 · TRAMA-ADR-013  
**Perimetro:** asset didattici pubblici Atlas

## 1. Scopo

Definire il percorso tecnico canonico che trasforma un materiale approvato in una risorsa pubblica Atlas, mantenendo separati:

- produzione dell'artefatto;
- decisione del docente;
- normalizzazione tecnica;
- pubblicazione;
- verifica pubblica.

## 2. Principio

La pipeline non decide **se** pubblicare. Esegue soltanto la pubblicazione di un materiale già selezionato e confermato secondo il contratto applicabile.

Flusso:

`materiale candidato → revisione docente → validate → optimize → manifest → commit → deploy → smoke test → receipt`

## 3. Formati

### Preferiti

- **SVG**: schemi, mappe, infografiche e schede vettoriali;
- **WebP**: immagini raster pubbliche;
- **AVIF**: opzionale quando il rapporto qualità/peso lo giustifica;
- **PNG/JPEG**: sorgente o fallback, non formato pubblico predefinito quando è disponibile una derivata più efficiente.

### Vincoli

- nessun contenuto eseguibile non necessario;
- nessun metadata personale o di localizzazione non necessario;
- nessun asset remoto non verificato come dipendenza critica della pagina.

## 4. Normalizzazione

Per immagini raster la pipeline deve poter:

1. leggere dimensioni e formato;
2. applicare orientamento corretto;
3. ridimensionare entro budget;
4. convertire nel formato pubblico scelto;
5. rimuovere metadata non necessari;
6. calcolare checksum;
7. produrre, se utile, thumbnail/preview;
8. verificare apertura del file finale.

Implementazione proposta: **Sharp** o equivalente compatibile.

## 5. Struttura repository

Pattern iniziale:

```
public/materials/<YYYY-MM-DD>/<class-or-grade>/<discipline>/<asset-slug>.<ext>
```

Esempio:

```
public/materials/2026-09-23/1c/tecnologia/
  infografica-dal-bisogno-alla-soluzione.webp
  scheda-studente.svg
```

La struttura fisica non deve diventare fonte autorevole del significato: il significato è espresso dal manifest.

## 6. Metadati minimi

Ogni asset pubblicabile deve poter essere descritto almeno da:

- `materialId`;
- `lessonId`;
- `classContext` o grado minimizzato;
- `disciplineId`;
- `title`;
- `kind`;
- `alt` quando applicabile;
- `mimeType`;
- `width` / `height` quando applicabili;
- `filesize`;
- `checksum`;
- `sourceProvenance`;
- `publicPath`;
- `publicationState`;
- `publishedAt`;
- `commitSha`;
- `publicUrl`.

## 7. Binding alla lezione

L'asset non è una lezione autonoma.

Deve essere collegato attraverso il `LessonPublicationManifest`, preservando:

- identità lezione;
- disciplina;
- contesto pubblico minimizzato;
- riferimenti curricolari Arena;
- stato/versione;
- provenance.

Nessuna copia del testo curricolare diventa autorità indipendente.

## 8. Controlli obbligatori

### Deterministici

- file esistente;
- formato ammesso;
- dimensione/peso entro budget;
- checksum calcolabile;
- percorso pubblico valido;
- manifest valido;
- assenza di campi proibiti;
- build statico PASS;
- smoke test URL pubblico PASS.

### Umani o misti

- leggibilità;
- correttezza didattica;
- testo dentro immagini;
- alt text;
- diritti/licenza;
- opportunità della pubblicazione;
- qualità su smartphone/LIM quando pertinente.

## 9. Privacy

Non pubblicare:

- nomi di studenti;
- identificativi registro;
- valutazioni individuali;
- note personali;
- EXIF con localizzazione o device quando non necessario;
- dati di classe non necessari alla fruizione pubblica.

## 10. Accessibilità

Target: **WCAG 2.2 AA** per la superficie pubblica.

Per asset visuali:

- alt text utile quando l'immagine porta informazione;
- testo leggibile senza zoom eccessivo nei contesti previsti;
- contrasto adeguato;
- contenuto equivalente testuale quando l'immagine contiene informazione essenziale non altrimenti disponibile;
- SVG con `title`/`desc` o strategia equivalente quando appropriato.

## 11. PublicationReceipt

La receipt tecnica deve registrare almeno:

- `publicationId`;
- `materialId`;
- `manifestVersion`;
- `commitSha`;
- `publicUrl`;
- `checksum`;
- `deployStatus`;
- `smokeTestStatus`;
- `publishedAt`;
- `rollbackRef` quando disponibile.

La receipt certifica l'esito tecnico della pubblicazione, **non** approvazione curricolare o istituzionale.

## 12. Rollback e ritiro

Devono essere possibili:

- sostituzione versionata;
- ritiro dal manifest;
- rollback a commit precedente;
- conservazione della tracciabilità della versione pubblicata.

## 13. Integrazione futura Docente OS

La futura azione utente può essere:

**Pubblica su Atlas**

ma deve restare composta da:

1. anteprima;
2. conferma esplicita;
3. esecuzione pipeline;
4. feedback percepibile;
5. receipt;
6. possibilità di sostituzione/ritiro.

Questa specifica non autorizza ancora quel runtime cross-product.

## 14. Riferimenti open source

Riferimenti valutati:

- **Sharp**: trasformazione immagini build-time;
- **Decap CMS**: pattern editoriale Git-based;
- **Keystatic**: pattern schema-first / Git-first;
- DAM/CMS completi: non adottati come dipendenza necessaria in questa fase.

## 15. Slice implementative

### MAT-PUB-A — Schema + validator
- schema manifest/asset;
- validator;
- fixture PASS/FAIL.

### MAT-PUB-B — Image normalization
- Sharp;
- WebP;
- metadata stripping;
- checksum;
- budget.

### MAT-PUB-C — Repository publisher
- naming/path;
- manifest update;
- commit;
- idempotenza.

### MAT-PUB-D — Deploy + receipt
- deploy canonico;
- smoke test;
- receipt;
- rollback test.

### MAT-PUB-E — Human UX
- anteprima;
- conferma;
- stato percepibile;
- errore/riprova;
- ritiro.

## 16. Exit criteria

- [ ] manifest validato;
- [ ] raster normalizzato e pubblicato;
- [ ] SVG pubblicato;
- [ ] nessun metadata personale residuo;
- [ ] URL pubblici PASS;
- [ ] mobile/LIM verificati;
- [ ] receipt verificabile;
- [ ] rollback dimostrato;
- [ ] review terza PASS;
- [ ] HUMAN EXACT-HEAD REVIEW PASS.
