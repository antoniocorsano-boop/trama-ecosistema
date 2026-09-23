# ATLAS-PERCHÉ-04 — Protocollo di prova reale in classe

**Data:** 23 settembre 2026  
**Stato:** PROPOSED / HUMAN PILOT PROTOCOL / NO_RUNTIME_AUTHORIZATION  
**Parent:** ATLAS-PERCHÉ-01/02/03  
**Scopo:** definire come provare le attività senza confondere collaudo didattico con valutazione di efficacia.

## 1. Oggetto della prova

La prova serve a verificare se l'attività:
- viene compresa dagli studenti;
- induce davvero le mosse cognitive previste;
- sostiene, invece di interrompere, il dialogo e l'investigazione;
- è adeguata all'età;
- mantiene il carico cognitivo entro limiti gestibili;
- funziona su LIM e/o dispositivo;
- resta utilizzabile senza rete quando previsto;
- non richiede dati personali;
- offre alternative accessibili.

Non serve a dimostrare che il programma migliori causalmente gli apprendimenti.

## 2. Ordine dei pilot

### Primo ciclo di prova
1. **P1 — Infanzia 5 anni**: “Dove è andata l'acqua?”
2. **P3 — Primaria 5ª**: “Quale spiegazione regge meglio?”

Queste due prove coprono i due estremi iniziali più utili:
- mediazione quasi completa del docente;
- prima autonomia studente con stato locale/offline.

### Secondo ciclo
3. P2 — Primaria 2ª;
4. P4 — Secondaria 1ª;
5. P5 — Secondaria 3ª.

## 3. Preparazione docente

Prima della lezione il docente deve poter vedere:
- scopo cognitivo;
- collegamento curricolare;
- materiali;
- durata prevista;
- fasi;
- momento fuori schermo;
- domande di facilitazione;
- errori/idee plausibili attese;
- indicatori osservabili;
- eventuali adattamenti di accessibilità.

Il docente può modificare il ritmo e saltare una fase, ma il sistema deve segnalare quale mossa cognitiva viene eventualmente omessa.

## 4. Osservazione minima

La scheda di osservazione non registra nomi studenti.

Per ogni attività il docente/osservatore annota:

| Dimensione | Domanda | Scala |
| --- | --- | --- |
| Comprensione | Gli studenti capiscono che cosa viene chiesto? | sì / parzialmente / no |
| Domanda | Emergono domande pertinenti? | spontanee / con aiuto / no |
| Evidenza | Gli studenti usano indizi/prove? | autonomamente / con aiuto / no |
| Revisione | Cambiano spiegazione quando serve? | sì / con resistenza / no |
| Metacognizione | Sanno dire che cosa ha cambiato il loro pensiero? | sì / parzialmente / no |
| Tecnologia | Lo schermo sostiene l'attività? | sostiene / neutro / ostacola |
| Carico | La sequenza è gestibile? | adeguato / alto / eccessivo |
| Accessibilità | Tutti possono partecipare con modalità equivalente? | sì / da adattare / no |
| Offline | Il pacchetto resta fruibile senza rete? | sì / parzialmente / no |

## 5. Evidenze qualitative

Sono utili:
- formulazioni anonime di domande emerse;
- punti in cui la classe si blocca;
- passaggi saltati dal docente;
- momenti in cui una evidenza induce revisione;
- richieste di chiarimento ricorrenti;
- tempo effettivo delle fasi;
- osservazioni sull'uso della LIM/dispositivo.

Non raccogliere:
- nomi;
- profili individuali;
- valutazioni personali persistenti;
- audio/video degli studenti salvo distinta procedura istituzionale;
- dati comportamentali individualizzati.

## 6. Esito del singolo pilot

### KEEP
La struttura produce il comportamento cognitivo atteso senza problemi rilevanti.

### REVISE
Il nucleo è valido, ma richiede modifica di:
- prompt;
- sequenza;
- durata;
- supporto docente;
- grafica;
- accessibilità;
- offline.

### REJECT
La struttura non produce il comportamento atteso o introduce un problema non risolvibile con semplice revisione.

L'esito riguarda **l'attività**, mai lo studente.

## 7. Gate tecnico Atlas prima della prova P3

Per il pilot Primaria 5ª il prototipo deve superare:
- typecheck;
- lint;
- build;
- browser test desktop;
- browser test smartphone;
- salvataggio locale;
- service worker/cache esplicita;
- riapertura offline;
- focus/tastiera sui controlli principali;
- nessuna richiesta di login;
- nessuna chiamata di tracking introdotta dal prototipo.

## 8. Gate umano prima della prova

Un docente deve confermare:
- consegna comprensibile;
- contenuto disciplinare corretto;
- assenza di risposta suggerita involontariamente;
- materiali sicuri e adeguati;
- durata realistica;
- linguaggio appropriato;
- possibilità di partecipazione per tutti gli alunni della classe.

## 9. Criterio di successo del primo ciclo

Il primo ciclo può essere considerato superato se:

### P1 Infanzia
- la maggioranza delle interazioni resta nel mondo reale;
- i bambini producono osservazioni e almeno alcune spiegazioni motivate;
- la LIM non diventa centro dell'attività;
- il docente riesce a usare la sequenza senza irrigidire la conversazione.

### P3 Primaria 5ª
- gli studenti distinguono ipotesi ed evidenza;
- almeno parte degli studenti rivede esplicitamente la propria spiegazione in base agli indizi;
- la nota locale è comprensibile;
- il salvataggio offline funziona;
- nessun dato personale viene richiesto o trasmesso.

## 10. Dopo la prova

Per ogni pilot produrre una breve receipt di collaudo:

```text
PilotReceipt
- pilotId
- activityVersion
- date
- gradeBand
- mode
- result: KEEP | REVISE | REJECT
- usabilityFindings[]
- cognitiveFindings[]
- accessibilityFindings[]
- offlineFindings[]
- requiredChanges[]
- reviewerRole
```

La receipt non contiene nomi o identificativi degli studenti.

## 11. Cosa non fare dopo una singola prova

Non:
- dichiarare “efficace” il metodo;
- generalizzare all'intero primo ciclo;
- integrare automaticamente tutti i pilot;
- trasformare gli indicatori in punteggio studente;
- abilitare telemetria per misurare il pensiero;
- promuovere ActivityPackage v1 a contratto definitivo.

## 12. Passo successivo alla prima prova

Dopo P1 e P3:
1. confrontare le due receipt;
2. correggere matrice/prompt/schema;
3. eseguire nuova review;
4. solo allora estendere a P2/P4/P5;
5. decidere se ActivityPackage v1 è sufficientemente generale per entrare nel roadmap F3.
