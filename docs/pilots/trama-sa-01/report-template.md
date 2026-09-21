# TRAMA-SA-01 — Rapporto del pilota

## Identificazione

- exact head:
- provider:
- modello/versione:
- data esecuzione:
- revisori umani:
- corpusVersion:

## Pre-gate deterministico

- casi totali:
- casi respinti:
- motivi di rigetto:
- casi inviati al giudizio semantico:

## Risultati semantici

- casi revisionati da persona:
- accordo esatto:
- falsi passaggi (`ALIGNED` del provider con giudizio umano diverso):
- casi `INSUFFICIENT_EVIDENCE`:
- errori/indisponibilità:
- stabilità su riformulazioni equivalenti:
- latenza:
- costo:

## Analisi degli errori

Distinguere almeno:
- evidenza mancante;
- domanda mal posta;
- errore del modello;
- errore del codice;
- indisponibilità del servizio.

## Controllo umano

Confermare espressamente:
- nessun output ha prodotto pubblicazione, modifica o adozione;
- nessuna probabilità è stata trattata come autorizzazione;
- ogni caso semantico è stato revisionato da una persona;
- nessun dato personale è stato trasferito.

## Esito proposto

Uno solo tra:
- `STOP`;
- `REVISE`;
- `CANDIDATE`.

L'esito è una proposta e non modifica automaticamente `TRAMA-ADR-009`.
