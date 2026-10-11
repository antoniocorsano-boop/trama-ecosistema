# ACCESS-01 Task 11 — Live Provider Authorization Decision

**Data:** 2026-10-11  
**Stato:** `AWAITING_EXPLICIT_HUMAN_AUTHORIZATION`  
**Baseline:** `main@4bf57b2fca78bed87db4a2f3f8734d0567835b3b`  
**Contratto:** `TRAMA-PROFESSIONAL-IDENTITY-01@1.0.0`  
**Preflight:** `docs/evidence/access-01/access-01-phase-2-provider-preflight.md`  
**Threat model:** `docs/evidence/access-01/access-01-phase-2-threat-model.md`

> Questo documento raccoglie in **un solo gate umano** tutte le autorizzazioni necessarie per eseguire Task 11 end-to-end. Non autorizza da solo alcuna mutazione esterna.

## 1. Decisione proposta

Autorizzare un pilot live **isolato** di TRAMA Access con Supabase Auth, mantenendo invariati i confini approvati della Phase 2.

L'autorizzazione unica, quando concessa esplicitamente, comprenderà esclusivamente:

1. creazione/selezione di **un progetto Supabase dedicato a TRAMA Access**;
2. regione **`eu-central-1` / Frankfurt**;
3. utilizzo **solo Free tier**, senza piano o add-on a pagamento;
4. configurazione OTP email con template `{{ .Token }}` e `shouldCreateUser:false`;
5. utilizzo del solo SMTP built-in per il pilot, **solo se** l'indirizzo pilot è idoneo secondo i vincoli del provider;
6. creazione/configurazione di una secret key server-only, mai esposta in repository, browser, artifact o log;
7. pre-creazione di **un solo provider user pilot**;
8. applicazione dello schema/store Access dedicato necessario a identity, context, entitlement, session e rate-limit tecnico;
9. pre-provisioning di un solo Principal/LoginAlias/binding/context/entitlement pilot;
10. esecuzione di un singolo live smoke controllato OTP → exact subject → Principal → AccessSession → launcher → logout;
11. raccolta delle evidenze tecniche e review indipendente sull'exact head risultante.

L'autorizzazione **non** comprende deploy pubblico/production, custom SMTP, costi, federation verso prodotti, learner identity, dati studente o ampliamento del pilot.

## 2. Default vincolanti

| Decisione | Default autorizzabile | Vincolo |
| --- | --- | --- |
| Provider | Supabase Auth | Progetto dedicato, nessun riuso di DB prodotto |
| Regione | `eu-central-1` / Frankfurt | Se non disponibile: STOP, nessuna sostituzione automatica |
| Piano | Free | Se richiede pagamento/add-on: STOP |
| Pilot | 1 provider user | Nessun batch, nessun self-signup |
| OTP | email code | `{{ .Token }}`, nessun Magic Link |
| User creation | disabilitata | `shouldCreateUser:false` obbligatorio |
| Email delivery | built-in SMTP | Solo se pilot idoneo; altrimenti STOP prima di custom SMTP |
| Secret | server-only | Mai `NEXT_PUBLIC_*`, log, artifact o repository |
| Sessione TRAMA | TTL assoluto `28800` s | Non sliding, provider session non è AccessSession |
| Rate limit live | shared/persistent | 5 request + 10 verify / alias / 15m; 20 request-global + 20 verify-global / 15m |
| Identity authority | exact `issuer + subject` | email mai authority |
| Federation | esclusa | Phase 3 separata |
| Deploy pubblico | escluso | decisione successiva, dopo qualificazione live |

## 3. Mutazioni esterne autorizzabili con un solo PASS umano

Quando il gate viene approvato, l'esecuzione può procedere senza ulteriori micro-approvazioni attraverso queste mutazioni, nell'ordine:

1. verificare disponibilità della quota Free nell'organizzazione scelta;
2. creare il progetto TRAMA Access in Frankfurt;
3. confermare che non siano attivi costi o add-on;
4. configurare OTP-only e blocco auto-creation;
5. verificare l'idoneità dell'indirizzo pilot al built-in SMTP;
6. creare la secret server-side;
7. creare un solo provider user pilot e acquisire il subject stabile;
8. applicare la migration Access live;
9. creare il binding governato e i record pilot necessari;
10. configurare adapter/store live in un ambiente di qualificazione non pubblico;
11. eseguire test automatici e live smoke;
12. produrre receipt sanitizzato e richiedere review Codex indipendente.

Ogni passo deve essere idempotente o avere una verifica pre-mutation che impedisca duplicazioni.

