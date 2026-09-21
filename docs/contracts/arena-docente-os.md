# Contratto Arena verso Docente OS

## Scopo

Trasferire un riferimento curricolare governato nella preparazione professionale senza creare un secondo curricolo.

## Modello professionale guidato

La baseline curricolare è persistente nel dominio Docente OS per una combinazione identificabile di **classe, disciplina, anno scolastico e versione**. Non deve essere nuovamente trasferita manualmente per ogni lezione se non è cambiata in modo significativo.

Il trasporto può essere manuale o assistito, ma deve restare separato dall'autorità:

- il file `.cml-handoff.json` è un involucro di trasporto per interoperabilità, pilota o ripiego;
- un file locale non dimostra da solo l'approvazione istituzionale;
- un trasporto assistito può sostituire il passaggio manuale soltanto mantenendo provenienza e verificabilità;
- nessun trasporto può produrre persistenza silenziosa o adozione implicita;
- il docente mantiene accettazione, modifica, sostituzione, esclusione e rivalidazione.

## Obblighi

- Arena fornisce identità, versione, applicabilità, stato, impronta e provenienza.
- Docente OS verifica integrità e applicabilità prima dell'uso.
- Una modifica significativa richiede rivalidazione anche se il nome della versione non cambia.
- Una transizione verso autorità approvata richiede un segnale Arena verificabile lato sistema; una dichiarazione contenuta in un file locale non è sufficiente.
- Classe, data e collocazione oraria sono aggiunte nel dominio Docente OS.
- L'accettazione finale della preparazione appartiene al docente.
- Trasferimento, validazione, avanzamento, esito ed errore devono essere visibili e comprensibili all'utente.

## Stati di esito

- `READY`: trasferimento valido e contestualizzato;
- `NEEDS_REVIEW`: richiede decisione umana;
- `MISSING`: requisito necessario assente;
- `STALE`: riferimento superato o impronta non coerente;
- `REJECTED`: trasferimento rifiutato.

## Non obiettivi

- scrittura autonoma nel piano o nel diario;
- sostituzione di Arena con Atlas;
- trasferimento di dati personali;
- dipendenza ordinaria da un file manuale per ogni lezione;
- elevazione di una dichiarazione locale a prova di autorità istituzionale;
- attivazione implicita di `DOS-A1`.
