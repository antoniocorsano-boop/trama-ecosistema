# TRAMA OR-07 — Shared Capability Layer Contract v0

**Stato:** PROPOSED / CONTRACT-ONLY  
**Data:** 2026-09-30  
**Perimetro:** TRAMA · Arena · Atlas · Docente OS · Control Center · capability infrastructure  
**Authority change:** NONE  
**DOS-A1:** RUNTIME_DEFERRED

## 1. Scopo

OR-07 definisce il livello minimo di capability condivise riusabili tra i prodotti TRAMA senza trasformare l'ecosistema in un monolite e senza creare una nuova autorità centrale.

Una shared capability è una funzione tecnica o cognitiva invocabile da più prodotti attraverso un contratto stabile. Il prodotto chiamante mantiene:
- il significato di dominio;
- la decisione utente;
- l'autorità sui propri dati e workflow;
- la responsabilità della presentazione finale.

Il provider della capability resta sostituibile.

## 2. Principio architetturale

```text
Arena / Atlas / Docente OS
        |
        | domain intent
        v
Shared Capability Contract
        |
        | provider-neutral request
        v
Adapter / provider
        |
        | result + evidence
        v
Calling product
```

Il Shared Capability Layer:
- NON è un nuovo prodotto;
- NON è un database di dominio;
- NON è una write authority;
- NON è un orchestratore centrale;
- NON sostituisce Arena, Atlas o Docente OS;
- NON autorizza DOS-A1.

## 3. Capability identity

Ogni capability DEVE avere una chiave stabile e semanticamente orientata al risultato, non al provider.

Formato v0:

```text
<domain>.<capability>.<mode>
```

Esempi:
- `lesson.preparation.observe`
- `curriculum.context.read`
- `resource.discovery.read`
- `evidence.bundle.read`

Sono vietate come identity canonica chiavi provider-specifiche come:
- `dsh.run`
- `codex.execute`
- `openai.generate`

Il provider è metadata di esecuzione, non semantica della capability.

## 4. Capability descriptor

Ogni capability DEVE essere descrivibile almeno con:

```ts
interface SharedCapabilityDescriptor {
  capabilityId: string
  version: string
  mode: 'READ_ONLY' | 'PROPOSE_ONLY' | 'MUTATIVE'
  ownerDomain: 'TRAMA' | 'ARENA' | 'ATLAS' | 'DOCENTE_OS'
  supportedInputs: readonly string[]
  outputSchemaRef: string
  evidenceRequired: boolean
  providerPortable: boolean
  authorityClass: 'NONE' | 'DOMAIN_BOUND' | 'HUMAN_REQUIRED'
}
```

Per OR-07 v0 sono ammesse soltanto capability `READ_ONLY` o `PROPOSE_ONLY`.

## 5. Request envelope

```ts
interface SharedCapabilityRequest<TInput = unknown> {
  requestId: string
  capabilityId: string
  capabilityVersion: string
  caller: {
    product: 'ARENA' | 'ATLAS' | 'DOCENTE_OS' | 'CONTROL_CENTER'
    surface: string
  }
  authorityContext: {
    sourceRefs: readonly string[]
    decisionOwner: 'ARENA' | 'ATLAS' | 'DOCENTE_OS' | 'HUMAN'
  }
  input: TInput
  requestedAt: string
}
```

Regole:
- `requestId` è unico e tracciabile;
- il caller è esplicito;
- l'authority context è dichiarato e non inferito dal provider;
- la request non trasferisce authority alla capability;
- il Control Center può osservare ma non diventare decision owner.

## 6. Result envelope

```ts
interface SharedCapabilityResult<TOutput = unknown> {
  requestId: string
  capabilityId: string
  capabilityVersion: string
  status: 'SUCCEEDED' | 'FAILED' | 'UNAVAILABLE' | 'UNAUTHORIZED' | 'STALE'
  output?: TOutput
  provenance: {
    providerType: string
    providerId: string
    adapterId: string
    adapterVersion: string
  }
  evidenceRefs: readonly string[]
  producedAt: string
  stale: boolean
  decisionState: 'OBSERVATION' | 'PROPOSAL'
}
```

Il result:
- non promuove automaticamente decisioni;
- non modifica la fonte autorevole;
- deve essere distinguibile da dati di dominio canonici;
- deve mantenere provenance e evidence refs.

## 7. Authority boundary

### Arena
Arena resta autorità curricolare. Una capability può leggere o trasformare contesto curricolare in forma derivata, ma non sostituire o modificare l'autorità Arena.

### Atlas
Atlas resta superficie pubblica, di navigazione e learning-object. Una capability può supportare discovery o arricchimento, ma non trasformare Atlas in authority curricolare.

### Docente OS
Docente OS resta teacher-first. Una capability può produrre proposte, osservazioni o materiali preparatori; accettazione, modifica, esclusione o sostituzione restano del docente.