## 4. Stop condition automatiche

L'esecuzione si ferma senza reinterpretare il gate se si verifica uno dei seguenti casi:

- quota Free non disponibile;
- regione Frankfurt non disponibile o non verificabile;
- il provider richiede un piano/add-on a pagamento;
- l'indirizzo pilot non è ammesso dal built-in SMTP;
- sarebbe necessario configurare custom SMTP;
- non è possibile impedire l'auto-creazione utente nel flusso OTP;
- il live datastore non può garantire rate limit condiviso/persistente e atomico tra istanze;
- `findAliasByEmail` live non può cancellare/rilasciare la query sottostante tramite `AbortSignal`;
- secret o token finirebbero in browser, URL, log, artifact o repository;
- il provider restituisce un subject che non coincide con il binding pre-provisionato;
- una migration introduce dati prodotto/learner o modifica l'authority contract;
- un test di neutralità enumeration/timing, revoca, sessione o logout fallisce;
- sarebbe necessario introdurre federation o deploy pubblico per completare il pilot.

Uno STOP riporta lo stato a `AWAITING_HUMAN_DECISION` e non autorizza workaround impliciti.

## 5. Requisiti tecnici non negoziabili

Il live runtime deve preservare integralmente gli invarianti Phase 2:

- nessun Principal viene creato da OTP;
- nessun binding viene creato dalla sola email;
- exact `issuer + subject` resta l'unica authority esterna;
- exactly one active institutional context per pilot Principal;
- entitlement centrale solo coarse-grained;
- nessun prodotto riceve token/sessione Access;
- provider availability, alias lookup, send e verify restano bounded e cancellabili;
- outcome pubblici non rivelano membership dell'allowlist;
- limiter live persistente preserva tutti e quattro gli scope `OTP_REQUEST`, `OTP_REQUEST_GLOBAL`, `OTP_VERIFY`, `OTP_VERIFY_GLOBAL`;
- AccessSession resta opaca, server-side e con TTL assoluto ≤ 8h;
- logout locale Access resta immediato anche durante outage provider;
- fake/memory non sono ammessi nel runtime live.

## 6. Evidenze obbligatorie prima di dichiarare Task 11 qualificato

Devono esistere evidenze verificabili per:

1. project/region/plan receipt senza secret;
2. OTP template code-only e `shouldCreateUser:false`;
3. provider user pre-created prima del primo OTP;
4. exact subject binding verificato senza pubblicare email, OTP, token o secret;
5. shared/persistent rate limiter con regressione cross-instance per tutti e quattro gli scope;
6. cancellazione reale del lookup alias con rilascio della query sottostante;
7. unknown alias e allowed alias pubblicamente neutrali nei failure path;
8. subject mismatch fail-closed;
9. revoca alias/context/entitlement efficace al successivo uso server-side;
10. session TTL assoluto e logout locale;
11. secret scan negativo;
12. unit test, typecheck, build, Browser Certification e Governance PASS sull'exact head;
13. fresh independent Codex review senza blocker aperti.

Il live OTP e qualsiasi token/provider session non devono mai essere salvati nelle evidenze.

## 7. Receipt minimo del pilot

Il receipt versionabile nel repository può contenere:

- timestamp;
- exact head SHA;
- provider kind;
- regione;
- piano Free confermato;
- metodo email built-in confermato;
- nomi/versioni dei gate eseguiti;
- esito PASS/FAIL;
- identificatori tecnici non personali strettamente necessari.

Non può contenere email pilot, OTP, secret, access token, refresh token, cookie, provider subject in chiaro o altri dati personali non necessari.

## 8. Confine dopo Task 11

Un eventuale `TASK_11_QUALIFIED` significa soltanto:

- provider live qualificato;
- Access store live qualificato;
- un pilot identity path qualificato;
- nessuna federation prodotto;
- nessun deploy production autorizzato automaticamente.

La sequenza successiva resta:

```text
Task 11 qualified
  → decisione deploy controllato TRAMA Access
  → evidenza pilot isolato
  → Phase 3 federation contract
  → singolo prodotto pilota
  → estensione progressiva
```

## 9. Gate umano unico

**Stato corrente:** `AWAITING_EXPLICIT_HUMAN_AUTHORIZATION`.

L'approvazione di questo gate autorizzerà esclusivamente il perimetro dei §§1–3 e accetterà gli stop automatici del §4. Qualunque costo, custom SMTP, deploy pubblico, federation, nuovo utente pilot o ampliamento dati resterà una decisione separata.
