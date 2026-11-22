# TRAMA-VALUE-01 — Protocollo di osservazione della continuità del lavoro docente

**Stato:** CANDIDATO / NON ESEGUITO / NESSUN DATO DI PROVA ANCORA RACCOLTO  
**Versione:** 2026-11-03 / v0.1  
**Riferimento decisionale:** [TRAMA-VALUE-01 — Gate di valore](../strategy/TRAMA-VALUE-01-teacher-continuity-value-gate-2026-11-03.md).  
**Vincolo:** osservazione manuale degli strumenti esistenti; nessuna scrittura professionale richiesta al solo scopo della prova; nessuna modifica in corsa ai sistemi.

## 1. Scopo, domanda e perimetro

**Domanda:** quanto costa al docente, in passaggi e ripetizioni, mantenere il contesto di un'attività lungo `Prepara → Conduci → Registra → Rivedi → Prossima attività`?

Osservare **un caso effettivo** della scuola secondaria di primo grado (classe, disciplina e UDA scelte esplicitamente dal docente). Il precedente ECO-02 «Tecnologia 2C / Agricoltura come sistema tecnologico» può orientare la scelta, ma non impone di riutilizzare quella classe o considerare dati storici come prova corrente.

Non sono oggetto del protocollo: efficacia didattica misurata sugli alunni, prove standardizzate, produttività generalizzata dei docenti, rendimento della scuola o equivalenza tra informazioni di prodotti non ancora integrati.

## 2. Preparazione minima (a cura del docente)

**Metadati non personali**:

| Campo | Valore da compilare |
|---|---|
| Data di osservazione | |
| Docente pilota (codice pseudonimo, non nome) | |
| Disciplina | |
| Classe (codice di classe, senza elenco studenti) | |
| UDA / obiettivo (titolo o riferimento, senza dati personali) | |
| Modalità osservata | AS IS / futuro candidato comparativo |
| Versione prodotto osservato (se conosciuta) | |
| Interruzioni esterne significative | |

Prima della prova: confermare che superfici, riferimenti e accessi siano autorizzati; annotare ogni limite dell'ambiente. **Non** effettuare logout o cambiare profili per misurare tempi artificiali; **non** forzare integrazioni inesistenti o rigenerazioni di materiali senza bisogno didattico.

## 3. Tre compiti osservabili

| Codice | Compito | Esito atteso, deciso dal docente |
|---|---|---|
| VAL-T1 | **Preparare** una lezione o attività da una UDA, verificando obiettivo e materiale | Preparazione individuata, controllabile e pronta per l'uso |
| VAL-T2 | **Riprendere** l'attività nella classe e documentare soltanto ciò che è stato realmente svolto | Stessa classe/attività riconoscibile; registrazione solo se già ordinariamente prevista e confermata |
| VAL-T3 | **Rivedere** e scegliere il prossimo passo riutilizzando informazioni e materiali precedenti | Decisione docente motivata, senza trasferimenti o decisioni automatiche |

Se il ciclo reale richiede giorni diversi, registrare i compiti su giorni diversi: non simulare una lezione conclusa per completare la scheda. In una prova dimostrativa usare dati fittizi ed esplicitare che non vale come evidenza di uso reale.

## 4. Scheda sintetica per ogni compito

Copiare la seguente sezione per ogni compito/episodio. Il tempo non è obbligatorio quando l'attività viene interrotta.

