# R3-F0/S3-V2 — Human & Assistive Validation

**Stato:** IN_PROGRESS / NO_RUNTIME  
**Parent:** R3-F0/S3 — EXIT_GATES_PENDING  
**Base integrata:** S3-V1 exact head `5e1a6feb1d3a4ae08f3547841e7ceef20e37bed6`, merge `4e34b363b2969051ff8dce4a7ee5a88d09b400a7`

## Scopo

Chiudere, con evidenza osservabile, i gate rimasti aperti dopo S3-V1:

- review visuale Android;
- review visuale desktop;
- review visuale LIM;
- tastiera;
- reflow 320 CSS px;
- non-text contrast;
- scala di grigi;
- verifica assistiva strutturale.

Il test con **screen reader reale** resta distinto: nessun test DOM/AX può essere dichiarato equivalente a una prova con tecnologia assistiva effettiva.

## 1. Evidenza V1 riesaminata

Artifact CI V1 analizzato direttamente:

- `android-390x844.png`;
- `desktop-1440x1100.png`;
- `lim-1920x1080.png`;
- `rendered-dom.html`.

Esito preliminare umano:

| Gate | Esito V1 | Nota |
| --- | --- | --- |
| Android, primo viewport | PASS | gerarchia chiara, nessuna sovrapposizione, testo leggibile |
| Desktop, primo viewport | PASS | lettura equilibrata, nessuna deriva dashboard/card-first |
| LIM, primo viewport | CHANGES_REQUIRED | contenuto troppo piccolo e concentrato per lettura a distanza |
| Scala di grigi, Android primo viewport | PASS | navigazione, gerarchia e fonte Arena restano comprensibili senza colore |

## 2. Remediation LIM

V2 aumenta, solo da `1600px` in su:

- dimensione base del testo;
- ampiezza utile del contenuto;
- titoli;
- target interattivi;
- metadata/status;
- spaziatura verticale e orizzontale.

Il comportamento Android e desktop ordinario non viene modificato dalla nuova media query LIM.

## 3. Evidenza browser estesa

Il workflow V2 deve produrre screenshot per:

- top;
- Student Learning Hub;
- journey docente;
- mappa 2D;
- stress test stati.

Viewport:

- Android-like `390×844`;
- desktop `1440×1100`;
- LIM `1920×1080`;
- reflow `320×800`.

Questo impedisce di validare soltanto la parte alta della pagina.

## 4. Harness 320 CSS px

`validation-harness.html` esegue in browser reale e deve produrre `data-validation="PASS"`.

Controlli:

- nessun overflow orizzontale della pagina a 320 CSS px;
- a 320 CSS px la visuale 2D viene sostituita dall'elenco equivalente, come previsto dalla matrice S3 per Android/mobile;
- ArrowRight cambia tab, selezione e pannello;
- Home torna al primo tab;
- disclosure provenance apre correttamente;
- skip link diventa visibile al focus;
- i target di focus campione non risultano interamente fuori viewport dopo il focus;
- le etichette CurricularStatus / EditorialStatus / UIFeedbackStatus restano nel testo anche senza colore.

## 5. Non-text contrast

V2 verifica automaticamente almeno 3:1 per indicatori necessari:

- focus ring su bianco;
- bordo forte su bianco;
- indicatore Arena;
- indicatore Atlas;
- stato ritirato;
- errore UI.

I bordi decorativi/subtle non sono usati come unico segnale necessario di stato o controllo.

## 6. Scala di grigi

La conversione dell'evidenza V1 mostra che:

- link e navigazione restano identificabili tramite sottolineatura/testo;
- fonte Arena resta esplicita testualmente;
- gerarchia non dipende dal colore;
- gli stati sono etichettati testualmente.

V2 richiede una nuova review sulle catture delle sezioni degli stati.

## 7. Tastiera

Automazione browser/harness verifica il contratto minimo:

- tablist/tab/tabpanel;
- ArrowLeft/ArrowRight/Home/End già coperti staticamente;
- ArrowRight e Home esercitati nel DOM renderizzato;
- focus effettivamente spostato;
- pannello inattivo/attivo aggiornato;
- disclosure e skip link esercitati.

Una review umana resta necessaria per la qualità complessiva dell'ordine di focus.

## 8. Screen reader

Stato: **PENDING_REAL_ASSISTIVE_TEST**.

Già verificabile automaticamente:

- unico `h1`;
- landmark/nav nominati;
- `aria-current`;
- `details/summary`;
- tab semantics;
- mappa visuale esclusa dall'AT;
- elenco equivalente presente;
- `role=status` limitato al feedback transitorio.

Non viene dichiarato PASS screen reader finché non esiste una prova reale con tecnologia assistiva.

## 9. Exit criteria V2

V2 può essere integrato quando:

- [ ] browser evidence V2 PASS;
- [ ] harness 320 PASS;
- [ ] non-text contrast PASS;
- [ ] Android visual review PASS;
- [ ] desktop visual review PASS;
- [ ] LIM visual review PASS dopo remediation;
- [ ] scala di grigi PASS sulle sezioni critiche;
- [ ] review tastiera umana PASS o nessun blocker residuo;
- [ ] review terza PASS;
- [ ] HUMAN EXACT-HEAD REVIEW PASS.

Il gate screen reader reale può restare esplicitamente PENDING soltanto se S3 e R3-F0 **non vengono chiusi**.

## 10. Confini

V2 non autorizza:

- frontend Atlas di produzione;
- deploy pubblico;
- account/login studenti;
- analytics o tracking;
- runtime Docente OS → Atlas;
- Officina runtime;
- DOS-A1;
- chiusura automatica di S3 o R3-F0.
