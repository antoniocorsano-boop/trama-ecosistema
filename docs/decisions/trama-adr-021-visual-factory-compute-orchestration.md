# TRAMA-ADR-021 — Compute Policy TRAMA + SkyPilot per la Visual Factory

**Stato:** PROPOSED / HUMAN_DIRECTION_APPROVED  
**Data:** 2026-10-04  
**Perimetro:** TRAMA · Studio Atlas · Visual Factory  
**Runtime compute:** NOT_AUTHORIZED

## Contesto

La Visual Factory necessita di compute GPU variabile. Le prove con Colab Free e Kaggle Free hanno mostrato che:

- disponibilità dichiarata non equivale a provisioning affidabile;
- un provider consumer/notebook non può diventare dipendenza canonica senza prova programmatica;
- la selezione manuale dei provider non è un prodotto sostenibile;
- il creator non deve gestire GPU, modelli o quote.

Serve quindi un livello di orchestrazione multi-provider governato.

## Decisione proposta

1. La Visual Factory adotta una separazione formale:

   `TRAMA Compute Policy → SkyPilot → provider autorizzati`.

2. **TRAMA Compute Policy** governa:
   - costo autorizzato;
   - provider allowlist;
   - entitlement/quote residue;
   - profilo minimo GPU/RAM/disk;
   - qualità richiesta;
   - numero massimo di tentativi;
   - divieto di paid fallback;
   - divieto di quality downgrade automatico.

3. **SkyPilot** è il provisioner/orchestratore selezionato per:
   - cross-region failover;
   - cross-cloud failover;
   - provisioning su candidati ordinati;
   - gestione di errori di capacity/quota;
   - supporto a più acceleratori/infrastrutture.

4. SkyPilot riceve esclusivamente provider già filtrati da TRAMA Compute Policy.

5. La modalità iniziale è:

   `FREE_ONLY`.

   Se nessun provider può coprire il prossimo run a costo marginale autorizzato zero:

   `STOP_NO_FREE_PROVIDER`.

6. L'assenza di compute viene tradotta in Studio Atlas come:

   **Produzione in attesa**.

   L'authoring continua.

7. Nessun sistema può:
   - acquistare compute;
   - passare a provider paid;
   - fare retry illimitati;
   - degradare Q4→Q3;
   - cambiare modello per adattarsi all'hardware;

   senza nuova decisione umana.

8. Colab Free e Kaggle Free restano adapter diagnostici/opportunistici e non vengono rappresentati come infrastrutture SkyPilot.

9. Ogni piano compute e run successivo produce ricevute machine-readable senza alcuna authority di pubblicazione.

## Razionale

SkyPilot risolve già il problema industriale del provisioning/failover multi-cloud. TRAMA deve aggiungere soltanto la policy specifica dell'ecosistema, soprattutto il significato di `FREE_ONLY`, che non coincide con il prezzo di listino del cloud.

Questa scelta evita la costruzione di un orchestratore proprietario.

## Implementazione v0.1

Artefatti:

- `TRAMA-COMPUTE-POLICY-v0.1.md`;
- `SKYPILOT-ORCHESTRATOR-v0.1.md`;
- `trama-compute-policy.v0.1.schema.json`;
- `trama-compute-entitlement-snapshot.v0.1.schema.json`;
- `compile_visual_factory_compute_plan.py`;
- fixture/test deterministici;
- workflow CI `Visual Factory — Compute Policy v0.1`.

Il compiler non effettua provisioning.

## Gate per execution qualification

1. almeno due candidati programmabili SkyPilot-supported oppure un provider + capacità owned/Kubernetes;
2. adapter read-only per entitlement;
3. snapshot live fresco;
4. compile `FREE_ONLY` → `PLAN_READY`;
5. Human Review exact plan;
6. un bounded Q4 smoke run;
7. failover controllato dimostrato;
8. receipt conservata.

## Authority

Questa ADR non:

- autorizza spesa;
- autorizza compute reale;
- autorizza pubblicazione;
- modifica Arena/Atlas/Docente OS authority;
- attiva DOS-A1.
