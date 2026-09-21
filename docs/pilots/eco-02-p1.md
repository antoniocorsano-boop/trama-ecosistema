# ECO-02 P1 Pilota docente

## Perimetro

- disciplina: Tecnologia;
- classe: 2C;
- sequenza: Agricoltura come sistema tecnologico;
- curricolo: proveniente da Arena;
- preparazione: organizzata in Docente OS;
- risorsa: proposta da Atlas, sostituibile o escludibile;
- dati personali: esclusi;
- automazione autonoma: esclusa.

## Stato verificato al 21 settembre 2026

Il pilota non è più una sola dimostrazione documentale. Il percorso reale Arena → Docente OS è stato progressivamente materializzato e corretto.

### Arena

- PR #314 — autorizzazione del pilota teacher-first;
- PR #315 — pacchetto provvisorio Tecnologia 2C;
- PR #317 — obbligo di segnale Arena verificabile per qualunque transizione di autorità approvata;
- PR #318 — contratto `CML-DOS-PROFESSIONAL-GUIDED-WORKFLOW-V1`.

### Docente OS

- PR #554 — predisposizione del pilota;
- PR #557 — gate reale «Approva e procedi»;
- PR #558 — approvazione della preparazione su baseline provvisoria completa;
- PR #559 — intake teacher-first del curricolo Arena;
- PR #561 — rafforzamento di identità del pilota, autorità, persistenza e quarantena;
- PR #562 — correzione del runtime della Server Action;
- PR #563 — allineamento della sezione canonica e riscontro visibile di avanzamento/esito;
- PR #564 — contratto professionale guidato speculare ad Arena.

## Decisione operativa consolidata

La baseline curricolare è trattata come riferimento persistente per **classe + disciplina + anno scolastico + versione**.

Il file manuale `.cml-handoff.json`:

- è ammesso nel pilota, per interoperabilità e come ripiego;
- non costituisce prova autonoma di autorità istituzionale;
- non deve essere richiesto per ogni lezione nel modello professionale ordinario.

Un trasporto assistito o automatico è ammesso soltanto se conserva provenienza, integrità, controllo umano e possibilità di rivalidazione. Non può produrre persistenza silenziosa né approvazione implicita.

## Evidenza della prova di preparazione

La precedente prova docente registrata in Docente OS #555 conserva valore come evidenza parziale:

- durata adattata da 120 a **60 minuti**;
- percorso curricolo → obiettivo → attività → materiali → verifica valutato **5/5** per chiarezza;
- controllo pedagogico valutato **5/5**;
- risparmio percepito **oltre 15 minuti**;
- risorsa Atlas mantenuta come proposta e non accettata automaticamente.

Questa evidenza misura la qualità della preparazione, non la riuscita tecnica del flusso Beta completo.

## Evidenza umana già disponibile

Nella prova Beta reale è stato osservato il trasferimento del file Arena e la sua disponibilità locale. È stata inoltre rilevata l'assenza di un riscontro utente sufficiente durante trasferimento e accettazione.

La PR Docente OS #563 è stata integrata specificamente per rendere visibili avanzamento, errore ed esito e per correggere il confronto fra `gradeRef=grade-2` e `sectionRef=C`.

Questa evidenza è utile ma non sostituisce il **nuovo collaudo umano sulla versione corretta**.

## Condizioni residue di prontezza

Prima dell'esecuzione controllata e della chiusura del pilota devono risultare insieme:

- classe esatta: **soddisfatta — Tecnologia 2C**;
- riferimento curricolare valido e impronta verificabile: **soddisfatto per la baseline provvisoria di pianificazione**;
- gate docente reale: **integrato**;
- confini di autorità e persistenza server-side: **integrati**;
- feedback visibile sul trasferimento: **correzione integrata, nuova prova umana pendente**;
- data reale: **pendente**;
- collocazione nell'orario: **pendente**;
- stato canonico dei materiali: **da confermare sul caso reale**;
- decisione sulla risorsa Atlas: **da registrare sul caso reale**;
- revisione umana del flusso pubblicato completo: **pendente**.

## Indicatori

| Area | Criterio minimo |
| --- | --- |
| comprensibilità | origine, obiettivo, materiali e decisione sono riconoscibili |
| efficienza | diminuiscono passaggi manuali e tempo di preparazione |
| controllo | ogni proposta può essere modificata, sostituita o esclusa |
| affidabilità | classe, data, orario, curricolo e materiali sono coerenti |
| usabilità | avanzamento, risultato ed errore sono visibili |
| privacy | nessun dato personale non necessario attraversa i prodotti |
| valore didattico | la preparazione è pertinente e utilizzabile in classe |

## Esito

L'esito deve essere registrato mediante un rapporto umano distinto dagli eventi tecnici.

La chiusura di ECO-02/P1:

- non attiva automaticamente `DOS-A1`;
- non trasforma una baseline provvisoria in approvazione istituzionale;
- non autorizza scritture autonome nel piano o nel diario;
- non rende obbligatorio il trasferimento manuale per le lezioni successive.


## Miglioramento successivo al collaudo P8 — P9

Il collaudo mobile successivo al consolidamento P8 ha evidenziato tre problemi di controllo docente nella superficie **Prima della lezione**:

- doppione percettivo tra strumento disponibile e stessa domanda già presente nella sequenza;
- domanda guida locale troppo generica;
- impossibilità di modificare direttamente la proposta o un'aggiunta già accettata.

Decisione di progetto:

- una proposta deve comparire in **una sola superficie del lifecycle**;
- la proposta resta modificabile prima dell'uso;
- solo una conferma esplicita la rende effettiva nella lezione;
- se il docente modifica un elemento già accettato, la precedente accettazione non può sopravvivere silenziosamente: l'elemento torna da riesaminare e richiede una nuova conferma;
- provenienza e proiezione canonica restano immutate.

Implementazione candidata: Docente OS PR #571 — `ECO-02/P9 — editable teacher proposals without duplicate states`.

Stato TRAMA: **CANDIDATE / HUMAN REVIEW REQUIRED**. Non è registrata come implementata finché la PR prodotto non supera i gate e non viene integrata.