```text
VAL-01 · Osservazione n.: ___        Data: __________
Compito: VAL-T1 / VAL-T2 / VAL-T3
Contesto autorizzato: _______________________________
Strumenti effettivamente utilizzati: __________________
Versioni / limitazioni conosciute: ___________________

Esito: COMPLETATO / PARZIALE / NON COMPLETATO / BLOCCATO
Tempo attivo, se rilevabile: ____ min
Interruzioni esterne escluse: _________________________
Transizioni fra viste/prodotti: ____
Riselezioni ripetute di classe: ____
Riselezioni ripetute di UDA/obiettivo: ____
Riselezioni ripetute di attività/materiale: ____
Tentativi di recupero della fonte/attività: ____

Punti in cui il lavoro è stato rallentato:
- ___________________________________________________
- ___________________________________________________

Causa prevalente:
CONTEXT_REENTRY / CROSS_PRODUCT_HANDOFF /
MATERIAL_RETRIEVAL / UNCLEAR_ACTION /
UNAVAILABLE_CAPABILITY / OTHER / NOT_DETERMINED

Il docente comprende il contesto e la provenienza? 1 2 3 4 5
Il docente mantiene il controllo della decisione? 1 2 3 4 5
La soluzione è didatticamente adeguata? 1 2 3 4 5

Mutazioni professionali silenziose: NO / SÌ / NON VERIFICABILE
Dati personali non necessari transitati: NO / SÌ / NON VERIFICABILE
Note e circostanze / fattori confondenti:
____________________________________________________
```

**Regola di interpretazione:** `NON VERIFICABILE` non equivale a `NO`; un `BLOCCATO` per indisponibilità tecnica non misura il valore della didattica; registrare le osservazioni, non ricostruirle retrospettivamente come se fossero misure.

## 5. Lettura comparativa e decisione

Il confronto tra AS IS e una futura modalità diversa richiede:
- stesso tipo di compito e complessità simile;
- disponibilità del medesimo contesto autorizzato;
- differenze fra interruzioni, materiali e condizioni dichiarate;
- almeno due osservazioni utili comparabili quando la realtà didattica lo consente;
- giudizio qualitativo del docente;
- separazione tra riduzione dei passaggi e effettivo mantenimento di qualità e controllo.

**Non sono ammessi** percentuali di risparmio senza base misurata, aggregazione di episodi disomogenei e conclusioni sull'apprendimento degli studenti a partire da tempo/numero di clic del docente.

**Decisione successiva, da assumere con Human Review:**

| Esito | Significato | Azione |
|---|---|---|
| `NO_CHANGE` | Nessuna frizione prioritaria dimostrata | Conservare l'attuale percorso |
| `UX_ONLY` | Problema di comprensibilità / passaggi interni | Miglioramento circoscritto alla superficie responsabile |
| `CONTRACT_FIRST` | Il collo di bottiglia è un trasferimento interprodotto | Qualificare il solo contratto e l'handoff richiesto |
| `PROJECTION_EXPERIMENT` | La ripetizione del contesto è sistemica e non si risolve localmente | Prova circoscritta di una vista adattiva deterministica |
| `NEED_MORE_EVIDENCE` | Osservazioni insufficienti, ambigue o non confrontabili | Ripetere osservazione senza espandere il prodotto |

Nessun esito abilita automaticamente codice, deploy o promozioni dei nodi e flussi del grafo.

## 6. Vincoli, revisione e restituzione

- Non riportare nomi, cognomi, identificativi, valutazioni, osservazioni o screenshot di studenti.
- L'eventuale registrazione didattica reale avviene soltanto se ordinariamente necessaria e con conferma esplicita del docente, non per raggiungere un risultato del test.
- Non generare dati di apprendimento né misure di efficacia didattica da semplici interazioni software.
- Lo stato `DESIGNED` del collegamento Docente OS → Registro deve restare tale anche se un operatore copia informazioni manualmente.
- La memoria locale non deve attivarsi senza una scelta esplicita.
- Associare un reviewer diverso dall'implementatore per la lettura conclusiva delle prove e dei rischi.

**Esito iniziale:** `NOT_RUN`. Questo protocollo è uno strumento per raccogliere prove; non certifica da solo un beneficio.

## 7. Riferimenti

- [Strategia di prodotto TRAMA](../vision/product-strategy.md).
- [TRAMA — Filosofia in sviluppo](../vision/philosophy-in-development.md).
- [ECO-02/P1 — Final Human Acceptance](./ECO-02-P1-FINAL-HUMAN-ACCEPTANCE-2026-09-25.md).
- [Ecosystem state map v0.3](../../governance/access/trama-ecosystem-state-v0.3.json).
- [Registro Docente UX-GOV-01](https://github.com/antoniocorsano-boop/registro-docente/blob/main/docs/ux/UX-GOV-01-registro-docente-user-flow-baseline-v1.md).
