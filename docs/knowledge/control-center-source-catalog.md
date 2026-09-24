# TRAMA Control Center v2 — Catalogo delle fonti

**Data:** 24 settembre 2026  
**Stato:** BASELINE CC2-F0 / READ_ONLY

## 1. Scopo

Definire quali fonti il Control Center v2 può leggere e quale ruolo hanno. Il catalogo non crea nuove authority.

## 2. Principio

Il collector può osservare una fonte solo se:

- è dichiarata;
- il suo ruolo è esplicito;
- non introduce dati personali non necessari;
- il dato è riconducibile a una provenance verificabile;
- il suo contenuto non viene promosso a fonte autorevole oltre il dominio già governato.

## 3. Fonti canoniche

| Fonte | Dominio | Ruolo nel Control Center |
| --- | --- | --- |
| `STATUS.md` | TRAMA | stato corrente dell’ecosistema |
| `ROADMAP.md` | TRAMA | sequenza e capacità pianificate |
| Decision Register / ADR | TRAMA | decisioni di governance e stato delle ADR |
| Piano operativo atomico | TRAMA | priorità e sequenza operativa |
| Source Registry | TRAMA | ownership e authority delle fonti |
| repository Arena | Arena | evidenze di implementazione, PR, workflow e release del dominio Arena |
| repository Curriculum-Atlas | Atlas | evidenze di implementazione, PR, workflow e release del dominio Atlas |
| repository Docente OS | Docente OS | evidenze di implementazione, PR, workflow e release del dominio Docente OS |
| repository TRAMA | TRAMA | governance, documentazione, schema, workflow e Control Center |

## 4. Fonti tecniche osservabili

Sono osservabili in sola lettura:

- pull request;
- commit/exact head;
- workflow run;
- check/gate;
- artifact metadata quando necessario alla verifica;
- deploy/canary receipt pubbliche o governate;
- file canonici versionati.

## 5. Fonti non canoniche

Possono essere mostrate come evidenza o contesto, mai come authority implicita:

- commenti automatici di strumenti;
- issue;
- note di review;
- prototipi;
- screenshot;
- report di strumenti advisory;
- asset di design.

Ogni dato non canonico deve mantenere il collegamento alla fonte canonica che governa il relativo stato, se esiste.

## 6. Precedenze

In caso di conflitto:

1. ADR/contratti approvati;
2. `STATUS.md` per lo stato corrente;
3. piano operativo atomico per priorità/sequenza;
4. specifiche integrate del dominio;
5. evidenze tecniche puntuali;
6. commenti e strumenti advisory.

Il Control Center deve visualizzare il conflitto, non risolverlo inventando un nuovo stato.

## 7. Freshness

- exact-head review: EVENT_BOUND;
- workflow/test: EVENT_BOUND o RUNTIME_BOUND;
- STATUS/ROADMAP: UNTIL_CHANGE;
- canary/runtime: RUNTIME_BOUND;
- review manuali periodiche: MANUAL_REVIEW;
- adozione: TIME_BOUND quando definito dal relativo protocollo.

## 8. Privacy

Esclusi dalla raccolta:

- account studente;
- profili personali;
- tracking individuale;
- contenuti privati non necessari al monitoraggio;
- dati personali di docenti non indispensabili alla provenance tecnica.

## 9. Failure mode

Se una fonte fallisce:

- non si azzera lo stato;
- si usa l’ultimo snapshot valido, se disponibile;
- il dato è marcato `STALE` o `PARTIAL`;
- la fonte indisponibile è visibile nella Source Health;
- nessuna maturità viene promossa sulla base di dati mancanti.
