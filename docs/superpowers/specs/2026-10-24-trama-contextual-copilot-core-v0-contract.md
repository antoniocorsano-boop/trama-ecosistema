# TRAMA Contextual Copilot Core v0 — contratto canonico

**Data:** 2026-10-24  
**Stato:** HUMAN-APPROVED · IMPLEMENTATION AUTHORIZED · NO MERGE / NO DEPLOY  
**Baseline TRAMA:** `main@f666239cfdb359ecf52342ed3502f4a60233ea45`  
**Riferimento di ricerca preservato:** ramo `docs/contextual-copilot-core`  
**Consumatori iniziali:** Docente OS, `registro-docente`  
**Contratti subordinanti:** OR-07 Shared Capability Layer · OR-08 Runtime Portability

## 1. Decisione

TRAMA adotta un **Contextual Copilot Core headless, provider-neutral e privacy-first** riusabile da più applicazioni.

Il Core non è:

- una quarta applicazione;
- un server centrale;
- un nuovo database;
- un proprietario dei dati verticali;
- un'autorità curricolare o istituzionale;
- un provider generativo;
- una libreria UI obbligatoria.

È una libreria condivisa che riceve un contesto minimo, filtra e ordina azioni dichiarate dalle applicazioni e applica policy prima della risoluzione e dell'esecuzione.

## 2. Ordine di autorità

L'ordine vincolante è:

```text
Policy > capability dichiarate dall'app > stato > semantica > preferenze
```

Nessun modello, embedding, ranking o preferenza locale può introdurre una capability che il consumer non abbia già dichiarato.

I guardrail minimi di rischio e privacy definiti dal Core sono invarianti: una policy iniettata può restringere ulteriormente ciò che è consentito, ma non può rendere più permissivo il nucleo condiviso.

## 3. ContextSnapshot

Contratto minimo:

```ts
interface ContextSnapshot {
  appId: string
  surface: string
  entities: readonly ContextEntity[]
  capabilities: readonly CapabilityId[]
  permissions: readonly string[]
  privacy: PrivacyContext
  temporal?: TemporalContext
  state?: string
}
```

Regole:

- `appId` identifica il consumer ma non autorizza branching applicativo nel Core;
- `surface` è semantica e non una route tecnica;
- `entities` contiene solo riferimenti necessari alla richiesta corrente;
- `capabilities` delimita ciò che il consumer può chiedere al Core;
- `permissions` e `privacy` restano esplicite;
- nessun oggetto specifico di provider entra nel contratto condiviso;
- dopo la validazione, il Core costruisce uno **snapshot difensivo read-only** per policy, Semantic Port ed executor;
- array e campi privacy rilevanti per capability/permission/routing remoto non vengono passati per riferimento al chiamante;
- un'estensione non può mutare il contesto del consumer per rendere più permissiva una chiamata successiva.

## 4. Capability comuni v0

```text
ASK
SEARCH
OPEN
CREATE
ANNOTATE
SUMMARIZE
PREPARE
CONTINUE
REMIND
LINK
IMPORT
REVIEW
EXPLAIN
```

Il significato verticale e l'effettiva implementazione restano negli adapter delle applicazioni.

## 5. Livelli di rischio

```text
READ_ONLY
PROPOSE
WRITE_REVERSIBLE
WRITE_EXTERNAL
INSTITUTIONAL_DECISION
```

Regole v0:

- `READ_ONLY`: nessuna mutazione;
- `PROPOSE`: nessuna scrittura canonica automatica;
- `WRITE_REVERSIBLE`: richiede conferma umana prima dell'esecutore;
- `WRITE_EXTERNAL`: negata per impostazione predefinita e, quando autorizzata dalla verticale, richiede comunque conferma umana;
- `INSTITUTIONAL_DECISION`: sempre negata dal motore generico; l'autorità resta nella verticale e nella decisione umana;
- i requisiti di conferma e il divieto sulle decisioni istituzionali sono guardrail del Core e non possono essere rimossi da un `PolicyEngine` personalizzato.

## 6. Classificazione dati minima

```text
PUBLIC_APP
TEACHER_PROFESSIONAL
CURRICOLO
STUDENT_PERSONAL
STUDENT_SENSITIVE
INSTITUTIONAL
```

Principi:

- assenza di una regola = deny per flussi protetti;
- `STUDENT_PERSONAL` e `STUDENT_SENSITIVE` non sono inoltrati automaticamente a provider remoto;
- l'autorizzazione al provider remoto deve essere esplicita nel contesto;
- il Core non riclassifica autonomamente dati protetti in classi più permissive;
- l'adapter espone solo i dati necessari alla richiesta corrente.

## 7. Modalità generativa

Il Core deve restare utile senza provider generativo e possiede una modalità esplicita:

```text
generativeMode = none | local | remote
```

`none` è il default fail-closed.

Devono continuare a funzionare, quando dichiarate dal consumer:

- apertura;
- ricerca locale;
- annotazione proposta o reversibile;
- revisione deterministica;
- collegamento governato;
- ordinamento deterministico delle azioni.

Per le azioni `requiresGenerativeAI = true`, il Core applica una guardia propria **prima** della policy iniettata:

- `none` → `GENERATIVE_PROVIDER_UNAVAILABLE`;
- `remote` senza `privacy.remoteProviderAllowed` → `REMOTE_PROVIDER_NOT_AUTHORIZED`;
- `remote` con `STUDENT_PERSONAL` o `STUDENT_SENSITIVE` → `PROTECTED_DATA_REMOTE_DENIED`;
- `local` resta subordinata alle capability e alle ulteriori policy del consumer.

