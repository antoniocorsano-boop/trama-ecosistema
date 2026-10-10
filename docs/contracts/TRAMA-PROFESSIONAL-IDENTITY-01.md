# TRAMA-PROFESSIONAL-IDENTITY-01

**Versione:** 1.0.0  
**Stato:** QUALIFIED_CONTRACT_CANDIDATE  
**Ambito:** identità professionale TRAMA; nessun runtime IdP autorizzato da questo documento.

## 1. Scopo

Questo contratto definisce il confine provider-neutral dell'identità professionale dell'ecosistema TRAMA. Stabilisce chi è il professionista, quale contesto istituzionale minimo può essere trasportato, quali applicazioni/modalità può aprire e come una relying application collega il principal TRAMA a una propria identità locale.

Non trasferisce ai servizi centrali i permessi fini dei prodotti. Docente OS, Arena, Studio Atlas, Curricolo Atlas e Control Center mantengono le proprie regole locali di autorizzazione e i propri dati.

## 2. Principal

L'identità autorevole deriva dalla coppia esatta **issuer + subject** dell'asserzione verificata. Email, nome visualizzato e metadati mutabili non sono chiavi autorevoli di account linking o autorizzazione.

TRAMA può risolvere `issuer + subject` in un `principalId` opaco e stabile. Il `principalId` non deve coincidere con gli UUID locali dei prodotti.

## 3. InstitutionalContext

I contesti ammessi sono:

- `PERSONAL`;
- `INSTITUTION`.

Un contesto `INSTITUTION` richiede un riferimento opaco `institutionRef`. Il solo possesso del contesto non concede alcun permesso di prodotto.

## 4. ApplicationEntitlement

Gli entitlement centrali sono intenzionalmente coarse-grained e autorizzano soltanto ingresso o modalità applicativa:

| Applicazione | Entitlement |
| --- | --- |
| DOCENTE_OS | USE |
| CURRICOLO_ATLAS | READ |
| STUDIO_ATLAS | AUTHOR |
| ARENA | ENTER |
| CONTROL_CENTER | GOVERNANCE_OPERATOR |

`GOVERNANCE_OPERATOR` non autorizza da solo operazioni sensibili o irreversibili: il confine privilegiato resta soggetto a step-up/MFA nelle fasi dedicate.

Non sono ammessi nel contratto centrale permessi fini come approvare/pubblicare il curricolo di istituto, modificare lezioni, leggere workspace altrui o mutare draft Studio Atlas.

## 5. Mapping verso identità locali

Il binding canonico è server-side:

```text
(principalId, application) -> localSubjectRef
```

Non è richiesto che il `localSubjectRef` abbia lo stesso UUID del principal TRAMA. Email e metadati mutabili non sono chiavi di binding autorevoli.

## 6. Relying application OAuth/OIDC

Il confine standard è OAuth 2.x / OpenID Connect con:

- authorization code flow;
- PKCE `S256`;
- issuer verificato contro allowlist esatta;
- audience/client binding esatto;
- `state` obbligatorio;
- `nonce` obbligatorio quando viene consumato un ID token;
- redirect URI in allowlist esatta, senza wildcard;
- nessun bearer token/JWT nell'URL applicativo;
- nessun token condiviso tra prodotti mediante `localStorage`.

La relying application stabilisce la propria sessione locale soltanto dopo la verifica dell'asserzione e il mapping/autorizzazione locale.

## 7. Sessione e logout

La sessione locale appartiene al prodotto destinazione. Una sessione esistente può continuare soltanto entro la propria scadenza governata e non può acquisire nuovi privilegi senza revalidation riuscita.

Il logout locale deve chiudere la sessione locale anche se il provider non è disponibile. Un eventuale logout coordinato/globale è best-effort quando protocollo e provider lo supportano e non deve essere simulato come garanzia inesistente.

## 8. Failure model

Quando discovery, verifica, JWKS o login del provider non sono disponibili, un nuovo sign-in professionale fallisce chiuso.

L'outage del piano identitario non deve abbattere le superfici pubbliche indipendenti:

- TRAMA Gateway;
- Curricolo Atlas in modalità pubblica;
- Control Center pubblico.

Una sessione locale già stabilita non può ottenere nuovo privilegio durante un outage senza una revalidation valida.

## 9. Pattern vietati

Sono vietati:

- email o metadati mutabili come authority key;
- wildcard per issuer, audience o redirect URI;
- implicit/hybrid flow;
- token in URL applicativi;
- token cross-product condivisi via `localStorage`;
- obbligo di UUID globale condiviso tra prodotti;
- permessi fini di prodotto nel piano identitario centrale;
- escalation implicita cross-product;
- identità learner nel contratto professionale.

## 10. Confine learner

Questo contratto non introduce account studente, email learner, profilo personale globale o tracking cross-experience. Atlas learner resta fuori dal piano identitario professionale.

## 11. Autorità e portabilità

Questo documento e l'istanza machine-readable `governance/access/trama-professional-identity-contract.v1.json` definiscono il contratto TRAMA. Il provider concreto è sostituibile se implementa questo confine tramite standard interoperabili.

Qualsiasi provider candidato resta separato dai database di prodotto e non diventa autorità sul curricolo di istituto, sulle lezioni, sui materiali, sui draft Studio Atlas o sui dati learner.
