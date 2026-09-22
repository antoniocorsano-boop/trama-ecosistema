# R3-F0/S3-V1 — Rendered Prototype Validation

**Stato:** IN_PROGRESS / NO_RUNTIME  
**Parent:** R3-F0/S3 — EXIT_GATES_PENDING  
**Artefatto:** `docs/product/prototypes/r3-f0-s3-v1/index.html`

## Scopo

Produrre e validare un prototipo renderizzabile reale dei journey S3 senza introdurre un frontend di produzione.

Il prototipo:

- usa solo HTML e CSS locali;
- usa un solo JavaScript locale minimale per il pattern accessibile Lezioni ↔ Obiettivi;
- non usa framework, package manager, font esterni o CDN;
- lo script locale non effettua rete, tracking o accesso a dati;
- non effettua rete, analytics o tracking;
- non contiene dati personali;
- non implementa runtime cross-product;
- non modifica autorità o contratti di Arena, Atlas o Docente OS.

## 1. Evidence implementata

- navigazione primaria Curricolo / Percorsi / Risorse / Esplora;
- journey pubblico/famiglia;
- journey studente privacy-first;
- journey docente;
- provenance tramite `details/summary`;
- progressione annuale;
- Visuale | Elenco;
- POC 2D statico;
- equivalente elenco;
- semantic zoom a tre livelli;
- CurricularStatus / EditorialStatus / UIFeedbackStatus simultanei;
- skip link;
- tabs Lezioni ↔ Obiettivi con ruoli ARIA e tastiera ArrowLeft/ArrowRight/Home/End;
- focus visibile;
- target primari almeno 44 px nel prototipo;
- reflow responsive;
- modalità grande schermo via media query;
- `prefers-reduced-motion`;
- nessuna informazione essenziale affidata esclusivamente al colore.

## 2. Contrasto dei token del prototipo

I valori CSS sono **valori di prototipo, non palette di marca definitiva**.

Sono scelti con margine rispetto ai requisiti minimi:

| Ruolo | Valore | Uso |
| --- | --- | --- |
| text-primary | `#1f2937` | testo principale |
| text-secondary | `#475569` | testo secondario / metadata |
| action-primary | `#1d4ed8` | link/azione |
| focus-ring | `#0369a1` | indicatore focus |
| authority-arena | `#312e81` | segnale Arena + testo |
| domain-atlas | `#0f766e` | segnale Atlas + testo |
| editorial-withdrawn | `#7c2d12` | stato editoriale |
| ui-error | `#991b1b` | feedback errore |

I colori non costituiscono da soli il significato: ogni stato contiene etichetta testuale esplicita.

## 3. Matrice di validazione

Browser evidence automatica corrente: workflow `R3-F0 S3-V1 Browser Evidence` PASS su 390×844, 1440×1100 e 1920×1080. Le verifiche qualitative restano umane.

| Gate | Metodo | Stato iniziale | Evidenza richiesta |
| --- | --- | --- | --- |
| Android portrait | browser headless + review umana | AUTOMATED_RENDER_PASS / HUMAN_REVIEW_PENDING | screenshot + note reflow/touch |
| Desktop | browser headless + review umana | AUTOMATED_RENDER_PASS / HUMAN_REVIEW_PENDING | screenshot + note layout/focus |
| LIM / grande schermo | browser headless + review umana | AUTOMATED_RENDER_PASS / HUMAN_REVIEW_PENDING | screenshot/foto + leggibilità a distanza |
| Tastiera | walkthrough | PENDING | ordine focus + skip link + details |
| Screen reader | prova reale | PENDING | headings/nav/lists/details/status |
| Use of Color 1.4.1 | review visuale | PENDING | scala di grigi / testo di stato |
| Contrast 1.4.3 | misurazione | PARTIAL_DESIGN_EVIDENCE | risultati contrasto |
| Reflow 1.4.10 | resize/zoom | PENDING | 320 CSS px / zoom |
| Non-text Contrast 1.4.11 | misurazione | PENDING | focus/bordi necessari |
| Keyboard 2.1.1 | walkthrough | PENDING | tutte le azioni raggiungibili |
| Focus Visible 2.4.7 | walkthrough | PENDING | focus sempre visibile |
| Focus Not Obscured 2.4.11 | walkthrough | PENDING | focus non coperto |
| Target Size 2.5.8 | inspection | DESIGN_PASS | controlli principali >=44 px |

## 4. Protocollo Android

Verificare almeno:

1. portrait;
2. larghezza piccola senza scroll orizzontale della pagina;
3. navigazione primaria che va a capo senza sovrapporsi;
4. dettagli/provenance apribili;
5. stati leggibili senza zoom obbligatorio;
6. mappa visuale non impedisce l'uso dell'elenco equivalente;
7. nessun hover richiesto;
8. nessuna informazione essenziale troncata.

## 5. Protocollo desktop

Verificare:

1. gerarchia non “dashboard SaaS”;
2. contenuto principale dominante;
3. card limitate a oggetti autonomi/stress test;
4. tab order logico;
5. focus visibile;
6. metadata leggibili;
7. Visuale | Elenco coerenti;
8. provenance disponibile ma non invasiva.

## 6. Protocollo LIM

Verificare:

1. titoli leggibili a distanza;
2. testo secondario non troppo piccolo;
3. metadata `type.metadata` equivalenti leggibili;
4. densità ridotta;
5. stato curricolare/editoriale/UI distinguibile;
6. mappa leggibile senza essere unica modalità;
7. nessun tooltip necessario.

## 7. Protocollo tastiera

Ordine atteso:

1. skip link;
2. navigazione primaria;
3. breadcrumb e annualità;
4. link curricolari;
5. `details/summary` provenance;
6. switch Lezioni / Obiettivi;
7. materiali;
8. risorse docente;
9. Visuale / Elenco;
10. azione Riprova.

Nessun elemento statico deve entrare nel tab order artificialmente.

## 8. Protocollo screen reader

Verificare:

- un solo `h1`;
- gerarchia heading coerente;
- nomi delle navigazioni;
- breadcrumb;
- annualità corrente;
- `details/summary`;
- liste curricolari;
- visuale mappa esclusa dall'AT e sostituita dall'elenco equivalente;
- `role=status` limitato al feedback UI transitorio;
- EditorialStatus e CurricularStatus letti come contenuto persistente, non annunci live.

## 9. Criterio di chiusura S3-V1

S3-V1 può produrre PASS soltanto quando:

- [ ] Android PASS;
- [ ] desktop PASS;
- [ ] LIM PASS;
- [ ] tastiera PASS;
- [ ] screen reader PASS;
- [ ] contrasto/reflow PASS;
- [ ] nessun blocker di comprensibilità;
- [ ] review terza PASS;
- [ ] HUMAN EXACT-HEAD REVIEW PASS.

Il merge del prototipo **non equivale** automaticamente al PASS di questi gate.

## 10. Confini

S3-V1 non autorizza:

- frontend Atlas di produzione;
- deploy pubblico;
- nuove dipendenze frontend;
- account/login studenti;
- runtime Docente OS → Atlas;
- Officina runtime;
- DOS-A1;
- chiusura automatica di S3 o R3-F0.
