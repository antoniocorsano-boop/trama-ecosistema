# TRAMA Ecosistema

TRAMA è il livello di governo comune di **CurManLight Arena**, **Curriculum Atlas** e **Docente OS**.

> Arena governa il curricolo, Atlas rende navigabile la conoscenza, Docente OS sostiene il lavoro professionale.

Questo repository non contiene una quarta applicazione e non replica le basi di conoscenza dei tre prodotti. Custodisce decisioni, confini di autorità, contratti, stato del programma e criteri di verifica comuni.

## Stato

- nome `TRAMA`: nome di lavoro, non ancora marchio definitivo;
- `ECO-01`: chiusa;
- `ECO-02/P1`: pilota controllato attivo;
- `DOS-A1`: `RUNTIME_DEFERRED`;
- integrazione automatica: non autorizzata;
- TRAMA-PW-01: integrato; canary Docente OS post-merge PASS su Product CI, P6 Performance Runtime e HVA Runtime.

Lo stato sintetico è in [STATUS.md](STATUS.md). Le decisioni vincolanti sono registrate in [docs/decisions/decision-register.json](docs/decisions/decision-register.json).

## Responsabilità

| Dominio | Fonte autorevole |
| --- | --- |
| Decisioni e contratti dell'ecosistema | questo repository |
| Curricolo, applicabilità e approvazione | Arena |
| Relazioni, percorsi e oggetti di apprendimento | Atlas |
| Classi, pianificazione e decisioni professionali | Docente OS |
| Documenti collaborativi e istituzionali | Drive, come copia o fonte dichiarata |

## Percorso di lettura

1. [Visione del prodotto](docs/vision/product-strategy.md)
2. [Filosofia in sviluppo e frasi-cardine](docs/vision/philosophy-in-development.md)
3. [Architettura dell'ecosistema](docs/architecture/ecosystem-overview.md)
4. [Confini di autorità](docs/architecture/authority-boundaries.md)
5. [Flussi dei dati](docs/architecture/data-flows.md)
6. [Governo](GOVERNANCE.md)
7. [Roadmap](ROADMAP.md)
8. [Piano operativo atomico](docs/strategy/atomic-operating-plan-2026-09-22.md)
9. [Riferimento scientifico IA generativa e competenza professionale docente](docs/research/trama-rsr-01-genai-language-teaching.md)

## Verifica locale

```bash
python3 scripts/validate_governance.py
python3 -m unittest discover -s tests -v
```

Le verifiche controllano registri, riferimenti, stati ammessi, schemi e assenza di duplicazioni dichiarate.

