# FD-05/C — Diagnostica unificata e separazione del collaudo riservato

2026-11-14 | IMPLEMENTATION_CANDIDATE | NO_DEPLOY | issue #315

## Evidenze consolidate
- FD-00: #314 integrata, ricevuta 8eed94b; riconciliazione documentale separata.
- FD-05/A: #316 integrata; preparazione e verifica sei file sintetici 1.0.1.
- FD-05/B: Atlas #86 integrata; run 43590516258 PROJECT_METADATA_PASS in sola lettura.
- FD-02: HUMAN_MOBILE_SYNTHETIC_PASS, confermato 14/11; non prova i digest remoti.
- FD-01: Workers Free osservato, R2 Paid osservato; nessun uso R2 o fallback a pagamento. Quota residua, entitlement Pages, scrittura, costo incrementale e condizioni non qualificati.
- GET remoto precedente HTTP 403: resta bloccante; nessun bypass o retry automatico.

## Implementazione
scripts/free_deploy_readiness.py confronta la struttura delle ricevute locali con la fixture già fissata in FD-05/A. Il risultato è sempre NOT_AUTHORIZED, anche con ricevute coerenti: non verifica provenienza, freschezza o autenticità. Non è un gate di autorizzazione. Non emette comandi provider, non usa rete o credenziali; exit 2 per qualsiasi report valido, exit 1 su input illeggibile. Non trasmettere segreti. I sette test deterministici coprono separazione delle evidenze, identità, digest e blocco permanente. CI senza secret; esito da qualificare.

## FD-03 — percorso riservato candidato
Cloudflare Pages rende pubbliche le anteprime per impostazione predefinita; Access applicato alle preview non protegge automaticamente il dominio di produzione. Riferimento: https://developers.cloudflare.com/pages/configuration/preview-deployments/ .
Prima di qualsiasi caricamento privato occorre qualificare su fixture esclusivamente sintetica:
1. Piano e quote Access effettivi, condizioni e costo incrementale zero; nessun nuovo servizio senza autorizzazione.
2. Identificare tutte le URL (produzione, alias, hash, eventuali domini) e le risorse dirette (immagini, audio, JS, manifest). Nessuna esposizione privata su origine pubblica.
3. Negare accesso anonimo e a identità non autorizzate su ogni superficie; verificare sessione autorizzata, logout, revoca e accesso diretto ai file. Non confondere 403 da runner con prova di privacy.
4. Non promuovere automaticamente preview a produzione; nessun uso di link segreti.
5. Conservare Missione 118 V9.1 e originali privati. Collaudo locale resta l'alternativa fino a qualificazione Access.

## Prossimo gate di distribuzione
Prima di implementare/attivare un adapter di scrittura: riconciliare FD-01 e GET remoto legittimo; verificare permessi minimi e dipendenze bloccate, identificare esatta fixture, ambiente e precedente deploy; autorizzare separatamente singola operazione e rollback. Per Pages rollback solo verso produzione precedente riuscita (https://developers.cloudflare.com/pages/configuration/rollbacks/). Limiti pubblicati Free: 20.000 file e 25 MiB/file, 500 build/mese; non equivalgono a quota residua né a quota Direct Upload (https://developers.cloudflare.com/pages/platform/limits/).

Percorso docente obiettivo: apri anteprima, valuta, approva; collegamento da condividere soltanto dopo eventuale autorizzazione scolastica e pubblicazione distinta. Non sono autorizzati deploy, modifiche provider, spesa o pubblicazione studenti da questa PR.
