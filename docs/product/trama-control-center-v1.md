# TRAMA Control Center v1

**Stato:** ACTIVE / READ_ONLY / PWA / NO_WRITE_AUTHORITY  
**Data:** 22 settembre 2026

## Scopo

Fornire una vista semplificata e dinamica dello stato GitHub dell'ecosistema TRAMA senza richiedere all'utente di navigare direttamente tra repository, pull request, workflow e pagine tecniche.

## Perimetro v1

La prima versione:

- legge soltanto informazioni pubbliche dai repository TRAMA;
- non usa token GitHub nel browser;
- non crea, modifica, approva o integra pull request;
- non modifica issue, branch, workflow o deployment;
- non introduce una nuova autorità;
- non cambia i confini Arena / Atlas / Docente OS;
- mantiene DOS-A1 in stato RUNTIME_DEFERRED.

## Repository osservati

- TRAMA Ecosistema;
- CurManLight Arena;
- Curriculum Atlas;
- Docente OS.

## Esperienza mobile e PWA

La superficie è progettata mobile-first:

- indicatori sintetici in scorrimento orizzontale;
- pipeline in scorrimento orizzontale a schede;
- pull request rese come card su smartphone;
- navigazione inferiore rapida;
- priorità mostrate prima dei dettagli tecnici;
- layout con safe-area per dispositivi mobili.

La PWA include:

- manifest installabile;
- service worker;
- icone applicazione;
- modalità standalone;
- shell offline;
- ultimo snapshot pubblico GitHub conservato localmente sul dispositivo;
- nessuna credenziale o dato personale persistito.

## Viste

### Vista docente

Risponde principalmente a:

- dove siamo;
- cosa devo fare;
- cosa è già verificato;
- quali pull request richiedono attenzione;
- quali gate o workflow sono recenti.

### Vista tecnica

Aggiunge:

- exact head abbreviato;
- stato GitHub della pull request;
- eventi workflow;
- riferimenti diretti alle superfici GitHub.

## Fonte delle priorità

Le priorità vengono lette da `STATUS.md`, sezione **Priorità canonica corrente**. In caso di indisponibilità del documento viene mostrato un fallback locale esplicito.

## Hosting

La superficie è pubblicata tramite **Render Static Site** dal contenuto di `control-center/` sul ramo `main`.

URL pubblico:

`https://trama-control-center.onrender.com`

Il deploy è automatico a ogni commit su `main`.

## Sicurezza

Il workflow GitHub di validazione verifica:

- presenza della pagina, manifest, service worker e icone PWA;
- contratto read-only;
- assenza di token GitHub o header Authorization;
- validità sintattica del JavaScript browser.

## Limiti intenzionali v1

- usa API GitHub pubbliche con relativo rate limit;
- lo snapshot offline contiene esclusivamente dati pubblici GitHub e priorità pubbliche TRAMA;
- non visualizza dati privati;
- non consente azioni GitHub;
- non sostituisce la documentazione canonica;
- non sostituisce la review umana exact-head.

## Criterio di successo

La v1 è utile se consente all'utente di capire in pochi secondi:

1. quali PR sono aperte;
2. quali attività richiedono decisione;
3. quali workflow sono passati o ancora in corso;
4. quale priorità viene dopo;
5. dove aprire GitHub solo quando serve.


## Stato connettività

Il Control Center distingue esplicitamente:

- **offline reale**: `navigator.onLine === false`; viene mostrato l'ultimo snapshot locale;
- **degrado GitHub**: Internet è disponibile ma una o più fonti GitHub non rispondono; vengono mostrati i dati aggiornati disponibili e, solo per le fonti fallite, l'ultimo dato locale;
- **fresh**: tutte le fonti GitHub e lo stato TRAMA sono aggiornati;
- **errore GitHub**: Internet è disponibile ma nessuna fonte remota è utilizzabile.

Il fallimento di una singola fonte non deve più degradare l'intera dashboard a stato offline.
