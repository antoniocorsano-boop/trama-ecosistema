# Stato dell ecosistema TRAMA

Aggiornato al 21 settembre 2026.

| Area | Stato | Evidenza o prossimo controllo |
| --- | --- | --- |
| Curricolo governato | Operativo | Arena rimane la fonte autorevole |
| ECO-01 | Chiuso | forma docente e contratti cross-product validati |
| ECO-02/P1 | Pilota controllato attivo | percorso reale Arena → Docente OS consolidato fino a P9; registrazione lezione verificata in Beta; collaudo umano integrato finale ancora pendente |
| Atlas / R3 | Fondazione da avviare | ADR-007/008 approvate; ADR-010 proposta; R3-F0 è il prossimo slice di prodotto |
| Docente OS | Operativo nel proprio dominio | baseline persistente, preparazione, proposte teacher-editable, registrazione lezione e runtime release contract verificati |
| Officina materiali / R4-P1 | Proposta architetturale | separazione tra regia didattica e produzione specialistica da sottoporre a review umana |
| TRAMA-SA-01 | Pilota assurance attivo | TypeSafe resta advisory-only; gate R3B HOLDOUT da consolidare prima del one-shot |
| DOS-A1 | RUNTIME_DEFERRED | richiede una nuova autorizzazione esplicita; nessuna evidenza corrente lo attiva implicitamente |
| Marca TRAMA | Nome di lavoro | verifiche giuridiche, digitali e di posizionamento ancora pendenti |

## ECO-02/P1 — stato reale consolidato

Il pilota resta **ACTIVE**. Non viene chiuso automaticamente dall'avanzamento tecnico.

Sono già recepiti o verificati:

- autorizzazione del pilota Tecnologia 2C;
- baseline curricolare Arena persistente per classe + disciplina + anno scolastico + versione;
- gate docente esplicito e confini di autorità server-side;
- accesso stabile «Prima della lezione»;
- proposta didattica P9 modificabile, sostituibile o escludibile e separata dall'adozione;
- registrazione di una TeachingSession in Beta con receipt di registrazione ed evidenza TE-1A;
- separazione tra minuti registrati e decisione docente sul completamento del blocco;
- Runtime Release Contract in Docente OS con replay DB selettivo, schema watermark, fail-fast e Runtime Health;
- trasferimento manuale .cml-handoff.json mantenuto soltanto come interoperabilità, pilota o ripiego.

Il fatto che singoli sottoflussi siano stati verificati non equivale ancora al collaudo umano finale del pilota 2C.

## Gate residuo per chiudere ECO-02/P1

Prima della chiusura devono risultare insieme, nello **stesso caso reale integrato**:

1. lezione pilota 2C identificata con data e collocazione coerente nel dominio Docente OS;
2. decisione docente registrata sulla risorsa Atlas proposta: riutilizzo, adattamento, sostituzione o esclusione;
3. verifica mobile P9 della singola superficie di proposta, modifica esplicita e nuova conferma dopo una modifica;
4. percorso completo preparazione → decisione materiali → uso → registrazione lezione senza interventi tecnici correttivi durante il test;
5. rapporto umano finale su comprensibilità, tempo, controllo, qualità didattica e criticità residue.

La chiusura del pilota non autorizza DOS-A1.

## Atlas — prossimo cantiere principale

La governance di base è già consolidata:

- Arena resta l'autorità curricolare;
- Atlas è autorevole per identità/versione/stato delle proprie risorse, pagine e pubblicazioni;
- Docente OS resta l'autorità del contesto professionale e della decisione docente;
- LessonPublicationManifest e PublicationReceipt restano distinti;
- il runtime Docente OS → Atlas resta NOT_IMPLEMENTED / NOT_AUTHORIZED_FOR_RUNTIME.

La proposta **TRAMA-ADR-010 — Atlas integrale e Officina materiali** è mantenuta nella PR TRAMA #26 finché non viene integrata. **R3-F0 — Product & Design Foundation** può essere attivato soltanto dopo che ADR-010 è presente nel registro canonico e approvata mediante review umana exact-head.

## TypeSafe — assurance separata dal prodotto

TRAMA-SA-01 resta un pilota di assurance **advisory-only**. Non crea autorità e non autorizza scritture.

Il gate R3B HOLDOUT non è ancora eseguibile come one-shot finché non sono risolti i rilievi su:

- pin dell'input/harness autorizzato;
- blocco durevole dei rerun dopo il consumo del holdout;
- conservazione dell'artefatto anche in caso di errori provider.

TypeSafe non blocca l'avvio di R3-F0 Atlas.

## Semaforo di ecosistema

- **Verde**: governo delle autorità, baseline Arena, controllo docente, contratti di pubblicazione, hardening runtime Docente OS.
- **Giallo**: chiusura ECO-02/P1, Atlas Product Foundation, Officina materiali, TypeSafe HOLDOUT, marca e adozione.
- **Rosso / non autorizzato**: adozione o pubblicazione autonoma, DOS-A1, esiti individuali verso Atlas, autenticazione studenti non governata.

## Vincoli attivi

1. Arena resta la fonte curricolare di Docente OS anche quando Atlas pubblica una proiezione del medesimo curricolo.
2. Le risorse Atlas sono proposte modificabili, sostituibili o escludibili.
3. Classe, calendario, preparazione, diario e decisioni professionali restano nel dominio Docente OS.
4. Una baseline curricolare è persistente per classe, disciplina, anno e versione; non deve essere trasferita manualmente a ogni lezione.
5. Trasporto, persistenza e pubblicazione non equivalgono ad approvazione istituzionale.
6. Nessun dato personale studente è richiesto dal repository TRAMA.
7. Drive non è una memoria tecnica concorrente.
8. Ogni capacità runtime nuova richiede il proprio gate, evidenza e review exact-head.