### Control Center
Il Control Center resta READ_ONLY. Può mostrare stato, provenance, freshness ed evidenze della capability; non può avviare mutazioni o approvare risultati.

## 8. Provider portability

Ogni capability condivisa qualificabile DEVE poter essere implementata da provider sostituibili.

Il contratto deve separare:
- capability semantics;
- transport;
- adapter;
- provider;
- runtime generation;
- model/runtime identity.

Una capability non è qualificata come shared se il prodotto chiamante deve conoscere API proprietarie del provider.

## 9. Stato capability

Per ogni provider binding si distinguono:

```text
supported
available
authorized
qualified
```

Questi stati NON sono equivalenti.

Esempio:
- supported=true
- available=true
- authorized=false
- qualified=false

non abilita esecuzione mutativa.

## 10. Failure isolation

Un errore di capability:
- non modifica dati di dominio;
- non invalida automaticamente l'ultimo dato governato valido;
- non promuove fallback non dichiarati;
- produce un risultato esplicito FAILED/UNAVAILABLE/STALE;
- deve preservare requestId, capabilityId e provenance disponibile.

## 11. Freshness e stale semantics

Ogni risultato osservabile deve dichiarare:
- `producedAt`;
- `stale`;
- policy di freshness quando applicabile.

Un risultato stale può essere mostrato come ultimo risultato noto, ma non come dato corrente.

## 12. Evidence contract

Per capability che contribuiscono a un workflow governato, `evidenceRefs` è obbligatorio.

Le evidenze devono consentire almeno:
- identificazione del contratto;
- identificazione del provider/adapter;
- collegamento alla request;
- riproducibilità deterministica quando prevista dal tipo di capability.

## 13. Privacy e minimizzazione

Il layer non introduce un data lake condiviso.

Regole:
- trasmettere solo il minimo input necessario;
- nessun dato personale studente nel contratto OR-07 di base;
- nessun segreto in envelope persistiti o osservabili;
- dati di dominio restano nei prodotti proprietari salvo contratto specifico successivo.

## 14. Prima capability di riferimento

La capability già usata in OR-06 diventa il primo riferimento semantico:

`lesson.preparation.observe`

Caratteristiche:
- mode: `PROPOSE_ONLY`;
- ownerDomain: `DOCENTE_OS`;
- Arena fornisce authority context curricolare;
- Atlas può fornire risorse opzionali;
- provider runtime resta sostituibile;
- output è una proposta per il docente;
- Control Center può osservare evidence/status soltanto.

OR-07 non attiva connessioni live: consolida il confine contrattuale.

## 15. Invarianti OR-07

**SC-01 — Domain authority preserved**  
La capability non acquisisce authority del dominio chiamante.

**SC-02 — Provider-neutral semantics**  
L'identità della capability non contiene il nome del provider.

**SC-03 — Explicit caller and decision owner**  
Caller e decision owner sono espliciti.

**SC-04 — No implicit mutation**  
READ_ONLY e PROPOSE_ONLY non possono produrre mutazioni.

**SC-05 — Evidence-carrying results**  
I risultati governati trasportano evidence refs.

**SC-06 — Provenance preserved**  
Provider e adapter sono sempre distinguibili dalla semantica della capability.

**SC-07 — Failure isolation**  
Un errore della capability non muta o invalida la fonte autorevole.

**SC-08 — Stale honesty**  
Dati stale non sono presentati come correnti.

**SC-09 — Control Center non-authority**  
Il Control Center osserva soltanto.

**SC-10 — DOS-A1 unchanged**  
OR-07 non modifica `RUNTIME_DEFERRED`.

## 16. Qualification gate per una futura implementazione

Una implementazione OR-07 non può essere qualificata senza:
1. test provider-neutral su almeno due fake adapter;
2. negative test per authority drift;
3. negative test per mutation su READ_ONLY/PROPOSE_ONLY;
4. provenance completa;
5. determinismo di serializzazione degli envelope;
6. stale/failure semantics;
7. nessun dato personale studente nelle fixture;
8. nessuna dipendenza del caller da API provider-specifiche;
9. Control Center in sola osservazione;
10. Human Review prima di qualunque capability MUTATIVE.

## 17. Non-obiettivi

OR-07 non:
- sceglie DSH vs Codex;
- abilita esecuzione live;
- definisce trasporto definitivo;
- crea un server centrale;
- introduce nuove write authority;
- migra logica di dominio fuori dai prodotti;
- modifica DOS-A1.

## 18. Exit OR-07 v0

OR-07 v0 è documentalmente completo quando:
- questo contratto è registrato nel Governed Document Registry;
- esiste un manifest machine-readable coerente;
- Governance CI è PASS;
- nessun vincolo di authority è cambiato.

Il passo successivo è OR-07-P1: fixture deterministica e validator provider-neutral interamente offline.