Un `PolicyEngine` personalizzato può restringere questi esiti, non aggirarli.

## 8. Semantica opzionale

Un `SemanticPort` può cercare o riordinare azioni già ammesse.

Ogni `SemanticPort` dichiara obbligatoriamente:

```text
mode = local | remote
```

Vincoli:

- nessuna dipendenza obbligatoria da un motore specifico;
- il ranking non può introdurre azioni o capability;
- errore del ranking → fallback deterministico sulle azioni già consentite;
- assenza del Semantic Port non invalida il Core;
- un Semantic Port `local` opera sotto le normali policy del Core;
- un Semantic Port `remote` può ricevere il contesto solo quando `privacy.remoteProviderAllowed = true`;
- `STUDENT_PERSONAL` e `STUDENT_SENSITIVE` non vengono inoltrati al Semantic Port remoto dal Core;
- quando l'accesso semantico remoto non è autorizzato o il contesto contiene classi studente protette, il ranking opzionale degrada al comportamento deterministico;
- un'azione che richiede esplicitamente ricerca semantica viene negata se il Semantic Port necessario non è disponibile o non è autorizzato;
- policy, ranking ed executor ricevono uno snapshot difensivo: mutazioni tentate da estensioni non possono alterare il contesto originale del consumer.

## 9. Policy fail-closed

La policy viene valutata:

1. durante la risoluzione delle azioni;
2. nuovamente prima del dispatch.

Se il policy engine fallisce, l'azione non viene eseguita. Il risultato deve essere un deny esplicito e l'esecutore non deve essere invocato.

Un `PolicyEngine` iniettato può introdurre ulteriori restrizioni o richiedere ulteriore conferma, ma non può:

- autorizzare `INSTITUTIONAL_DECISION` nel Core generico;
- rimuovere la conferma umana richiesta da `WRITE_REVERSIBLE` o `WRITE_EXTERNAL`;
- aggirare i vincoli privacy che proteggono i flussi remoti semantici o generativi;
- mutare lo snapshot ricevuto per ampliare capability, permessi o autorizzazioni remote del consumer.

## 10. Confine degli adapter

Gli adapter verticali sono responsabili di:

- costruire il `ContextSnapshot`;
- dichiarare capability e permessi;
- tradurre un'azione condivisa in operazione verticale;
- raccogliere l'eventuale conferma umana;
- applicare la mutazione canonica nella propria authority;
- presentare il risultato nell'interfaccia applicativa.

Il Core non conosce `Lesson`, `UDA`, `ClassDiary`, route o componenti applicativi.

## 11. Primo test cross-app

Fixture minime:

```text
Docente OS
surface = LESSON_CONDUCT
capabilities = [ANNOTATE, OPEN, REVIEW, ASK]

registro-docente
surface = CLASS_OR_UDA
capabilities = [ANNOTATE, SEARCH, REVIEW, ASK]
```

Il gate deve dimostrare che:

- entrambi usano lo stesso motore;
- ogni azione restituita appartiene alle capability dichiarate;
- nessun identificatore dei due consumer compare come branching nel sorgente del Core;
- una policy negativa impedisce sempre il dispatch;
- una policy permissiva non può aggirare i guardrail minimi di rischio o privacy generativa;
- il ranking semantico non crea nuove capability;
- un'estensione non può mutare il contesto del chiamante per introdurre capability o autorizzazioni successive;
- un errore semantico degrada al comportamento deterministico;
- un Semantic Port remoto non riceve contesto protetto o non autorizzato;
- un errore della policy fallisce chiuso;
- una write reversibile non raggiunge l'esecutore senza conferma umana.

## 12. Collocazione v0

L'implementazione canonica vive in:

`shared/contextual-copilot-core/`

Il modulo possiede un proprio `package.json` e non introduce dipendenze JavaScript alla radice di TRAMA.

Il primo incremento resta `private`: la qualifica riguarda il contratto, il codice e l'artefatto riproducibile. Pubblicazione o distribuzione cross-repository sono decisioni successive e separate.

## 13. Superficie importabile

L'artefatto deve contenere soltanto:

```text
README.md
index.d.ts
package.json
src/index.js
```

Test, fixture e documenti di governance non entrano nel pacchetto distribuibile.

## 14. Presentation adapter

FAB, barra, pannello o altre superfici sono presentation adapter separati. Ricevono azioni già risolte dal Core e non acquisiscono logica di dominio o authority.

Il lavoro di ricerca sul posizionamento adattivo del FAB resta preservato sul ramo `docs/contextual-copilot-core` e non è requisito del primo incremento headless CORE-01 v0.

## 15. Criterio di uscita CORE-01 v0

Il candidato è qualificabile quando:

1. test cross-app e regressioni fail-closed sono verdi;
2. i guardrail minimi di rischio e privacy generativa risultano non aggirabili da policy iniettate;
3. i flussi semantici remoti rispettano la classificazione privacy;
4. le estensioni non possono mutare il `ContextSnapshot` del consumer per ampliare authority o capability;
5. il vocabolario è conforme a TERM-01;
6. nessun branching applicativo compare nel Core;
7. l'artefatto a secco contiene solo la superficie prevista;
8. Governance CI passa sullo stesso exact SHA;
9. nessun merge, deploy o publish è stato eseguito.

Solo dopo questo confine LIB-01B può collegare la Biblioteca privata al Core tramite un adapter sottile, senza un resolver sostitutivo locale.
