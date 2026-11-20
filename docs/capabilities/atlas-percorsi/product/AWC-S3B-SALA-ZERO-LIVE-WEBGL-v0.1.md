# AWC S3b — Sala Zero WebGL interattiva, prova isolata

Data: 20 novembre 2026. **CANDIDATE / DRAFT / NO STUDENT AUTHORIZATION / NO DEPLOY**.
Dipendenza: Studio Atlas PR #349 (Mondo/Scene) e PR #350 (fotogrammi AWC-F).
La Biblioteca Atlas rimane separata e invariata.

## Scopo verificabile
L'ideatore apre MUSEO ZERO → Scene → `MZ4_TEST_MAPPING` e attiva
**Esplora la Sala Zero · laboratorio 3-D**, senza importare un archivio.
Viene montato un contesto WebGL locale solo dopo l'azione esplicita.
Spostando il dito sullo schermo, la fotocamera ruota intorno alla sala.
Si può ripristinare l'inquadratura esattamente, simulare il segnale B e
confrontare due profili di illuminazione senza modificare il Percorso.

## Riuso e fonte
- La specifica JSON in `lib/fixtures/awc-museo-zero-transfer.json` è copiata senza
  alcuna modifica dall'artefatto sorgente in Curricolo Atlas, PR #136,
  commit `6285c47cf3c87e847fd6d00f8f6dfc8142590760`.
  Blob Git esatto: `f8e91ca7fd7aa2b5df9b777703ca443df2dbc912`;
  una prova automatica controlla questa identità.
- Questa è una **copia immutabile per esecuzione/qualifica**, non una nuova fonte di
  authoring o di verità pedagogica. Restano 16 oggetti e 192 triangoli,
  materiali, camera e legami narrativi canonici.
- Motore: **Three.js 0.128.0**, identica versione r128 già impiegata in AWC-F;
  dipendenza diretta fissata in Studio Atlas, importata solo all'apertura.
  Nessuna libreria tridimensionale alternativa o richiesta a una rete esterna.
- Direzione camera: usa il parametro AWC/ASD `camera.orbit` (rad),
  origine 0, variazione verificata 0.12, limite reversibile da -0.3 a +0.3.
  Controlli: trascinamento, tastiera, pulsanti e ripristino.
- Segnale B: simulazione visiva, non comanda dispositivi o installazioni.

## Esperimento artistico dopo la prova su Android
Le schermate reali del 20 novembre mostrano differenze fra Blender (scuro,
materiali e profondità) e WebGL (eccesso di luminosità, scarsa definizione).
Sono ora disponibili **due profili distinti e reversibili**:

1. `Luce originale AWC-F`: valori di illuminazione ed esposizione del
   renderer WebGL preesistente, senza mutazioni del JSON.
2. `Luce equilibrata · prova`: riduzione sperimentale di luce ambientale,
   intensità direzionale, riempimento ed esposizione, con ombre leggere
   a 512×512. Nessuna pretesa di fedeltà automatica a Cycles/AgX.

La geometria resta intenzionalmente semplice; la qualità museale finale
e l'equivalenza percettiva richiedono riesame artistico reale.

## Isolamento e consumo di risorse
Il motore è caricato in ritardo, soltanto nel laboratorio. Risoluzione
massima della scena 720×540 CSS pixel, DPR limitato a 1.5, nessuna
animazione continua: una nuova immagine viene disegnata solo
durante un'interazione, una modifica di stato o un ridimensionamento.
Al termine si eliminano geometrie, materiali, contesto e gestione degli
eventi. L'indisponibilità WebGL mostra un avviso e non blocca
le Scene o la rappresentazione illustrata.

## Autorità e perimetro
Non modifica `PathwayProject`, `worldAfter`, il pacchetto pubblicabile,
l'anteprima dello studente, un master Blender, la Biblioteca o il curricolo.
Conserva `studentAuthorized=false`, `publishable=false`,
`realHardwareControl=false`. Nessun accesso a servizi a pagamento,
caricamento asset, persistenza o telemetria.

## Qualificazione
- Test locali: identità del blob, inventario, camera orbitale,
  rollback, ipotesi di illuminazione.
- Test nel navigatore a 390 px: WebGL software reale, trascinamento,
  segnale B, ripristino e pulizia risorse.
- Test a 320 px: indisponibilità del motore gestita senza autorizzazioni.
- Regres­sioni Studio Atlas–Atlas e governance cumulative.

**Non equivale a collaudo Android fisico né a pubblicazione del prodotto**;
la prova concreta sul dispositivo dopo integrazione rimane attività distinta.
