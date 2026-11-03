# Piano di esecuzione — TRAMA-TEACHER-YEAR-01

**Stato:** PROPOSED / DOCUMENTATION_ONLY / HUMAN PEDAGOGICAL REVIEW PENDING  
**Data:** 2026-11-03  
**Baseline di lavoro:** main@16b698781cdb91ba2818819dde7920652e7044b7  
**Specifica padre:** [TRAMA-TEACHER-YEAR-01](../../strategy/TRAMA-TEACHER-YEAR-01-ciclo-professionale-e-programmazione-annuale-2026-11-03.md)  
**Protocollo:** [prova curricolo → programmazione annuale → UDA](../../pilots/TRAMA-TEACHER-YEAR-01-protocollo-programmazione-annuale-2026-11-03.md)

## 0. Regola di lavoro

**Non avviare lo sviluppo di una nuova vista o un nuovo sistema di programmazione per il solo fatto che esiste questa specifica.** La prima linea è ricostruzione della professionalità docente, validazione dei riferimenti normativi e prova dei prodotti esistenti.

Confronto obbligatorio con:
- [TRAMA vision](../../vision/product-strategy.md);
- [Architettura universale proposta](../../architecture/trama-universal-didactic-planning-artifact-orchestration-v1.md);
- [Curricolo istituzionale / Arena](../../architecture/ecosystem-overview.md);
- [Educazione civica](../../contracts/educazione-civica-primo-ciclo.md);
- [VALUE-01, PR #298](https://github.com/antoniocorsano-boop/trama-ecosistema/pull/298), **separata, non prerequisito runtime**;
- [Docente OS Piano annuale](https://github.com/antoniocorsano-boop/docente-os-2026-27/blob/develop/product/src/app/piano-annuale/model.ts) e [Progetta](https://github.com/antoniocorsano-boop/docente-os-2026-27/blob/develop/product/src/app/progetta/progetta-model.ts): prima di qualsiasi intervento rileggere le versioni correnti e registrare SHA;
- [Registro Docente UX-GOV-01](https://github.com/antoniocorsano-boop/registro-docente/blob/main/docs/ux/UX-GOV-01-registro-docente-user-flow-baseline-v1.md).

## Fase P0 — Review pedagogica dell'ordine annuale

**Input:** proposta TEACHER-YEAR-01.  
**Esecutore:** revisore pedagogico e docente pilota; controllo architetturale separato.  
**Decisioni:**
1. confermare la distinzione curricolo / mappa apprendimenti / programmazione annuale / piano UDA / UDA operativa;
2. controllare che contesto classe e prerequisiti siano trattati prima della conferma finale del piano;
3. approvare i documenti derivati come proiezioni, senza moltiplicare obblighi;
4. verificare la distinzione valutazione degli apprendimenti vs copertura del piano;
5. valutare compatibilità con infanzia, primaria e secondaria mediante un adattatore, senza imporre l'ontologia Tecnologia.
**Uscita:** Human Review PASS/REWORK + motivazioni ancorate allo SHA documentale.  
**Stop:** nessuna promozione automatica di questa specifica ad authority istituzionale.

## Fase P1 — Inventario funzionale corrente

**Input:** repository correnti, PR in parallelo, schema e documenti.  
**Azioni read-only:**
1. recuperare SHA reale degli sviluppi attivi di Arena, Docente OS, Registro;
2. localizzare le superfici di selezione curricolo/versione/regime, Programmazione, Piano annuale, UDA, Classe, Conoscenza, Lezione, Registrazione;
3. verificare come sono già gestiti identità curricolo, blocchi, UDA, PACK, annualità, ore e provenienza;
4. distinguere **EXISTS / IMPLEMENTED / HUMAN_VERIFIED / INTEGRATED / NOT_AVAILABLE**, senza dedurre il livello dalla presenza di una schermata;
5. elencare i dati obbligatori mancanti e documentare la fonte di ciascun dato.
**Uscita:** tabella delle capacità e delle lacune, con riferimenti a file/PR e stati verificati.  
**Stop:** se i dati Arena non sono approvati, nessuna derivazione qualificata degli obiettivi annuali.

## Fase P2 — Prova di programmazione con fonti effettive

**Casi:** secondaria di primo grado Tecnologia, una prima 2026/27 e una seconda/terza nel regime transitorio applicabile. Non fissare la sezione della classe senza decisione docente.  
**Input:**
- norma applicabile;
- snapshot curricolo istituto effettivamente verificato o stato esplicitamente non disponibile;
- assegnazione e orario confermati, calendario e tempi realistici;
- profilo classe **aggregato e non personale** quando disponibile.

**Output minimo:**
- mappa apprendimenti annuali;
- programmazione annuale;
- piano UDA sequenziato;
- matrice obiettivi↔UDA↔evidenze;
- eventuale scheda di adattamento per classe.

**Test:** ogni riferimento deve avere fonte+versione; ogni UDA una funzione nel percorso (non semplice tema); i tempi sono stimati e rimodulabili; carenze e sovrapposizioni sono evidenziate, non sanate con un'invenzione del Copilota. Se manca il curricolo approvato, la prova produce soltanto **bozza professionale non vincolata**, non un piano istituzionale qualificato.

**Uscita:** ricevuta del collaudo documentale (PASS/PARTIAL/FAIL/BLOCKED) con i rilievi. Nessun dato studente.

## Fase P3 — Scelta del primo problema da risolvere

Classificare ogni frizione osservata:
- REFERENCE: fonte curricolare/versione non disponibili;
- PEDAGOGICAL: manca relazione obiettivi ↔ esperienze ↔ evidenze;
- STRUCTURAL: piano rigidamente legato a CAN-PLAN 33×2 senza ragione generalizzabile;
- CONTEXT: annualità, classe, UDA o obiettivo vanno riselezionati;
- WORKFLOW: manca passaggio confermabile dalla programmazione a una UDA;
- PRESENTATION: informazioni disponibili ma difficili da leggere;
- INTEGRATION: passaggio fra prodotti non qualificato.

**Gate di scelta (una decisione sola):**
- **NO_CHANGE** — strumenti attuali adeguati;
- **DOCUMENT_ONLY** — chiarire pratica/documenti senza codice;
- **LOCAL_UX** — correggere solo una superficie autorevole;
- **DOMAIN_CONTRACT** — qualificare il modello dei riferimenti curricolari e del piano;
- **CROSS_PRODUCT_CONTRACT** — qualificare uno specifico handoff prima di UX;
- **NEED_MORE_EVIDENCE** — non autorizzare implementazione.

Non scegliere una vista universale prima di verificare che sia davvero necessaria. Se si propone una vista adattiva, la si progetta come **proiezione governata** delle fonti e azioni già ammesse, senza nuovi proprietari dei dati.

## Fase P4 — Incremento tecnico minimo, solo con autorizzazione separata

Per un intervento prescelto:
1. specifica di contratto con fonte, proprietario, ambito annuale, versione, stato e revisione;
2. test RED che fallisce per il difetto reale, senza hardcodare la sola Tecnologia;
3. modifica minima nel repository owner del comportamento;
4. test GREEN e regressioni sul piano CAN-PLAN esistente;
5. verifica di accessibilità S/M/L/LIM dove pertinente;
6. verifica reale docente, HVA, review indipendente e prova exact-head;
7. nessun merge/deploy prima dei gate richiesti.

## Fase P5 — Collegamento con VALUE-01

Il protocollo VALUE-01 osserva la **qualità e il costo del lavoro reale**. TEACHER-YEAR-01 specifica la **correttezza curricolare della fase preliminare**. Sono complementari, non equivalenti.

Ordine consigliato:
1. approvare o correggere TEACHER-YEAR-01;
2. aggiornare l'interpretazione del caso VALUE-01 in modo che non inizi arbitrariamente dalla singola lezione;
3. eseguire prova P2 su fonti vere;
4. misurare attriti solo per i passaggi che il docente svolge davvero;
5. definire il prodotto successivo in base al gap provato.

**Non trattare il GREEN tecnico, il completamento di UDA o la registrazione delle ore come prova che gli studenti abbiano raggiunto le competenze.**

## Gate documentale finale

- stato della specifica: PROPOSED → HUMAN REVIEW → APPROVED/REWORK;
- stato dell'inventario: NOT_RUN;
- stato della prova pedagogica: NOT_RUN;
- stato dell'autorizzazione runtime: NONE;
- DOS-A1: RUNTIME_DEFERRED.

Ogni passo deve potersi chiudere con una decisione **non sviluppare software** quando l'evidenza lo giustifica.
