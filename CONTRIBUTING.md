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

