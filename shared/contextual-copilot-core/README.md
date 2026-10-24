# TRAMA Contextual Copilot Core

Nucleo headless, provider-neutral e privacy-first per la risoluzione delle azioni contestuali condivise fra prodotti TRAMA.

## Confini

- nessuna UI e nessuna route applicativa;
- nessun tipo verticale di Docente OS o registro-docente;
- nessun provider generativo obbligatorio;
- capability dichiarate dall'app prima di semantica o preferenze;
- policy valutata prima della risoluzione e prima del dispatch;
- azioni mutative subordinate a conferma/autorità umana;
- nessuna autorità di dominio o persistenza acquisita dal Core.

Il pacchetto implementa il contratto del Contextual Copilot Core come libreria subordinata ai contratti TRAMA OR-07 Shared Capability Layer e OR-08 Runtime Portability. Non è un server centrale né un nuovo prodotto.

## Verifica

```bash
npm test
npm pack --dry-run
```

La prova cross-app usa fixture Docente OS e registro-docente con lo stesso motore e fallisce se il sorgente del Core introduce identificatori o branching applicativi.
