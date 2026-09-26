# R4-P1/P1 — Evidence harness

Questo prototipo è intenzionalmente statico e fixture-driven.

## Vincoli tecnici verificabili

- nessuna dipendenza esterna;
- nessun `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` o form action;
- nessuna API di database/storage applicativo;
- nessun token o secret;
- nessuna scrittura Arena, Atlas o Docente OS;
- stato esclusivamente volatile in memoria della pagina;
- `DOS-A1` non è implementato.

## Reference set

Scenario: `P1-TECH-2C`.

Fixture Atlas: `FIX-ATLAS-001`.

Fixture nuova: `FIX-NEW-001`.

Work item logico: `WORK-P1-001`.

La sequenza dei retry produce `REQ-P1-NNN` mantenendo il medesimo `workItemId` e valorizzando `parentRequestId`. La proposta di pubblicazione usa `PUB-P1-001` e non viene duplicata nei retry della stessa sessione.

## Verifica E1–E12

| Evidenza | Procedura |
| --- | --- |
| E1 | provare Riutilizza, Adatta e Crea nuova; ciascun percorso deve arrivare a PREVIEW |
| E2 | usare “Simula nessun risultato” e “Non adatto”; Crea nuova deve restare disponibile |
| E3 | scegliere Adatta e usare Rigenera; controllare lineage nel riquadro metadati |
| E4 | da PREVIEW usare “Simula errore recuperabile”; bozza e lineage devono restare visibili |
| E5 | provare separatamente Collega e Proponi; gli stati devono essere LINK_SIMULATED e PUBLICATION_PROPOSAL_SIMULATED |
| E6 | verificare il live region `role=status` durante ricerca, errore, annullamento e decisioni |
| E7 | percorrere tutti i controlli da tastiera; verificare focus, label del brief e annunci di stato |
| E8 | verificare a viewport smartphone e desktop l'assenza di overflow orizzontale e la raggiungibilità delle azioni |
| E9 | ispezione statica + pannello rete: nessuna richiesta applicativa deve partire durante i percorsi |
| E10 | ispezione statica: nessun adapter/API di write, storage remoto, token o secret presente |
| E11 | usare Rigenera più volte e Proponi più volte: workItemId e publicationRequestId restano stabili, requestId evolve con parentRequestId |
| E12 | ispezionare fixture/stato: nessun dato personale studente, account, tracking o sincronizzazione |

## Limite della prova

Questa matrice descrive le prove da eseguire sull'exact head. Le verifiche manuali di layout, tastiera e accessibilità non devono essere dichiarate PASS finché non sono state materialmente eseguite sul prototipo reso disponibile per il collaudo.
