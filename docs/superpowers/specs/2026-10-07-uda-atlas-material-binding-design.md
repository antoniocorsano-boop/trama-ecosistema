# UDA → Studio Atlas → Materiali → Lezione — design v0.1

## Scopo
Rendere operativo un flusso teacher-first che parte da una UDA già contestualizzata in Docente OS, apre Studio Atlas senza perdere contesto, permette al docente di preparare/selezionare materiali e torna in Docente OS per un'associazione esplicita alla lezione.

## Autorità
- Docente OS resta autorità su classe/sezione, UDA, lezione e binding persistente dei materiali.
- Studio Atlas resta ambiente di proposta, authoring, preview e selezione.
- Nessuna scrittura persistente in Docente OS avviene per effetto dell'apertura di Atlas o della sola generazione.
- Il docente conferma sempre il binding finale.

## Slice v0.1
Origine unica: UDA/focus operativo di Progetta.
Destinazione unica: una lezione della sezione corrente.
Tipi materiale: `presentation`, `worksheet`, `guide`, `rubric`.
Visual Factory live non è un prerequisito: preview governate o placeholder sono validi finché mantengono identità e provenienza.

## Contratti
### TeachingContextSnapshot v0.1
Payload minimo, privo di dati studente:
- `schema = docente-os.teaching-context/v0.1`
- `source = docente-os`
- `udaId`, `udaTitle`
- `grade`, `sectionId?`, `sectionLabel?`
- `discipline`
- `blockId?`, `packId?`, `period?`
- `returnUrl`

### MaterialBundle v0.1
- `schema = studio-atlas.material-bundle/v0.1`
- `source = studio-atlas`
- `bundleId`, `sourceUdaId`, `generatedAt`
- `items[]`: `materialId`, `type`, `title`, `description`, `previewRef?`, `origin = atlas`

### LessonMaterialBinding v0.1
Docente OS persiste solo dopo conferma umana:
- `lessonId`, `udaId`, `bundleId`, `materialIds[]`, `boundAt`, `boundBy`

## Trasporto v0.1
Per evitare credenziali condivise e nuove dipendenze server-to-server nella prima slice, il handoff browser usa un envelope versionato e validato in fragment URL. Il fragment non viene inviato automaticamente ai server HTTP. Il payload non contiene dati studente. Origini e callback sono allowlistate. Payload sconosciuti o incompleti falliscono chiusi.

Questo trasporto è un adattatore di handoff, non un'autorità e non sostituisce il binding persistente in Docente OS.

## UX canonica
1. Nel focus UDA di Progetta compare una sola azione primaria contestuale: **Prepara materiali con Atlas**.
2. Studio Atlas mostra immediatamente un banner **Contesto ricevuto da Docente OS** con UDA, classe e disciplina; non chiede al docente di reinserire informazioni già note.
3. La superficie Atlas propone i quattro tipi di materiale e permette selezione/revisione.
4. **Torna a Docente OS** produce un `MaterialBundle` ma non associa nulla.
5. Docente OS mostra una conferma leggibile: UDA sorgente, lezione target, materiali scelti. Solo **Associa alla lezione** effettua la scrittura.
6. La lezione mostra i materiali con tipo, titolo, provenienza Atlas e collegamento alla UDA.

## Vincoli UI/interazione
- gerarchia visiva esistente di Docente OS e Studio Atlas; niente landing page parallele;
- massimo una CTA primaria per fase;
- contesto didattico sempre visibile durante il passaggio;
- nessun codice tecnico mostrato come informazione primaria;
- mobile first: target >= 44 px, nessun overflow orizzontale, feedback di stato percepibile;
- fail-closed su payload, callback o schema non validi.

## Sicurezza e privacy
- nessun dato studente nel contratto;
- nessun wildcard origin;
- callback limitata alle origini Docente OS configurate;
- nessun token/API key nel browser;
- nessuna telemetria aggiuntiva nella slice v0.1.

## Criteri di accettazione
- da una UDA reale il docente entra in Atlas con contesto corretto senza reinserimento;
- Atlas espone una proposta coerente e selezionabile;
- il ritorno produce un bundle validato;
- nessuna associazione avviene prima della conferma in Docente OS;
- il binding è visibile nella lezione dopo conferma;
- test contratto, typecheck/build e journey browser exact-head PASS;
- Human Review finale su mobile e desktop prima di merge/deploy.