# Flussi dei dati

## Flussi consentiti

| Flusso | Contenuto minimo | Condizione |
| --- | --- | --- |
| Arena verso Docente OS | curricolo, applicabilità, stato, impronta, provenienza | trasferimento esplicito e verificabile |
| Arena verso Atlas | contenuto pubblicabile e relazioni | stato editoriale compatibile |
| Atlas verso Docente OS | identificativo, versione, stato e accesso alla risorsa | proposta non adottata automaticamente |
| Docente OS verso Atlas | eventuale ricevuta d'uso aggregata | differita e priva di dati personali |

## Dati che non attraversano i confini

- nomi e dati degli studenti;
- annotazioni personali del docente;
- diario completo della classe;
- calendario dettagliato non necessario;
- credenziali e segreti;
- dati di valutazione individuale.

## Errori e indisponibilità

Un trasferimento deve rendere visibili almeno:

- avvio;
- elemento selezionato;
- provenienza;
- avanzamento;
- esito;
- errore comprensibile;
- possibilità di ripetere, sostituire o annullare.



## Flussi proposti non ancora autorizzati

### Docente OS verso Atlas — pubblicazione didattica

Stato: **PROPOSED / NOT_IMPLEMENTED**.

Contenuto minimo proposto:
- LessonPublicationManifest versionato;
- riferimenti a obiettivi, LO e materiali;
- anno scolastico, classe, eventuale sezione e disciplina solo nella misura necessaria alla pubblicazione;
- titolo, sintesi per studenti, visibilità e provenance.

Condizioni:
- anteprima prima della pubblicazione;
- conferma esplicita del docente;
- nessun dato personale studente;
- aggiornamento/ritiro reversibili;
- nessuna autorità curricolare trasferita ad Atlas.

Riferimento:
docs/contracts/docente-os-atlas-publication.md.

### Esiti aggregati verso Atlas

Stato: **DEFERRED / NOT_AUTHORIZED**.

Un futuro OutcomeAggregateSnapshot potrà essere valutato soltanto dopo distinta decisione TRAMA, privacy review e definizione di soglie di aggregazione adeguate. Non sono ammessi esiti individuali, ranking del docente, ranking della classe o score sintetici della scuola.
