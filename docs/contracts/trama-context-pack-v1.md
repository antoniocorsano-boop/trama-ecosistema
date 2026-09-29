# TRAMA Context Pack v1

**Data:** 24 settembre 2026  
**Stato:** PROPOSED / READ-ONLY DERIVED VIEW  
**Fonte:** ProjectContextSnapshot + fonti governate

## Scopo

Definire il pacchetto di contesto minimo da fornire a una persona o a un agente quando deve operare su una capability, un dominio o una decisione specifica.

Il Context Pack serve a evitare il trasferimento dell'intero corpus TRAMA quando bastano pochi fatti verificati.

## Requisiti

Ogni Context Pack deve:

- dichiarare il soggetto;
- dichiarare il timestamp `asOf`;
- includere solo informazioni pertinenti;
- conservare provenance;
- distinguere fatti, decisioni, evidenze, vincoli e azioni;
- includere blocker e incertezze rilevanti;
- includere eventuale negative knowledge pertinente;
- non autorizzare alcuna write.

## Forma minima

```json
{
  "schemaVersion": "1.0.0",
  "subject": "atlas-publication",
  "asOf": "2026-09-24T00:00:00Z",
  "status": "CURRENT",
  "facts": [],
  "decisions": [],
  "activeInvariants": [],
  "evidence": [],
  "exactHeads": [],
  "blockingGates": [],
  "dependencies": [],
  "knownConflicts": [],
  "knownRejectedApproaches": [],
  "nextCandidateActions": [],
  "sourceRefs": []
}
```

## Regole di selezione

### Pertinenza

Un elemento entra nel pacchetto quando:

- riguarda direttamente il soggetto;
- è una dipendenza necessaria;
- è un vincolo globale applicabile;
- può invalidare l'azione richiesta;
- rappresenta un precedente negativo rilevante.

### Freshness

Un elemento scaduto non può essere presentato come `CURRENT`.

### Supersession

Quando una decisione è stata superata:

- la decisione nuova entra tra le decisioni correnti;
- quella vecchia può comparire come storico pertinente;
- il collegamento di supersession deve essere esplicito.

### Exact head

Gli exact head devono essere inclusi solo quando necessari alla validità dell'evidenza o all'azione richiesta.

## Tipi di consumatore

- Control Center UI;
- agente di sviluppo;
- revisore umano;
- strumento di audit;
- generatore di report.

Il contenuto semantico deve restare equivalente, anche se la resa cambia.

## Risposte attese

Il Context Pack deve consentire, senza ricostruzione manuale estesa, di rispondere a domande come:

- Dove siamo?
- Quale decisione governa questa capacità?
- Qual è l'ultimo exact head verificato?
- Quali gate sono ancora aperti?
- Esistono lavori paralleli in conflitto?
- Quale approccio è già stato scartato?
- Qual è la prossima azione candidata compatibile con il quadro corrente?

## Limiti

Il Context Pack:

- non è un documento canonico autonomo;
- non promuove ADR;
- non chiude gate;
- non interpreta assenza di evidenza come PASS;
- non autorizza runtime;
- non sostituisce la review umana.

## Criterio di qualità

Un buon Context Pack deve essere **sufficientemente piccolo da essere riusabile**, ma **sufficientemente completo da evitare una ricostruzione del contesto**.


## Estensione dual-speed Project Knowledge v2

Quando è disponibile un `EffectiveProjectContext v1`, il Context Pack può includere un oggetto opzionale `effectiveContext`.

L'estensione è retrocompatibile: in assenza di EffectiveProjectContext il Context Pack mantiene esattamente il comportamento v1 precedente.

L'envelope dual-speed espone separatamente:

- `governedAsOf`: timestamp della conoscenza governata;
- `liveObservedAt`: timestamp dell'osservazione live, se disponibile;
- `governedKnowledgeStatus`;
- `liveObservationStatus`;
- `semanticDriftStatus`;
- `effectiveContextStatus`;
- `promotionRequired`;
- `liveFacts`;
- `sourceRefs`.

Regole vincolanti:

- i `liveFacts` non sostituiscono né riscrivono `decisions`, `activeInvariants`, `evidence` o altri contenuti governati;
- gli exact head governati restano distinti dai repository head live;
- un Effective Context `DEGRADED` o `BLOCKED` porta il Context Pack a `PARTIAL`, ma non cancella la conoscenza governata disponibile;
- semantic drift non implica automaticamente promotion;
- il Context Pack non autorizza runtime, publication, merge, review o write;
- nessuna assenza di semantic anchor può essere interpretata come `NONE`.

Questa estensione soddisfa il requisito v2 di esporre nello stesso pacchetto sia il tempo governato sia il tempo live senza trasformare l'osservazione volatile in autorità.
