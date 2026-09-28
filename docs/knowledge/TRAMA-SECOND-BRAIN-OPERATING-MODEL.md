# TRAMA Second Brain — Operating Model

Stato: IMPLEMENTATION CANDIDATE / READ-ONLY / NO NEW AUTHORITY

## Decisione

Non creare un'altra knowledge base parallela.

La soluzione canonica è completare ciò che TRAMA aveva già definito con CC2-F1/E e ADR-015:

Authority layer -> Control Center observation -> ProjectContextSnapshot -> Context Pack -> persona/agente.

La chat resta un'interfaccia. Non è lo stato tecnico.

## Quattro strati

1. Authority layer — ADR, contratti, STATUS, ROADMAP, repository di dominio.
2. Observation layer — Control Center: gate, evidenze, dipendenze, freshness, maturity.
3. Memory layer — KnowledgeEvent: decisioni, recovery, vincoli, rejection, failure learning, supersession.
4. Context layer — Context Pack piccolo e verificabile per capability o soggetto.

## Protocollo obbligatorio per nuove sessioni

Prima di ricostruire un tema dalla conversazione:

1. identificare il subject/capability;
2. leggere il Context Pack;
3. verificare solo i fatti volatili necessari;
4. risalire alle fonti canoniche per decisioni/evidenze forti;
5. dopo lavoro significativo registrare un KnowledgeEvent se altrimenti la decisione resterebbe solo in chat.

## Runtime introdotto

Questa tranche materializza:

- source manifest fail-closed;
- Project Knowledge Events;
- schema ProjectContextSnapshot;
- schema Context Pack;
- builder deterministico read-only;
- Context Pack generator;
- test di provenance, exact-head recovery e negative knowledge;
- workflow CI.

## Stato live e limite esplicito

Il builder usa control-center/data/ecosystem-snapshot.json come proiezione corrente.

Non inventa PR remote, workflow remoti o exact head non presenti nelle fonti locali. Finché il collector remoto non è version-bound, ProjectContextSnapshot.status resta PARTIAL.

Questa è una garanzia: una memoria incompleta ma verificabile è preferibile a una memoria completa sintetica.

## Caso Atlas Percorsi

Il recupero di TRAMA PR #96 è registrato come KnowledgeEvent source-bound con exact head:

dfb5b106708bee88016907c13ee0d104c093e7ca

Il Context Pack atlas-percorsi deve permettere a una nuova sessione di scoprire immediatamente:

- che PR #96 contiene il pacchetto G1 recuperato;
- quale exact head leggere;
- che l'assunzione fixed-eight dei Percorsi studente è stata invalidata;
- quali fonti governano il lavoro.

## Negative knowledge

Il sistema conserva esplicitamente anche ciò che NON va ripetuto.

Primo esempio canonico:

- non usare chat history o memoria dell'assistente come fonte tecnica di stato.

## Regola di aggiornamento

Una modifica significativa deve aggiornare almeno uno fra:

- fonte autorevole di dominio;
- KnowledgeEvent;
- source binding;
- Control Center snapshot derivato.

Nessuna decisione importante deve rimanere solo nella chat.

## Fase successiva

Il prossimo incremento deve aggiungere un collector remoto read-only e version-bound per repository, PR e workflow dichiarati. Il collector deve aggiornare una RepositoryObservation derivata, non le authority dei domini.

Solo dopo quel collector il ProjectContextSnapshot potrà dichiarare CURRENT invece di PARTIAL.
