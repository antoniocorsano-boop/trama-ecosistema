# R3-F0/S3-V1 — Validation Results

**Stato:** STATIC_CONTRACT_PASS / AUTOMATED_BROWSER_RENDER_PASS / HUMAN_VISUAL_PENDING / NO_RUNTIME  
**Artefatto:** `docs/product/prototypes/r3-f0-s3-v1/index.html`

## 1. Validazione strutturale eseguita

Verifica diretta del contenuto HTML/CSS del ramo S3-V1.

Esito:

- singolo `h1`: PASS;
- skip link verso `main`: PASS;
- tutte le ancore interne hanno un target esistente: PASS;
- nessun `id` duplicato: PASS;
- unico script locale `prototype.js`, senza dipendenze esterne o rete: PASS;
- nessun asset o URL esterno: PASS;
- nessun framework frontend: PASS;
- visuale della mappa esclusa dall'albero accessibile con `aria-hidden=true`: PASS;
- relazioni visuali O2.1 → risorsa e O2.1 → raccordo riallineate all'elenco equivalente: PASS;
- elenco equivalente presente: PASS;
- `role=status` presente solo sul feedback UI transitorio: PASS;
- `details/summary` per provenance: PASS;
- tabs Lezioni ↔ Obiettivi con `tablist/tab/tabpanel` e tastiera ArrowLeft/ArrowRight/Home/End: PASS statico;
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

## 3. Browser evidence automatica

Il workflow dedicato **R3-F0 S3-V1 Browser Evidence** ha eseguito con Chrome/Chromium headless:

- rendering Android-like `390 × 844`: PASS;
- rendering desktop `1440 × 1100`: PASS;
- rendering grande schermo/LIM `1920 × 1080`: PASS;
- DOM renderizzato con marker critici: PASS;
- generazione screenshot: PASS;
- upload artifact: PASS.

Run di riferimento sull'exact head `8c3af92dfdf5841522d2072c7f0496e8d4d83f17`: `35683224857`.

Artifact: `r3-f0-s3-v1-rendering` (id `10676260188`).

Questo dimostra che il prototipo viene realmente materializzato dal browser nei tre viewport. Non equivale a una review visuale umana o a un test assistivo.

## 4. Cosa resta PENDING

- review visuale umana del rendering Android;
- review visuale umana desktop;
- review visuale umana LIM / grande schermo;
- walkthrough tastiera sul DOM renderizzato;
- screen reader reale;
- reflow a 320 CSS px e zoom;
- non-text contrast completo sui bordi/indicatori nel rendering;
- controllo visuale in scala di grigi.

## 5. Interpretazione

`STATIC_CONTRACT_PASS` significa che il prototipo è sufficientemente coerente per essere sottoposto a rendering e review umana.

Non significa:

- S3 chiuso;
- R3-F0 exit PASS;
- frontend Atlas autorizzato;
- runtime cross-product autorizzato;
- DOS-A1 autorizzato.


## 6. Consolidamento exit review 2026-09-22

Le evidenze browser sono state riesaminate direttamente sui tre screenshot dell'artifact `r3-f0-s3-v1-rendering`.

Esito indipendente:

- Android-like 390×844: `VISUAL_PASS_WITH_SCOPE_LIMIT`;
- desktop 1440×1100: `VISUAL_PASS`;
- LIM 1920×1080: `VISUAL_PARTIAL` perché leggibilità a distanza di navigazione e metadata richiede ancora verifica reale.

La checklist finale consolidata è in:

`docs/product/r3-f0-s3-exit-review-2026-09-22.md`

Questo consolidamento non sostituisce la review umana/assistiva e non chiude S3.
