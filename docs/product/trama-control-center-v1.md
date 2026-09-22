# TRAMA Control Center v1

**Stato:** PROPOSED / READ_ONLY / NO_WRITE_AUTHORITY  
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

La superficie è pubblicata tramite GitHub Pages dal contenuto di `control-center/`.

URL atteso:

`https://antoniocorsano-boop.github.io/trama-ecosistema/`

## Sicurezza

Il workflow di pubblicazione verifica:

- presenza della pagina;
- contratto read-only;
- assenza di token GitHub o header Authorization;
- validità sintattica del JavaScript browser.

## Limiti intenzionali v1

- usa API GitHub pubbliche con relativo rate limit;
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
