# TRAMA Ecosystem State Assessment v0.2

**Data:** 2026-10-10  
**Ambito:** realtà AS-IS dell'ecosistema rispetto al target ACCESS-01  
**Autorità:** evidenza analitica a supporto di `TRAMA ACCESS-01`  
**Fonte machine-readable:** `governance/access/trama-ecosystem-state-v0.2.json`

## Conclusione

L'ecosistema contiene già diversi nodi reali e maturi, ma il tessuto connettivo tra i prodotti non è ancora uniformemente operativo.

> **Un nodo reale non implica un'integrazione reale.**

TRAMA oggi è un ecosistema con prodotti e capacità concrete, alcune catene già dimostrate e diversi user flow cross-product ancora parziali o progettati. ACCESS-01 definisce il percorso per rendere coerente l'esperienza utente senza trasferire l'autorità di un prodotto a un altro.

## Cosa è già reale

- **Docente OS** è l'ambiente operativo teacher-first con identità locale, workspace e autorizzazione propri.
- **Arena** è l'autorità sul curricolo di istituto.
- **Curricolo Atlas** è una superficie pubblica reale per navigazione e consultazione di curricolo, materiali e risorse.
- **Arena → Curricolo Atlas** è una catena governata reale; Arena conserva l'autorità.
- **Studio Atlas** possiede capacità reali di authoring standalone, pur con capacità professionali/runtime ancora incomplete.
- **Atlas learner** supporta percorsi learner/preview delimitati e mantiene il principio di nessun account personale per lo studente per impostazione predefinita.
- **Materiali** esistono in superfici di prodotto reali.
- **Control Center pubblico** è una superficie reale di stato, evidenze e trasparenza.
- **TRAMA governance** è un livello reale di contratti, confini, lifecycle ed evidenze.

## Cosa è parziale

- **TRAMA Gateway** è reale come soglia pubblica. Il flusso professionale non è ancora disponibile; Phase 0 rende sicura l'assenza della destinazione professionale senza oscurare la landing.
- **Studio Atlas** resta parziale come prodotto ecosistemico perché federazione professionale, persistenza remota/pubblicazione e altre capacità non sono tutte complete.
- **Studio Atlas → Atlas learner** è parzialmente reale tramite preview e percorsi governati, ma non va rappresentato come catena di pubblicazione universalmente completa.
- **Docente OS → Curricolo Atlas/Arena** non è ancora uniformemente certificato come runtime cross-product.
- **Material Contract ecosistemico** è incompleto: i materiali esistono, ma identità condivisa, ownership, provenance e riferimenti non sono ancora qualificati tra prodotti.
- **Classi/Gruppi → Atlas learner** richiede un contratto completo e privacy-first per le assegnazioni.

## Cosa è progettato ma non ancora runtime

- **TRAMA Access** come login/launcher professionale canonico.
- **Una identità professionale TRAMA / SSO** tra prodotti.
- **TRAMA Access → Docente OS / Studio Atlas / Arena / Curricolo Atlas professionale**.
- **Control Center privilegiato** con entitlement dedicato e step-up/MFA.
- **Gateway → TRAMA Access** come ingresso professionale canonico.

## Catene canoniche

### Catena del curricolo

`Arena → Curricolo Atlas`

- Arena = autorità sul curricolo di istituto.
- Curricolo Atlas = consultazione, navigazione e intelligibilità.
- La disponibilità di Curricolo Atlas non concede autorità di modifica fuori dai percorsi governati da Arena.

### Catena delle esperienze

`Studio Atlas → Atlas learner`

- Studio Atlas = authoring professionale.
- Atlas learner = fruizione dell'esperienza.
- Il piano learner resta senza account personale per impostazione predefinita e non riceve la sessione professionale.

## Regola di lettura obbligatoria

La state map distingue sempre:

1. **stato del nodo** — esistenza di applicazione, servizio o capacità nel confine dichiarato;
2. **stato del flusso** — dimostrazione end-to-end dell'integrazione/user journey tra nodi.

Esempi:

- Docente OS può essere `REAL` mentre `Docente OS → Studio Atlas` resta `DESIGNED`.
- Curricolo Atlas può essere `REAL` mentre `TRAMA Access → Curricolo Atlas professionale` resta `DESIGNED`.
- Control Center pubblico può essere `REAL` mentre Control Center privilegiato resta `DESIGNED`.

Questa distinzione è obbligatoria nei futuri report di avanzamento.

## Nota sul Gateway

La soglia pubblica non deve essere considerata incompleta solo perché TRAMA Access non esiste ancora.

Confine corretto:

- UI/soglia pubblica: reale;
- destinazione professionale: non ancora reale;
- assenza della destinazione: fail-closed senza distruggere l'esperienza pubblica.

Uno schermo pubblico vuoto non è una forma accettabile di fail-closed.

## Nota sui materiali

`Materiali` non è un nodo binario unico:

- materiali/risorse presenti nei prodotti: `REAL`;
- contratto ecosistemico con identità stabile, ownership, provenance e riferimenti: `PARTIAL` fino alla qualificazione.

## Nota su classi, gruppi e studenti

L'organizzazione teacher-side di classi e gruppi non equivale all'identità dello studente.

Target:

`classe/gruppo docente → riferimento/ticket/codice limitato → Atlas learner`

senza esportare per impostazione predefinita un registro nominale e senza richiedere un account personale allo studente.

## Nota sul Control Center

Le superfici pubblica e privilegiata devono rimanere logicamente distinte.

- Control Center pubblico: stato, evidenze, trasparenza; può restare non autenticato.
- Control Center privilegiato: diventa reale solo con operazioni protette esplicite, entitlement dedicato, step-up/MFA e audit appropriati.

## Regola per l'evidenza visuale

L'infografica AS-IS/TARGET è una vista derivata da questa analisi e dal file machine-readable.

Non è autorità autonoma. Una freccia `REAL` richiede un'evidenza recuperabile che provi esattamente quel confine.

## Conseguenza operativa

Sequenza canonica:

`Baseline/Gateway safety → Identity contract → TRAMA Access → Docente OS pilot → Studio Atlas → Curricolo Atlas → Arena → Assignment/Learner → Materiali → Control Center privilegiato → Cross-app hardening → Gateway cutover → Ecosystem qualification`

Una sola fase implementativa è attiva alla volta. Ogni fase si chiude con implementazione, test, evidenze, Human Review quando necessaria e delta della state map.
