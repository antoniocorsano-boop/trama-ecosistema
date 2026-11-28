# TRAMA-ADR-022 — Distribuzione governata a costo zero (FREE-DEPLOY)

**Stato:** PROPOSED / HUMAN_DIRECTION_APPROVED  
**Data:** 2026-11-14  
**Perimetro:** intero ecosistema TRAMA  
**Runtime, spesa e pubblicazione:** NOT AUTHORIZED

## Contesto e decisione

La direzione è approvata dall'utente: «Ok sono d'accordo con questa impostazione e documentiamo tutto». Le difficoltà ripetute dei collaudi e il rifiuto Vercel 403 documentato nella PR #313 richiedono una capacità permanente, non una soluzione occasionale per Missione 118. Nessun costo personale ricorrente deve essere imposto per il lavoro scolastico.

1. Modalità iniziale **FREE_ONLY**, zero spesa aggiuntiva autorizzata, anche per dominio, storage, traffico, compilazioni, API, autenticazione e backup. Non basta che il listino riporti gratuito: servono condizioni d'uso compatibili, quote effettive, assenza di addebiti automatici e disponibilità nel conto autorizzato.
2. **Atlas Edu** è la destinazione logica dei soli prodotti didattici pubblici approvati, non una nuova applicazione o autorità. Preferire distribuzione statica, senza account studente, dati personali, telemetria o dipendenze server non necessarie. Cloudflare Pages candidato primario; GitHub Pages alternativa per contenuti pubblici compatibili. Non creare un servizio per ogni EduTwin.
3. **TRAMA Lab** è la destinazione logica dei collaudi riservati. Separazione reale da produzione, autenticazione e autorizzazione verificate prima del primo contenuto riservato; nessun URL segreto o noindex come sostituto dell'accesso controllato. Cloudflare Access/Pages per statico e altra soluzione gratuita qualificata per dinamico. Se impossibile, collaudo locale privato; nessun ripiego pubblico.
4. Le applicazioni professionali hanno confini distinti: elaborazione locale e conservazione protetta ove possibile; servizi con dati personali solo sotto responsabilità e autorizzazione dell'istituzione e condizioni tecniche/contrattuali verificate. Non trasferire dati di alunni a servizi consumer per risparmiare.
5. Archivi sorgente, master, manifesti, diritti, impronte, versioni e ricevute conservati indipendentemente dal fornitore; uscita portabile e ripristino provato. Gli originali riservati non entrano in repository pubblici, bundle o artefatti CI pubblici.
6. Controlli di costo, compatibilità, accesso, integrità, accessibilità, diritti, privacy e approvazione esatta prima di distribuzione. Un merge tecnico, un collaudo o un receipt tecnico non autorizzano pubblicazione. In assenza di evidenza o quota sufficiente: STOP_NO_FREE_PROVIDER / STOP_ACCESS_UNVERIFIED / STOP_APPROVAL_MISSING. Nessun acquisto, upgrade, trial a rinnovo, bypass o fallback a pagamento.
7. Revisione periodica e prima di ogni nuova distribuzione. Registrare fornitore, piano, limiti, data, prova, decisione, scadenza e ripiego. Nessuna migrazione o dismissione di ambienti esistenti senza decisione specifica.

## Autorità e rapporti con decisioni esistenti

Integra ADR-008, ADR-013 (Git-first), ADR-019, ADR-020 e ADR-021 (FREE_ONLY per compute), senza sostituirli. Arena conserva autorità curricolare; Atlas governa le pubblicazioni; Docente OS le decisioni professionali; Control Center resta READ_ONLY. DOS-A1 resta RUNTIME_DEFERRED. TRAMA Lab e Atlas Edu non sono nuove autorità.

## Attuazione e gate

- [Piano e inventario iniziale FREE-DEPLOY](../strategy/trama-free-deploy-v1.md)
- [Lista di controllo per ogni distribuzione](../strategy/trama-free-deploy-checklist-v1.md)
- [Roadmap TRAMA](../../ROADMAP.md)

La presente proposta registra l'indirizzo umano; l'integrazione documentale e qualsiasi implementazione, creazione account, configurazione, attivazione o pubblicazione rimangono soggette alle rispettive autorizzazioni. Nessuna attestazione di hosting già qualificato.
