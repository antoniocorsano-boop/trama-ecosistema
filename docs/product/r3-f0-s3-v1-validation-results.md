# R3-F0/S3-V1 — Validation Results

**Stato:** STATIC_CONTRACT_PASS / REAL_RENDERING_PENDING / NO_RUNTIME  
**Artefatto:** `docs/product/prototypes/r3-f0-s3-v1/index.html`

## 1. Validazione strutturale eseguita

Verifica diretta del contenuto HTML/CSS del ramo S3-V1.

Esito:

- singolo `h1`: PASS;
- skip link verso `main`: PASS;
- tutte le ancore interne hanno un target esistente: PASS;
- nessun `id` duplicato: PASS;
- nessun `script`: PASS;
- nessun asset o URL esterno: PASS;
- nessun framework frontend: PASS;
- visuale della mappa esclusa dall'albero accessibile con `aria-hidden=true`: PASS;
- elenco equivalente presente: PASS;
- `role=status` presente solo sul feedback UI transitorio: PASS;
- `details/summary` per provenance: PASS;
- `aria-current` presente dove applicabile: PASS;
- `:focus-visible`: PASS;
- skip link visibile al focus: PASS;
- target primari da almeno 44 px nel CSS del prototipo: PASS;
- media query mobile: PASS;
- media query grande schermo/LIM: PASS;
- `prefers-reduced-motion`: PASS;
- nessuna dipendenza da hover: PASS;
- etichette CurricularStatus / EditorialStatus / UIFeedbackStatus: PASS.

## 2. Contrasto misurato sui ruoli campione

Rapporto contro bianco:

| Ruolo | Valore | Contrasto | Esito |
| --- | --- | ---: | --- |
| text-primary | `#1f2937` | 14.68:1 | PASS |
| text-secondary | `#475569` | 7.58:1 | PASS |
| action-primary | `#1d4ed8` | 6.70:1 | PASS |
| focus-ring | `#0369a1` | 5.93:1 | PASS |
| authority-arena | `#312e81` | 11.42:1 | PASS |
| domain-atlas | `#0f766e` | 5.47:1 | PASS |
| editorial-withdrawn | `#7c2d12` | 9.37:1 | PASS |
| ui-error | `#991b1b` | 8.31:1 | PASS |

Questa misurazione verifica i valori campione, non sostituisce il controllo completo di ogni combinazione resa dal browser.

## 3. Cosa NON è ancora PASS

Il runtime di analisi disponibile non ha accesso di rete al ramo GitHub per materializzare automaticamente il file in Chromium. Perciò non vengono attribuiti PASS non osservati.

Restano PENDING:

- Android portrait reale/simulato con rendering;
- desktop con rendering;
- LIM / grande schermo;
- walkthrough tastiera sul DOM renderizzato;
- screen reader reale;
- reflow a 320 CSS px e zoom;
- non-text contrast sui bordi/indicatori nel rendering;
- controllo visuale in scala di grigi.

## 4. Interpretazione

`STATIC_CONTRACT_PASS` significa che il prototipo è sufficientemente coerente per essere sottoposto a rendering e review umana.

Non significa:

- S3 chiuso;
- R3-F0 exit PASS;
- frontend Atlas autorizzato;
- runtime cross-product autorizzato;
- DOS-A1 autorizzato.
