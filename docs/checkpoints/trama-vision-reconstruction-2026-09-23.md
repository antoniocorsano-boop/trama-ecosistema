# Checkpoint — Ricostruzione della vision TRAMA

**Data:** 23 settembre 2026  
**Stato:** SNAPSHOT / NON NORMATIVE  
**Branch:** proposal/atlas-perche-verticale

## 1. Perché questo checkpoint

Durante il lavoro su ATLAS-PERCHÉ il livello di dettaglio tecnico sul prototipo offline rischiava di separarsi dalla vision complessiva. È stata quindi ricostruita la catena di significato dall'alto verso il basso.

## 2. Visione ricostruita

TRAMA collega:
- **Arena** — autorità curricolare;
- **Docente OS** — azione professionale del docente;
- **Atlas** — conoscenza, pubblicazione, materiali e fruizione pubblica.

Sintesi:

> **TRAMA trasforma il curricolo verticale dell'istituto in un sistema operativo didattico: Arena ne custodisce l'autorità, Docente OS lo traduce nell'azione professionale del docente, Atlas lo rende pubblico attraverso navigazione, materiali e attività di apprendimento accessibili.**

## 3. Relazione con la roadmap Atlas

Sequenza corrente:
1. F1 — Curricolo;
2. F2 — Esplora;
3. F3 — Materiali + Risorse;
4. capacità emergente — Attività Atlas;
5. ATLAS-PERCHÉ come reference implementation.

ATLAS-PERCHÉ non costituisce una nuova roadmap autonoma.

## 4. Decisione concettuale emersa

La domanda di prodotto è:

> **Un materiale Atlas può essere non soltanto un file, ma un'attività interattiva, pubblica, offline, curricolarmente collegata e priva di account?**

Il prototipo “Perché?” verifica questa ipotesi.

## 5. Significato dei test tecnici correnti

I test su local state, service worker e offline:
- non sono il fine didattico;
- non autorizzano runtime;
- non dimostrano efficacia educativa;
- verificano se una Learning Activity può essere realmente fruibile in Atlas senza account e senza rete.

## 6. Documenti consolidati

- docs/vision/product-strategy.md
- docs/vision/philosophy-in-development.md
- docs/product/atlas-public-curriculum-learning-hub.md
- docs/product/atlas-perche-verticale.md
- docs/product/atlas-perche-matrice-3-14.md
- docs/product/atlas-perche-five-pilots.md
- docs/product/atlas-perche-pilot-protocol.md
- docs/contracts/activity-package-v1.md
- docs/contracts/activity-package-v1.schema.json
- docs/reviews/atlas-perche-01-independent-review.md
- docs/reviews/atlas-perche-05-prototype-technical-ux-review.md

## 7. Regola di continuità

Le future implementazioni devono poter essere ricondotte a una delle seguenti domande:

1. quale problema educativo o professionale risolvono?
2. quale prodotto è autorevole?
3. quale persona mantiene la decisione?
4. quale parte della vision servono?
5. quale evidenza dimostra che funzionano realmente?
6. quale dato è strettamente necessario?

Se una feature non può essere ricondotta chiaramente a queste domande, deve essere riesaminata prima di ampliarne il perimetro.

## 8. Stato filosofico

Da questo checkpoint la filosofia dell'ecosistema non viene più ricostruita soltanto a posteriori dalle ADR. Le frasi-cardine e i principi emergenti vengono registrati nel living document con:
- contesto;
- stato;
- rapporto con governance;
- eventuale futura promozione normativa.

Questo checkpoint fotografa il passaggio da una documentazione centrata prevalentemente su decisioni e implementazioni a una documentazione che conserva anche il **razionale evolutivo del prodotto**.
