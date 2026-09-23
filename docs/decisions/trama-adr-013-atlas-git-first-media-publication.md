# TRAMA-ADR-013 — Substrato Git-first per la pubblicazione degli asset Atlas

**Stato:** PROPOSED  
**Data:** 2026-09-23  
**Perimetro:** TRAMA · Atlas · Docente OS · Officina materiali  
**Runtime cross-product:** NOT AUTHORIZED  
**Riferimento operativo:** `ATLAS-MAT-PUB-01`

## Contesto

TRAMA dispone già di due decisioni pertinenti:

- **TRAMA-ADR-008** governa la pubblicazione esplicita Docente OS → Atlas tramite `LessonPublicationManifest` e `PublicationReceipt`;
- **TRAMA-ADR-010** separa l'Officina materiali da Atlas e da Docente OS, mantenendo il controllo umano.

Le prove reali del 23 settembre 2026 hanno mostrato un ulteriore bisogno tecnico: gli artefatti grafici approvati dal docente devono poter diventare asset pubblici Atlas senza introdurre un DAM, un CMS generalista, un database o un nuovo backend permanente.

## Decisione proposta

1. Gli asset pubblici Atlas adottano un **substrato Git-first**: file versionati nel repository Atlas, metadati strutturati e deploy statico verificabile.
2. La pipeline canonica è:
   `asset → validate → optimize → manifest → commit → deploy → smoke test → PublicationReceipt`.
3. Per le immagini raster la capacità di normalizzazione proposta usa **Sharp** o componente equivalente compatibile con lo stack Node, per:
   - ridimensionamento;
   - conversione WebP/AVIF quando appropriata;
   - rimozione di metadati non necessari;
   - generazione di eventuali derivate.
4. SVG resta ammesso per infografiche e schede vettoriali quando accessibile, sicuro e coerente con il contenuto.
5. Non viene adottato, in questa fase, un DAM/CMS completo (Payload, Directus, Strapi, ResourceSpace, Pimcore o equivalenti) come dipendenza architetturale necessaria.
6. Decap CMS e Keystatic restano **riferimenti/pattern valutabili**, non dipendenze obbligatorie.
7. Ogni asset pubblicato deve avere metadati minimi, provenance, alt text quando applicabile, checksum/impronta, stato editoriale, binding alla lezione e URL pubblico verificato.
8. La pubblicazione resta **esplicita, reversibile e sotto controllo del docente**. La pipeline tecnica non costituisce approvazione editoriale o curricolare.
9. Atlas può gestire identità, versione e stato dei propri asset pubblici; Arena resta autorità curricolare e Docente OS resta autorità del contesto e della decisione professionale.
10. Questa ADR **non autorizza** da sola:
    - automazione Docente OS → Atlas;
    - pubblicazione senza conferma docente;
    - nuove API cross-product;
    - dati personali degli studenti;
    - DOS-A1;
    - un servizio media persistente separato.

## Razionale

La soluzione Git-first:

- riusa il repository e la pipeline di deploy già esistenti;
- mantiene URL pubblici stabili e versionabili;
- consente rollback e audit tramite commit SHA;
- evita backend, storage e autenticazione aggiuntivi;
- riduce superficie operativa e costi;
- è compatibile con Atlas statico e privacy-first.

## Alternative considerate

### DAM/CMS completo
Potente ma sovradimensionato per il bisogno corrente; introduce DB, backend, storage o superficie amministrativa aggiuntiva.

### Servizio immagini dinamico
Utile ad alta scala o con fonti remote, ma non necessario per l'attuale pubblicazione statica.

### Git-first + normalizzazione build-time
Scelta proposta perché minima, tracciabile e coerente con l'architettura corrente.

## Impatto sul controllo umano

**STRENGTHENED.**

Il docente continua a decidere se il materiale viene adottato, pubblicato, sostituito o ritirato. La pipeline automatizza soltanto trasformazioni tecniche deterministiche e verifiche.

## Stato implementativo

La distribuzione statica Atlas e la verifica pubblica degli URL sono già dimostrate. La normalizzazione automatica degli asset, il manifest canonico completo e la receipt dedicata richiedono slice implementative separate.

## Gate per promozione ad APPROVED

- review architetturale;
- coerenza con ADR-008 e ADR-010;
- schema `ATLAS-MAT-PUB-01` validato;
- prova su almeno un'immagine raster e un SVG;
- controllo accessibilità;
- controllo privacy/metadata stripping;
- rollback verificato;
- HUMAN EXACT-HEAD REVIEW PASS.
