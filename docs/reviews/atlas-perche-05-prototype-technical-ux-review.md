# ATLAS-PERCHÉ-05 — Review tecnica e UX del prototipo

**Data:** 23 settembre 2026  
**Oggetto:** Curriculum-Atlas PR #24  
**Exact head esaminato:** `4eb8fc4abe0e08c8f20c33a93cd40f1cceda9fe5`  
**Stato:** CONDITIONAL PASS / OFFLINE GATE PENDING

## Ambito

Review indipendente del prototipo pubblico “Perché?” rispetto a:
- coerenza con ATLAS-PERCHÉ-01/02/03/04;
- privacy;
- percepibilità delle scritture locali;
- accessibilità di base;
- esperienza mobile/desktop;
- separazione dal runtime cross-product;
- comportamento offline.

## Esiti già verificati

PASS:
- PR in Draft;
- mergeable=true;
- nessun thread di review aperto;
- Foundation PASS sul precedente exact head e riavviato sul corrente;
- TRAMA Perceptible Write PASS sul corrente;
- nessun account studente;
- nessun dato personale richiesto;
- nessun tracking introdotto dal prototipo;
- stato attività salvato solo localmente;
- feedback della persistenza locale visibile tramite stato accessibile;
- navigazione lineare e controlli compatibili con tastiera;
- route e contenuto separati dalla pipeline Docente OS → Atlas;
- nessuna promozione automatica del contratto ActivityPackage.

## Correzioni effettuate durante la review

1. dichiarata la superficie di scrittura locale in TRAMA-PW-01;
2. introdotto feedback persistente/accessibile per la memorizzazione locale;
3. aggiunta copertura browser specifica mobile + desktop;
4. aggiunto test della persistenza localStorage;
5. aggiunto test della cache offline e riapertura senza rete;
6. corretti errori lint JSX;
7. corretto il test Playwright che aveva accidentalmente commentato l'importazione `chromium`.

## Punto ancora aperto

Il solo punto non ancora certificato al momento di questa review è il **gate browser/offline sull'exact head corrente**.

Il merge e qualunque prova con utenti reali restano bloccati finché:
- `Atlas Perché Prototype` non conclude PASS;
- Foundation/F1/F2 non restano verdi sullo stesso exact head;
- non emergono nuovi thread di review.

## Esito

**CONDITIONAL PASS.**

Il prototipo è tecnicamente e UX-coerente per proseguire alla validazione automatica finale.  
Nessuna autorizzazione al merge o alla prova in classe è concessa finché il gate offline non è PASS sullo stesso exact head.
