# Contribuire a TRAMA

## Ambito delle modifiche

Ogni proposta deve dichiarare:

- problema affrontato;
- prodotti coinvolti;
- autorità dell'informazione;
- impatto sul controllo umano;
- dati trattati;
- compatibilità con i contratti esistenti;
- verifiche richieste.

## Flusso

1. creare un ramo descrittivo;
2. modificare documenti e registri in modo coerente;
3. eseguire `python3 scripts/validate_governance.py`;
4. eseguire `python3 -m unittest discover -s tests -v`;
5. aprire una richiesta di integrazione;
6. risolvere tutte le conversazioni;
7. registrare l'eventuale verifica umana sull'esatta revisione esaminata.

## Regole redazionali

- usare italiano chiaro e terminologia coerente;
- distinguere fatto, decisione, proposta e capacità futura;
- non dichiarare operativo ciò che è solo documentato o dimostrato;
- non incorporare dati personali o segreti;
- preferire collegamenti alle fonti autorevoli alle copie integrali.


## Skill TypeSafe per gli agenti

Quando una modifica TRAMA riguarda giudizi semantici, classificazione, selezione, ranking, estrazione o verifica basata su TypeSafe:

- consultare la skill ufficiale `typesafe-ai` e la documentazione corrente del fornitore;
- usare un solo metodo di installazione della skill per ambiente;
- trattare la skill come strumento dell'agente di sviluppo, non come dipendenza runtime;
- applicare i confini definiti in `docs/assurance/typesafe-semantic-assurance.md`;
- non introdurre SDK, credenziali o chiamate API nei prodotti senza una decisione TRAMA distinta.

Riferimento upstream: https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
