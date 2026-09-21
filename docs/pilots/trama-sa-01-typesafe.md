# TRAMA-SA-01 — Pilota TypeSafe per assurance semantica

Stato: **PROPOSTO**  
Decisione collegata: `TRAMA-ADR-009`

## Domanda del pilota

Un giudizio semantico tipizzato può aiutare a individuare incoerenze tra una pubblicazione didattica candidata, il riferimento curricolare Arena e le evidenze disponibili **senza** trasformarsi in autorità, approvazione o automazione?

## Perimetro

Il pilota opera fuori dal runtime dei prodotti e usa soltanto casi sintetici, pubblici o minimizzati.

Oggetto iniziale: un candidato `LessonPublicationManifest` con:
- riferimento curricolare Arena;
- obiettivo/evidenza testuale necessaria al controllo;
- descrizione della lezione o della risorsa;
- metadati di provenienza strettamente necessari.

Non sono usati dati personali né registri di classe.

## Pipeline di prova

### 1. Pre-gate deterministico

Prima del giudizio semantico il codice verifica:
- schema valido;
- riferimenti obbligatori presenti;
- binding Arena presente quando richiesto;
- versioni e identificativi formalmente validi;
- nessun dato personale;
- presenza dei metadati richiesti per diritti/licenze e accessibilità.

Un fallimento del pre-gate chiude il caso senza interrogare il provider semantico.

### 2. Giudizio semantico

Primo giudizio candidato, modellato come scelta fra opzioni definite dal codice:

- `ALIGNED`: il contenuto conserva il significato dell'evidenza fornita;
- `PARTIAL`: è coerente solo in parte o omette un elemento sostanziale;
- `CONTRADICTORY`: introduce una contraddizione o altera il significato;
- `INSUFFICIENT_EVIDENCE`: lo stato fornito non consente un giudizio affidabile.

Secondo giudizio indipendente, ove utile: verifica se una specifica affermazione è supportata dall'evidenza citata.

Le domande devono essere valutate sullo stesso stato quando sono indipendenti; nessuna risposta può concedere permessi o produrre effetti.

### 3. Revisione umana

Durante il pilota **ogni caso** è riesaminato manualmente.

Per ciascun caso si registra:
- esito atteso umano;
- esito del giudizio semantico;
- distribuzione/probabilità disponibile;
- accordo o disaccordo;
- causa del problema: evidenza mancante, domanda mal posta, errore del modello, errore del codice o indisponibilità del servizio;
- eventuale rischio didattico o di governance.

## Set di prova

Il set deve includere almeno le seguenti famiglie:
- allineamento evidente;
- formulazione parziale;
- contraddizione esplicita;
- evidenza insufficiente;
- riferimento obsoleto o incoerente;
- contenuto linguisticamente plausibile ma non sostenuto;
- casi con lessico scolastico italiano;
- casi limite in cui più alternative sono ragionevoli.

Il numero e la distribuzione dei casi sono definiti prima della calibrazione e registrati nel report; non si ottimizzano soglie sul medesimo insieme usato per la valutazione finale.

## Metriche

Il report considera almeno:
- accordo con revisione umana;
- falsi passaggi semantici;
- casi correttamente inviati a revisione;
- stabilità su riformulazioni equivalenti;
- latenza e costo per caso;
- errori o indisponibilità del servizio;
- quota di casi non decidibili;
- impatto sulla comprensibilità del flusso per il revisore umano.

Le metriche non producono automaticamente un via libera.

## Criteri di riuscita

Il pilota è tecnicamente riuscito soltanto se:
1. resta separato dai gate deterministici;
2. non produce scritture o pubblicazioni;
3. nessun caso riceve autorizzazione per effetto della sola probabilità;
4. i casi ambigui o insufficienti sono identificabili e riesaminabili;
5. il report consente di decidere se continuare, modificare o abbandonare l'approccio.

## Esito possibile

Il report finale deve proporre uno dei seguenti stati, senza applicarlo automaticamente:
- `STOP`: valore insufficiente o rischio non accettabile;
- `REVISE`: utile ma richiede un nuovo disegno;
- `CANDIDATE`: merita una successiva decisione TRAMA per un'integrazione limitata.

`CANDIDATE` non equivale ad `APPROVED`, non autorizza runtime e non modifica `DOS-A1`.

## Implementazione del banco di prova

Il banco di prova provider-neutral è versionato nel repository:

