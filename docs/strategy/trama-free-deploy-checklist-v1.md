# FREE-DEPLOY — Lista di controllo operativa v1

**Stato:** PROPOSED / NO_RUNTIME · 14 novembre 2026  
Riferimenti: [ADR-022](../decisions/trama-adr-022-free-deploy.md), [piano](trama-free-deploy-v1.md).

Da compilare prima di ogni distribuzione o nuova infrastruttura, non solo per il pilota. Tutte le condizioni applicabili devono risultare verificate con evidenza; dato mancante = STOP. Questa lista non è un'autorizzazione.

## A. Prima di creare o aggiornare un ambiente

- [ ] Identificati prodotto, commit/versione, classe di destinazione e proprietario autorizzato.
- [ ] Verificate condizioni d'uso applicabili al contesto scolastico, piano e permessi reali.
- [ ] Verificati quote residue, costo massimo incrementale pari a zero e blocco addebiti automatici per tutte le risorse (compilazioni, traffico, funzioni, storage, domini, auth e CI).
- [ ] Nessun upgrade, trial con rinnovo, pagamento, servizio a consumo o credenziale richiesta in chat.
- [ ] Per Lab: autenticazione e policy sul dominio principale, alias, preview, asset e API dirette. Prova anonima negata, prova autorizzata positiva; nessun bypass. Verificare protezione prima del primo contenuto.
- [ ] Contenuti e dati classificati, nessun dato alunni o risorsa riservata in repository/CI/hosting pubblico; per dati professionali autorizzazione e condizioni istituzionali specifiche.
- [ ] Autorizzazione operativa al provisioning/deploy esatto registrata; niente auto-deploy di bozza o main verso destinazioni non governate.
- [ ] Ripiego qualificato della stessa classe di riservatezza; altrimenti stop o locale.

## B. Prima di pubblicare agli studenti

- [ ] Identità, versione, lista dei soli file pubblicabili e SHA-256 confrontati con artefatto approvato.
- [ ] Originali, master, ZIP intake, guida privata e informazioni tecniche esclusi dal bundle salvo distinta approvazione.
- [ ] Esiti qualità, ascolto se presente, diritti/licenze, accessibilità, prova umana e riferimenti Arena quando pertinenti; nessun dato personale o telemetria.
- [ ] Decisione editoriale Atlas esplicita per versione e destinazione; approvazione di codice o anteprima non sufficiente.
- [ ] Prova tecnica (browser, mobile, LIM, URL, integrità, assenza di richieste indesiderate), receipt e procedura di ritiro/rollback.
- [ ] Solo dopo verifica e decisione, link stabile da Atlas/Padlet.

## C. Ricevuta minima e controllo ricorrente

Registrare data, prodotto/versione/SHA, destinazione/classe, provider/piano/quote, prova dei costi, protezioni, digest e URL se autorizzato, riferimento decisione, esiti, rollback, prossima verifica. Non registrare credenziali, token, email o link di bypass. Separare evidenze tecniche, decisioni umane e autorizzazioni istituzionali. Al mutamento di piano, termini, account, commit o policy, invalidare la relativa prova; riesaminare mensilmente e prima di ogni distribuzione. In mancanza di condizione essenziale: **STOP**, conservazione degli artefatti e segnalazione motivata.
