# TRAMA — Protocollo operativo per questioni UI specifiche

**Stato:** CANONICO  
**Data:** 2026-10-10  
**Ambito:** interventi UI/visual identity specifici nell’ecosistema TRAMA

## 1. Principio

Per ogni questione UI specifica che modifica identità visiva, art direction, composizione, media, gerarchia percettiva o fedeltà a una baseline approvata, TRAMA usa una sequenza professionale a gate. Non si corregge la resa finale con patch cosmetiche finché il problema appartiene a un livello precedente.

## 2. Livelli da mantenere separati

1. **Baseline visiva approvata** — contratto di design, non asset di produzione.
2. **Asset di produzione** — immagini/media UI-free, art-directed per i breakpoint previsti.
3. **UI implementata** — HTML/CSS/React, testo accessibile, controlli, responsive e motion.
4. **Human Visual Review** — confronto tra baseline approvata e implementazione exact-head.

Questi livelli non devono essere confusi né fusi nello stesso artefatto.

## 3. Regola di diagnosi

Quando una schermata non raggiunge la baseline, il difetto viene classificato prima di intervenire:

- **art direction / asset**;
- **composizione / crop responsive**;
- **UI / gerarchia / spacing**;
- **accessibilità / resilienza**;
- **implementazione tecnica**.

La correzione avviene nel livello che origina il difetto. Overlay, gradienti, blur, shadow o altri correttivi CSS non devono mascherare un asset o una composizione sbagliati.

## 4. Flusso canonico per rework visuali

1. congelare la baseline approvata;
2. redigere un brief di art direction con criteri verificabili;
3. produrre prima un **master visual UI-free** per validare la direzione;
4. effettuare review del master prima di derivare varianti responsive;
5. produrre asset S/M/L con art direction dedicata, non semplice scaling/crop meccanico;
6. effettuare review degli asset senza UI;
7. integrare gli asset nella UI reale;
8. eseguire test automatici, responsive, accessibilità e failure modes;
9. generare evidenza S/M/L/LIM sull’exact head;
10. effettuare Human Visual Review finale: **PASS / REWORK / REJECT**;
11. nessun merge o propagazione dell’identità prima del PASS.

## 5. Criteri di review visuale

Ogni review verifica almeno:

- fedeltà semantica alla baseline;
- qualità compositiva;
- gerarchia percettiva;
- riconoscibilità identitaria;
- leggibilità ottenuta principalmente tramite art direction, non oscuramento correttivo;
- comportamento S/M/L/LIM;
- presenza e corretto peso degli elementi identitari approvati;
- assenza di deriva verso UI generica, SaaS o tecnicista.

## 6. Regola anti-tentativi

Non si procede con cicli ripetuti `implementazione → patch visiva → nuova patch` quando la causa è nel media o nell’art direction.

In presenza di un difetto visivo strutturale si torna al gate precedente, si corregge lì e si riparte con nuova evidenza.

## 7. Applicazione corrente — TRAMA Gateway

Per TRAMA Gateway v1 il rework corrente è classificato **ART DIRECTION / ASSET** perché:

- la zona centrale è stata resa leggibile con oscuramento percepibile anziché tramite composizione naturale;
- le curve/connessioni ramate della baseline sono assenti o insufficienti;
- la resa exact-head è tecnicamente certificata ma visivamente inferiore al mockup approvato.

Di conseguenza il prossimo gate è un **master visual UI-free** coerente con la baseline approvata. Solo dopo il suo PASS vengono derivate le varianti S/M/L e reintegrata la UI.