- `docs/pilots/trama-sa-01/cases.json`: corpus sintetico canonico;
- `docs/pilots/trama-sa-01/result-contract.md`: contratto dei risultati;
- `docs/pilots/trama-sa-01/report-template.md`: rapporto umano;
- `scripts/run_trama_sa01.py`: pre-gate, preparazione input e calcolo metriche;
- `tests/test_trama_sa01.py`: regressioni del banco di prova.

Comandi locali:

```sh
python3 scripts/run_trama_sa01.py validate
python3 scripts/run_trama_sa01.py prepare --output /tmp/trama-sa01-input.json
python3 -m unittest discover -s tests -v
```

Il comando `prepare` produce uno stato provider-neutral e **non effettua chiamate TypeSafe**. Un adapter TypeSafe potrà essere aggiunto soltanto dopo verifica della documentazione API/SDK corrente e disponibilità di credenziali dedicate; tale adapter non potrà introdurre scritture runtime.

### Stato operativo del pilota

- corpus e harness: **READY / INTEGRATED**;
- adattatore TypeSafe live: **READY / INTEGRATED**;\n- chiamata al provider TypeSafe: **RUN 001 COMPLETE / 10 RESULTS / 0 PROVIDER ERRORS**;
- revisione umana degli esiti TypeSafe Run 001: **COMPLETE / OUTCOME REVISE**;
- promozione di `TRAMA-ADR-009`: **NOT_AUTHORIZED**.


### Adattatore live

Il disegno e i confini dell'adattatore sono documentati in
`docs/pilots/trama-sa-01/typesafe-adapter.md`.

La versione SDK verificata è `typesafe-sdk 0.7.1`. Il workflow
`TRAMA-SA-01 TypeSafe Pilot` è manuale e non viene eseguito su push o pull request.


### Run 001

Il primo run live è completato. Il rapporto aggregato è in
`docs/pilots/trama-sa-01/run-001-analysis.md`.

La revisione umana del Run 001 è completata con esito **REVISE**. `TRAMA-ADR-009` non cambia stato.


### R2 — Evidence gate

Dopo la review umana del Run 001 con outcome **REVISE**, TRAMA-SA-01 introduce una seconda iterazione sperimentale:

- `evidence_sufficient` tramite `Noul`;
- `alignment` tramite `Choice` soltanto nel ramo sperimentale con evidenza sufficiente;
- boundary `0.5` usato solo per query routing nel laboratorio, non come soglia di autorizzazione;
- output ancora `advisoryOnly=true`;
- revisione umana obbligatoria dopo il run;
- nessuna promozione automatica di `TRAMA-ADR-009`.

Riferimento: `docs/pilots/trama-sa-01/r2-evidence-gate.md`.

Stato R2: **HUMAN_REVIEW_COMPLETE / OUTCOME CANDIDATE**.

Rapporto aggregato: `docs/pilots/trama-sa-01/r2-run-001-analysis.md`.


### Chiusura R2

La revisione umana ha confermato tutte le 10 etichette del Run R2.

Outcome: **CANDIDATE**.

R2 non promuove automaticamente `TRAMA-ADR-009`: qualunque passaggio da `PROPOSED` richiede un pacchetto decisionale separato e una review umana distinta.


### Decision package ADR-009

Dopo la chiusura R2 con outcome **CANDIDATE**, la decisione è separata dal pilota.

Riferimenti:

- `docs/decisions/trama-adr-009-decision-package.md`;
- `docs/pilots/trama-sa-01/r3-validation-plan.md`.

Stato corrente:

- `TRAMA-ADR-009 = PROPOSED`;
- proposta tecnica: **R3** prima di qualunque `APPROVED`;
- R3: **AUTHORIZED / IMPLEMENTATION_IN_REVIEW**;
- runtime nei prodotti: **NOT_AUTHORIZED**.


### R3 — Robustezza e calibrazione

R3 è autorizzato esclusivamente come esperimento controllato.

Perimetro preregistrato:
- 48 casi sintetici;
- 32 development;
- 16 holdout con `tuningAllowed=false`;
- 12 casi per ciascuna etichetta;
- quattro domini didattici;
- 24 coppie di parafrasi;
- policy baseline 0.5 e policy conservativa di escalation preregistrate;
- nessun parametro di soglia modificabile dal workflow.

Stato: **AUTHORIZED / IMPLEMENTATION_IN_REVIEW**.

`TRAMA-ADR-009` resta `PROPOSED`.
