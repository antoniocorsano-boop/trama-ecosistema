# Strategia di prodotto TRAMA

## Definizione

TRAMA è un ecosistema professionale per la scuola che collega curricolo approvato, conoscenza navigabile e azione didattica, mantenendo il docente al controllo e rendendo verificabile la provenienza di decisioni e materiali.

Il nome è provvisorio fino alle verifiche giuridiche e digitali.

## Problema

Il lavoro scolastico è frammentato tra curricoli difficili da utilizzare, fonti separate dalla progettazione, materiali dispersi, programmazioni scollegate dalle lezioni e trasferimenti manuali opachi.

TRAMA ricompone il percorso senza attribuire autorità decisionale all'automazione.

## Promessa di valore provvisoria

**Dal curricolo alla lezione, con il docente sempre al controllo.**

La formulazione deve essere validata con docenti, dirigenti e referenti prima dell'adozione pubblica definitiva.

## Architettura della marca

| Livello | Nome di lavoro | Funzione |
| --- | --- | --- |
| ecosistema | TRAMA | visione, principi e standard comuni |
| governo | TRAMA Arena | curricolo, fonti, revisioni e approvazioni |
| conoscenza e pubblicazione | TRAMA Atlas | curricolo pubblico, percorsi, relazioni, lezioni pubblicate e materiali |
| operatività | Docente OS parte di TRAMA | pianificazione, lezioni e riflessione |

## Offerta ipotizzata

- **TRAMA Pubblica**: curricolo comprensibile e navigabile, percorsi, Student Learning Hub e materiali pubblicabili;
- **TRAMA Docente**: classi, orario, piani, preparazione e diario;
- **TRAMA Scuola**: dipartimenti, ruoli, approvazioni e distribuzione;
- **TRAMA Servizi**: avvio, migrazione, formazione e assistenza.

La sostenibilità economica non deve dipendere da pubblicità o vendita di dati. Prezzi e formule commerciali richiedono una distinta analisi dei costi e della domanda.

## Mercato iniziale

Il primo ambito di validazione è la scuola secondaria di primo grado, attraverso singoli docenti, piccoli dipartimenti e successivi piloti di istituto.

## Valore distintivo

- autorità curricolare esplicita;
- provenienza verificabile;
- separazione fra proposta e decisione;
- continuità dal curricolo alla preparazione;
- risorse sostituibili o escludibili;
- funzionamento professionale anche senza assistente automatico;
- minimizzazione dei dati tra prodotti.



## Estensione proposta del ruolo Atlas

Stato: **APPROVED_GOVERNANCE / NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME**.

La proposta TRAMA-ATLAS-01 estende Atlas da biblioteca semantica/visuale a superficie pubblica e didattica dell'ecosistema, senza modificare i confini di autorità.

Domini proposti:
- curriculum pubblico per famiglie, studenti e comunità;
- Student Learning Hub con vista per lezioni e per obiettivi;
- biblioteca educativa e Visual Library;
- Smart Views e navigazione semantica;
- presentazione futura di indicatori aggregati di qualità, solo dopo distinta autorizzazione.

La preparazione e la decisione di pubblicare restano in Docente OS.
Arena resta autorevole per curricolo, applicabilità e stato approvativo.
La pubblicazione Docente OS → Atlas usa un `LessonPublicationManifest` distinto dalla `PublicationReceipt` emessa da Atlas, con binding ad Arena, minimizzazione, diritti/licenze, accessibilità e reversibilità.
I quattro flussi Arena → Atlas, Arena → Docente OS, Atlas → Docente OS e Docente OS → Atlas restano separati per autorità e finalità.

Riferimento:
docs/product/atlas-public-curriculum-learning-hub.md.


## Confine di autorità Atlas approvato

Con TRAMA-ADR-007 e TRAMA-ADR-008 approvati, il registro delle fonti dichiara Atlas autorevole per identità, versione e stato delle proprie risorse, pagine e pubblicazioni, incluso l'esito espresso tramite `PublicationReceipt`.

Restano invariati:
- Arena come autorità del curricolo, delle fonti, dell'applicabilità, della versione e dello stato approvativo;
- Docente OS come autorità del contesto professionale e della decisione del docente;
- TRAMA come governo dei contratti e dei confini trasversali.

L'approvazione di governance non abilita il runtime Docente OS → Atlas, che resta `NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME`.
