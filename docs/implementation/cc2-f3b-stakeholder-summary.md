# CC2-F3B — Stakeholder Summary, Contextual Help & Living Dossier

**Data:** 24 settembre 2026  
**Stato:** ACTIVE / HUMAN REVIEW REQUIRED

## Scopo

Trasformare la foundation F3A in una superficie comprensibile a dirigente scolastico, DPO, referenti e altri stakeholder, mantenendo il Control Center read-only e senza produrre autocertificazioni.

## 1. Stakeholder Summary

La Home espone una sezione dedicata che mostra per ogni requisito:

- dominio;
- requisito;
- stato attuale;
- target;
- prerequisiti evidenziali soddisfatti;
- prerequisiti mancanti;
- readiness discreta, senza percentuale di conformità.

La rappresentazione dinamica visualizza il passaggio tra stati e target, ma il colore non è mai l'unico vettore informativo.

## 2. Contextual Help Contract

Ogni elemento non autoesplicativo deve poter fornire una spiegazione contestuale.

Modalità supportate:

- mouse hover;
- focus da tastiera;
- tap/click su mobile;
- chiusura esplicita;
- Escape da tastiera.

L'help deve spiegare significato, provenienza o implicazione dell'elemento. Non deve contenere informazioni indispensabili che non siano disponibili anche nella vista o nel dossier.

## 3. Living Stakeholder Dossier

Lo stesso snapshot che alimenta il cruscotto genera:

- `control-center/reports/stakeholder-assurance.html`;
- `control-center/reports/stakeholder-assurance.md`.

Il dossier contiene:

- data/ora dello snapshot;
- stato e target;
- evidenze presenti;
- gap;
- autorità/review;
- standard/riferimenti;
- limiti.

L'HTML è stampabile e salvabile come PDF dal browser. Non costituisce certificazione, parere legale o dichiarazione generale di conformità.

## 4. Aggiornamento automatico

`.github/workflows/control-center-build.yml` esegue una build:

- a ogni push su `main` che modifica fonti rilevanti;
- ogni 6 ore;
- manualmente tramite workflow dispatch.

Ogni build:

1. rigenera lo snapshot;
2. rigenera il dossier HTML/Markdown;
3. verifica la presenza dei contenuti minimi;
4. produce un unico bundle `trama-control-center-bundle`.

Questo impedisce divergenza tra dati del cruscotto e documento stakeholder.

## 5. Hosting

Al 24 settembre 2026 il repository non ha GitHub Pages attivo (`has_pages=false`).

La build automatica è quindi pronta, ma la distribuzione pubblica automatica richiede un canale di hosting:

- GitHub Pages, oppure
- Render/altro hosting statico già governato.

L'hosting deve distribuire il bundle prodotto dalla pipeline, senza permettere alla UI di interrogare direttamente GitHub.

## 6. Dinamicità visuale

Ammessa:

- aggiornamento visibile quando arriva un nuovo snapshot;
- progressione di maturity/readiness;
- transizioni brevi di stato;
- evidenza di fresh/stale/partial;
- drill-down e contextual help;
- future graph transitions governate.

Non ammessa:

- animazione continua decorativa;
- pulsazioni aggressive;
- movimento che possa essere confuso con un cambiamento reale;
- motion non rispettosa di `prefers-reduced-motion`.

## 7. Dove serve un esperto

Non serve un esperto esterno per:

- architettura dati;
- dashboard;
- PWA;
- pipeline;
- accessibilità tecnica di base;
- generazione del dossier;
- evidence binding.

Servono invece soggetti competenti quando si vuole dichiarare:

- parere privacy/DPO;
- validazione legale;
- audit indipendente di accessibilità;
- security assessment indipendente;
- certificazione formale.

Il Control Center deve registrare tali esiti, non sostituirsi al soggetto competente.

## Gate F3B

- Control Center validation PASS;
- snapshot/assurance validation PASS;
- build bundle PASS;
- test help mouse/tap/keyboard;
- report generation PASS;
- review indipendente;
- HUMAN EXACT-HEAD REVIEW.
