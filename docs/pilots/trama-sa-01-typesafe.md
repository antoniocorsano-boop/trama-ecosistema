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
