# TRAMA Control Center — L0 realistic mockup record

**Data:** 2026-09-29  
**Stato:** DESIGN REFERENCE / NOT IMPLEMENTED / NOT VALIDATED  
**Parent:** `docs/design/trama-control-center-human-readable-information-architecture-v1.md`

## Artefatto

Master image salvata nella Library persistente:

`/TRAMA/Control Center/Mockup/TRAMA-Control-Center-L0-realistic-mockup-2026-09-29.png`

Library file id:

`libfile_dd4bbced876081919a8989d3182daf73`

## Scopo

Mockup realistico desktop + smartphone della futura Sintesi L0 del TRAMA Control Center.

Serve a verificare:
- gerarchia informativa;
- linguaggio human-readable;
- densità della Home;
- progressive disclosure;
- coerenza desktop/mobile;
- continuità con il design visuale già esistente.

## Vincolo importante

Il mockup NON costituisce:
- nuova implementazione;
- approvazione del design finale;
- prova di fattibilità tecnica completa;
- validazione E3;
- autorizzazione a sostituire la Home pubblica.

Deve essere usato come input per la successiva review visuale e il prototipo realistico, preservando il design system e i pattern già materializzati nel Control Center corrente.

## Elementi rappresentati

- Sintesi dello stato dell'ecosistema;
- capacità disponibili;
- attenzione richiesta;
- aggiornamenti recenti;
- funzioni principali;
- ecosistema in sintesi;
- verifiche principali;
- cronologia significativa;
- navigazione progressiva;
- layout mobile coerente con desktop.

## Review necessarie prima dell'implementazione

1. coerenza con design/token/componenti esistenti;
2. accessibilità e contrasto;
3. densità e priorità su smartphone;
4. confronto con Home corrente;
5. mappatura precisa mockup → componenti implementabili;
6. E3-L0 human-use validation su prototipo funzionante.


## Prototipo implementabile

Il mockup è stato tradotto in un prototipo navigabile che riusa i token e i pattern reali del Control Center corrente:

`docs/prototypes/TRAMA-CONTROL-CENTER-L0-REALISTIC.html`

Il prototipo non sostituisce la Home pubblica e serve a validare fattibilità, gerarchia e comportamento responsive prima dell'implementazione runtime.
## Orientation review outcome — 2026-09-29

La successiva verifica percettiva ha mostrato che il prototipo derivato dal mockup è troppo verticale e frammentato per essere considerato target finale.

Finding:
**ORIENTATION / EXCESSIVE VERTICAL DECOMPOSITION — HIGH**

Effetto osservato:
- i singoli blocchi sono comprensibili;
- la posizione dell’utente e la gerarchia complessiva si perdono durante lo scroll;
- la Home viene percepita come report più che come superficie di orientamento.

Il mockup originario resta utile come riferimento di semplicità. Il prossimo artefatto deve essere **L0 v2** con:
- shell persistente;
- un solo stato dominante;
- relazione Arena → Atlas → Docente OS;
- massimo tre destinazioni principali;
- spostamento di verifiche, cronologia e dettagli fuori dalla lunga Home verticale.

Riferimento di ricerca:
`docs/research/trama-control-center-orientation-state-of-art-2026-09-29.md`

