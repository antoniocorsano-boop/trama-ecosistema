# QF-03A — Raccordo documentale delle evidenze con Control Center
Data: 17 novembre 2026. Stato: DESIGN_PROPOSED / GOVERNANCE_ONLY. QF-01 e QF-02 non ancora integrate. Questo documento definisce la compatibilità, non implementa QF-03 né cambia snapshot, schemi, autorizzazioni o raccolta. DOS-A1 rimane RUNTIME_DEFERRED.

## 1. Riscontro delle interfacce esistenti
| Fonte (main) | Blob Git letto | Perimetro |
| --- | --- | --- |
| docs/control-center/CC-MSS-01.md | a7351e14b28e41148b62204f45af64138f4f7883 | workstream, gate, evidenza, decisione e transizione distinti |
| schemas/live-component-evidence-overlay.schema.json | a818fdc726b40cb316d1aa9f02feb174c8c6bb69 | sole evidenze componenti positive, PRESENT, run SUCCESS |
| schemas/maturity-evidence-registry.schema.json | bbbfbbb1267142a71376d9a0a9874012c9f898bf | evidenze governate PASS, aree enumerate, no promozione automatica |
| config/maturity-area-definitions.json | 6542e6b6545d716701ae005c63ca02ac5a050f4b | livelli cumulativi di maturità |
| config/repository-enrollment.json | f5c62ffb3aca7ecd87b89b8892ada1ab8dbf4f0f | ammissione esplicita, nessuna rete implicita |
| config/control-center-snapshot-sources.json | 69282913c3d81b7de0e2640e66756ed1148be327 | fonti canoniche snapshot |
| docs/evidence/ecosystem-state-v0.3-admission-receipt-2026-11-03.md | 4d2ec1b807f868322b9042d5785d84eb241be036 | ammissione delimitata Registro Docente come nodo REAL, maturityRef=null |

Le impronte identificano i documenti letti, non nuovi esiti di collaudo.

## 2. Decisione di perimetro proposta
Riutilizzare CC-MSS-01 e i riferimenti ai gate/evidenze esistenti. Non introdurre un nuovo registro, modello di maturity, modello di transizione o aggregatore di risultati positivi. Il registro di maturity ammette solo PASS dei tipi e delle aree previste; l'overlay componenti ammette solo PRESENT verificato con esecuzione SUCCESS. Nessuno dei due può assorbire gli esiti operativi eterogenei di QF come se fossero prove positive. Le informazioni mancanti o negative appartengono alla vista operativa governata, non alle evidenze di maturità. L'osservazione non è promozione. Nessuna estensione dei due schemi in questa fase.

### Lacuna di ammissione
Registro Docente figura nel documento di ammissione v0.3 come nodo REAL con maturityRef=null, ma non è elencato in config/repository-enrollment.json né nelle aree di config/maturity-area-definitions.json e dello schema maturity. Identità nell'ecosistema, ammissione all'osservazione e maturità sono decisioni diverse. Non dedurre ammissione da un link, dal nome del prodotto o dalla sua presenza nella mappa; non mapparlo su docente-os. Per ora il riferimento a STAB-06 è soltanto documentale, nessuna nuova raccolta, promozione o scheda live. La futura ammissione all'osservazione, se necessaria, richiede proposta autonoma, analisi di impatto e decisione esplicita secondo CC-MSS-01; non è un rimedio al blocco di collaudo.

## 3. Semantica di lettura proposta (non schema nuovo)
Ogni riepilogo rinvia ai riferimenti canonici già esistenti: workstream/entity, gate, evidence, source, decision e transition. Repository e SHA identificano il codice; il contesto locale aggiuntivo resta nel contratto sorgente e deve essere verificato prima di qualunque interpretazione. Nessuna riduzione al solo SHA per Atlas, Docente OS o altre identità composte. La versione osservata non sostituisce quella qualificata. Data dell'evento e data dell'osservazione non sono intercambiabili. Non conservare raw log, credenziali, dati personali o ricevute locali in TRAMA.

| Osservazione sorgente | Rappresentazione comprensibile | Limite |
| --- | --- | --- |
| PASS verificato sul candidato e con tutte le identità pertinenti | Verifica superata, riferimento alla fonte | Non equivale ad accettazione o rilascio |
| PASS di un predecessore | Evidenza storica | Non valida il candidato attuale |
| Prova equivalente o parziale | Riscontro parziale | Non sostituisce la prova richiesta |
| NOT_RUN | Prova non eseguita | Non equiparare a FAIL |
| FAIL | Verifica non superata | Non inferire causa non accertata |
| BLOCKED | Impedimento operativo o requisito mancante | Non confondere con difetto applicativo |
| WATCH / REVIEW_REQUIRED | Attenzione / giudizio in sospeso | Non trasformare in PASS |
| NOT_APPLICABLE | Controllo non pertinente secondo fonte | Non equivale a prova superata |
| Fonte assente, incoerente o non fresca | Stato non verificabile / da riesaminare | Non inventare una conclusione corrente |

Queste diciture sono semantica di presentazione, non nuovi enum del registro. Conservare il valore sorgente e distinguere esito, freschezza, perimetro, decisione e autorizzazione. Non sommare PASS eterogenei, non calcolare una percentuale di qualità e non trasformare assenza di osservazione in stato di avanzamento.

## 4. Collocazione futura, subordinata ad approvazione
- Operazioni: workstream, impedimento confermato, prossimo requisito governato e collegamenti. Riutilizzare CC-MSS-01/OperationsPage; nessun pulsante per eseguire, ritentare, riconfigurare o rilasciare.
- Evidenze: fonte, identità completa, provenienza, perimetro, esito e freschezza. Riuso dei riferimenti esistenti, non duplicazione delle ricevute.
- Maturità: solo proiezione dei registri autorizzati secondo le regole vigenti.
- Nessun nuovo percorso applicativo o dashboard autonomo è necessario per il disegno.

## 5. Casi di accettazione proposti per il riesame
Esempi astratti, non risultati di test:
1. PASS sorgente con identità esatta: può essere mostrato nel suo perimetro, nessuna promozione automatica.
2. Stesso SHA ma contenuto Atlas diverso: incompatibilità, non PASS corrente.
3. Stesso SHA ma schema/ambiente Docente OS diverso: perimetro non confermato.
4. PASS storico di Registro: storico; non sostituisce una prova STAB-06.
5. Repository non ammesso: nessuna raccolta automatica né nuova area; riferimento documentale soltanto.
6. BLOCKED o NOT_RUN: nessun inserimento nel registro positivo.
7. Evidenza contraddittoria: non promuovere; revisione necessaria.
8. Autorizzazione assente nonostante verifiche PASS: rilascio non autorizzato.
9. NOT_APPLICABLE vs NOT_RUN: preservare entrambi senza fusione.
10. Fonte non osservabile: mantenere ultimo fatto storico con contesto, stato corrente non verificabile.

## 6. Condizioni di avanzamento
QF-03A conclude solo la proposta documentale. Prima di un'implementazione: approvare QF-01/02/03A mediante governance e revisione indipendente, verificare la compatibilità effettiva del modello con gli schemi e il perimetro dei repository ammessi, poi decidere separatamente eventuale intervento locale read-only. Nessuna esecuzione, modifiche CI, nuova raccolta o autorizzazione implicita. STAB-06 resta congelata; il blocco #307 resta vincolante e non viene risolto da questo disegno. QF-04 non autorizzata.