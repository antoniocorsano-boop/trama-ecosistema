# Contratto Atlas verso Docente OS

## Scopo

Proporre oggetti di apprendimento e materiali alla preparazione della lezione.

## Obblighi

- la risorsa conserva identità, versione, provenienza e stato;
- la proposta confluisce negli spazi materiali già previsti da Docente OS;
- il docente può accettare, modificare, sostituire o escludere;
- un materiale mancante o non valido non rende pronta la lezione;
- Atlas non riceve il contesto completo della classe;
- eventuali riferimenti curricolari associati alla risorsa restano riferimenti ad Arena e non diventano una copia autorevole in Atlas o Docente OS.

## Stati canonici dei materiali

- `READY`;
- `MISSING`;
- `PROPOSED`;
- `NEEDS_REVIEW`.

Sono vietati sinonimi locali non dichiarati dal contratto.



## Flusso inverso distinto

Questa specifica governa soltanto **Atlas → Docente OS** per la proposta di risorse.

La futura pubblicazione didattica **Docente OS → Atlas** è un flusso distinto, proposto in:
`docs/contracts/docente-os-atlas-publication.md`.

I due flussi non devono essere fusi:
- proposta di una risorsa non equivale a pubblicazione;
- uso in lezione non equivale a pubblicazione;
- pubblicazione non equivale ad approvazione curricolare o istituzionale;
- la `PublicationReceipt` di Atlas riguarda l'esito della pubblicazione Docente OS → Atlas e non modifica questo contratto.

Nel quadro complessivo restano separati anche Arena → Atlas e Arena → Docente OS; nessuna risorsa Atlas può sostituire la baseline curricolare Arena.
