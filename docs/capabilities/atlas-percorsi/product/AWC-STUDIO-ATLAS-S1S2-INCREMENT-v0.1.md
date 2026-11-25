# AWC / Studio Atlas — Incremento S1–S2 (20 novembre 2026)

**Stato:** PROPOSTA APPLICATIVA / PR IN BOZZA / NESSUNA PUBBLICAZIONE.
**Provenienza decisionale:** Curricolo Atlas PR #136, `AWC-STUDIO-ATLAS-WORLD-DESIGN-v1.md`.
**Ambito:** `products/studio-atlas` in TRAMA; la biblioteca Atlas 3-D mantiene un percorso separato.

## Decisione e motivazione
1. Integrare World Composer nelle fasi già presenti **Mondo** e **Scene**, senza app aggiuntiva, editor universale o nuovo lettore studente.
2. Usare `PathwayProject.world`, `PathwayProject.scenes`, `SceneWorldState` e `PathwaySceneChoice.worldAfter` come sole fonti delle informazioni mostrate. La selezione temporanea di alternative visive e stati A/B è locale alla schermata e **non** aggiunge campi, schema o autorizzazioni.
3. Un risultato B è visibile **solo** se la scelta contiene già uno stato `worldAfter` documentato. Un testo di riscontro non viene trasformato in un cambiamento visuale inventato.
4. Mantenere la rappresentazione illustrata 2-D come riferimento; 3-D e combinata sono soltanto alternative da valutare. Nessuna produzione tridimensionale viene eseguita da questa interfaccia.
5. Il pulsante di ripristino **ripristina la visualizzazione del confronto**, non modifica né annulla revisioni canoniche. I campi di modifica già esistenti continuano a salvare il progetto e a invalidare le revisioni di prodotto quando previsto.
6. Presentare correttamente il salvataggio come **locale**, non sincronizzato; una revisione superata non può essere sovrascritta attraverso `updateProject` con revisione attesa. Non costituisce ancora un archivio professionale autenticato e con recupero.

7. La conseguenza osservabile di una scelta può essere modificata in anteprima e conservata **esplicitamente** nel campo `worldAfter.status` già previsto dal modello. L'azione conserva il testo sul dispositivo, incrementa la revisione, invalida la revisione di prodotto secondo il percorso esistente e non modifica `scene.world`. Il testo provvisorio non viene scartato quando un salvataggio fallisce.

## Invarianti mantenute
- Curricolo e approvazioni rimangono di Arena, senza duplicazione.
- MUSEO ZERO mantiene identità, storia, sequenza delle scene, scelte, riferimenti delle prove e origine 2-D.
- La funzione `studio-atlas.preview-snapshot/v0.1` e l'apertura governata dell'anteprima Atlas non sono sostituite.
- Nessun caricamento o pubblicazione di risorse, nessuna anagrafica studente, nessun calcolo a pagamento, nessuna esecuzione di un piano AWC.

## Prove aggiunte
- `world-composer.test.ts`: recupero dei luoghi del mondo; presenza di una variazione realmente definita; assenza di stati inventati; aggiornamento semantico validato, reversibile e immutabilità della sorgente.
- `world-composer-store.test.ts`: aggiornamento con revisione attesa, rifiuto di revisione superata e di progetto assente.
- Verifiche CI da acquisire su PR: `npm test`, `npm run typecheck`, `npm run build`, controllo dei confini Studio Atlas e prova di integrazione Atlas.

## Mancanze esplicite
- Scelta 2-D/3-D persistita e autorizzata dal contratto: **non implementata**.
- Produzione Blender/WebGL direttamente dall'editor: **non implementata**.
- Revisione storico-visuale con annullamento di modifiche già salvate: **non implementata**.
- Persistenza professionale multipiattaforma e risoluzione atomica dei conflitti: **non implementata**.
- Collaudo umano su telefoni a 320/390 px, testo al 200%, qualità artistica e continuità della biblioteca: **da eseguire**.

## Soglia per l'incremento successivo
Dopo l'esito positivo delle prove di codice e della revisione dell'esperienza d'uso, collegare **solo** un adattatore AWC qualificato per Sala Zero in ambiente isolato, con versione/digest di origine, artefatto accessibile 2-D e revisione artistica. Il passaggio non dà alcuna autorizzazione alla pubblicazione studente.
