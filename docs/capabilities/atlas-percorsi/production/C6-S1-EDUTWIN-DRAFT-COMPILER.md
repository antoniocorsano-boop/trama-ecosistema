# C6/S1 — Compilazione della bozza EduTwin
2026-11-14 — IMPLEMENTATION_CANDIDATE / OFFLINE / NO_RUNTIME / FREE_ONLY
Riferimenti #305, #321 (CI in attesa), #322 (storia in revisione), CQP-01, Storytelling First, Compact Learning World. Non sostituisce Pathway Authoring Package o ActivityPackage; usa il modello interno PathwayProject esistente. Non promuove le PR precedenti.

## Obiettivo
Interrompere la produzione artigianale: il prossimo ciclo deve produrre il progetto dal contenuto strutturato, mantenere le scene e le decisioni e verificare gli errori già emersi. Prima tranche: adapter deterministico da contenuti già scritti (tema, prologo, storia, mondo, scene, conseguenze) a bozza Studio Atlas. NON è ancora generazione semantica da una frase, pipeline grafica/sonora o prodotto giocabile completo.

## Esecuzione locale
Da products/studio-atlas con le dipendenze esistenti:
- npx --no-install tsx scripts/compile-edutwin-draft.ts --pilot
- npx --no-install tsx scripts/compile-edutwin-draft.ts <file JSON di authoring attendibile>
- npm test
L'ingresso è un adapter interno tipizzato, non un nuovo contratto di scambio e non un endpoint pubblico o un import sicuro di input arbitrario. Lo script stampa la bozza e i blocchi di produzione; non scrive archivi, non chiama servizi e non promuove review. Il pilot è un episodio di fantasia sui messaggi della mostra, NON la V10 approvata o una revisione del pacchetto privato. Il file esistente V9.1 e gli asset rimangono intatti.

## Regressioni derivanti dalla revisione umana
- Contesto zero: sette elementi obbligatori, resi effettivamente nel prologo; rifiuto prima azione genericamente "Continua".
- Storia e mondo con motivazione dichiarata; nessun campo vuoto tra i requisiti controllati.
- Scelte: destinazioni esistenti e distinte, azioni e feedback, stessi segnali del mondo prima/dopo, stati post-azione distinguibili.
- Grafo: identità univoche, nessuna scena irraggiungibile, ogni scena ha un percorso verso la conclusione; revisione tramite cicli ammessa se la conclusione rimane raggiungibile.
- Autorità: bozza DRAFT, storyboard non pronto, nessun PASS importato; preview e produzione restano bloccate dai gate esistenti.
Questi controlli sono strutturali: non certificano senso, qualità scientifica, adeguatezza del linguaggio, motivazione, assenza di quiz travestiti o esiti di apprendimento. La presenza di testo e stati differenti non prova una buona storia. Human Story Review, World Review, Human Use Review, child safety e gli altri gate rimangono obbligatori.

## Prossimi slice
S2: raccordare il brief conversazionale a questo adapter e al Pathway Authoring Package, validare integralmente l'ingresso e l'identità delle versioni, recuperare feedback REWORK esatti e asset per digest; nessuna approvazione o scrittura automatica. 
S3: collegare un candidato con review governate al bridge di anteprima già esistente; usare il renderer Atlas senza duplicarlo. Le meccaniche non supportate richiedono una decisione esplicita; non ridurle in automatico a quiz. Walkthrough a contesto zero e feedback umano.
S4: agganciare regia/visual/audio, packaging, revisioni selettive e conservazione; nessun costo o distribuzione finché i gate esistenti non sono qualificati. 
Il docente approva o corregge, non deve eseguire i comandi tecnici. La CLI è un ingresso di sviluppo, non l'interfaccia finale. Non dichiarare il generatore attivo da ChatGPT, non pubblicare studenti.
