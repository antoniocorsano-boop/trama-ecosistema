# Flusso di qualificazione dei contenuti — CQP-01
Stato: IMPLEMENTATION_CANDIDATE / READ_ONLY / NOT_RUNTIME_AUTHORIZED
Data: 13 novembre 2026.

## Un solo flusso
Progetta → Produci → Verifica → Prepara la pubblicazione. Riutilizzare ADR-020, Storytelling First, Student Library, Pathway Authoring Package, Visual Production Request/Receipt, ActivityPackage, ATLAS-MAT-PUB-01, Audio Factory AF-01 (#303, non integrata). Non introdurre un nuovo formato di pubblicazione né un nuovo registro di autorità.

| Fase | Evidenze richieste | Fonte da raccordare |
|---|---|---|
| Progetta | Tema, ruolo, scopo, prima azione; storia se prevista; revisione scientifica/fonti; revisione linguistica integrale di testi e guida | Authoring Package, Story Review, Experience Quality |
| Produci | Visual Review e Reference Lock; se voce prevista, ricevuta tecnica e ascolto umano di ogni traccia e montaggio | Visual Factory e AF-01; audio indipendente dal runtime pubblico |
| Verifica | Digest e prove sul prodotto finale, accessibilità con controlli tecnici e umani, sicurezza/privacy, diritti, uso integrale | LOI, review del prodotto, ricevute esistenti |
| Prepara la pubblicazione | Binding Arena verificato, decisione Atlas competente | ActivityPackage e gate Atlas |

Voce: copione congelato, pronunce/nomi verificati, segmenti, sintesi o registrazione su richiesta, controlli di durata/silenzio/clipping/digest/trascrizione, confronto testo-parlato, ascolto umano integrale di segmenti e montaggio, correzioni selettive, nuova impronta dopo modifica. Trascrizione automatica non prova la pronuncia. Non promettere una voce senza revisione; se il piano richiede voce, assenza o errore bloccano avanzamento. Un piano senza voce richiede decisione editoriale esplicita e contenuti accessibili; non è ripiego automatico. Scrittura: controllo ortografico/grammaticale, numeri/unità, coerenza, fonti, revisione umana; nessun errore noto aperto. Non confondere evidenza di controllo con garanzia assoluta o certificazione esterna.

## Prima tranche eseguibile
content-quality-progress.ts calcola la prossima verifica dalle evidenze governate e dal piano della versione esatta. Associazione activityId/version/manifestDigest, check/ruolo/evidenza, duplicati e dati obsoleti bloccanti. Nessuna evidenza ricavata da un manifest importato o da un flag locale. Studio Atlas /attivita mostra percorso sintetico e dettagli espandibili; niente pulsanti fittizi né auto-approvazioni. Il piano V7 è l'unico piano esatto attualmente associato e non ha ricevute umane; tutti i gate sono aperti. Altri prodotti: in attesa di piano, verifiche conservative. La funzione non autentica ricevute: il futuro adattatore deve risolverle da fonti autoritative e con identità professionale. Nessuna pubblicazione o esecuzione autorizzata anche se tutte le prove sono presenti. Test coprono prerequisiti, mancanti, digest cambiato, duplicati, ruolo errato, voce, stato finale.

## Prossima tranche
1. Raccordare i riferimenti delle ricevute esistenti e l'identità/ruolo professionale; registrazione append-only e verifica del digest anche di ciascun asset.
2. Collegare revisione testuale/scientifica e Audio Factory #303; qualificare esecuzione e licenze, nessuna spesa, non scegliere automaticamente un modello non approvato.
3. Prova completa su Missione 118 V7, con registrazioni effettive e ricevute; nuova versione dopo qualsiasi modifica; poi gate Atlas già esistenti. Solo dopo estendere ai materiali e agli altri prodotti.
CQP-01 non certifica oggi alcun prodotto, non modifica i contratti autorevoli e non sostituisce i gate di pubblicazione.

## CQP-02 — prime evidenze esatte
Le verifiche di corrispondenza delle risorse e di navigazione locale sono ora distinte dalla qualificazione finale. Il riferimento `CQP-02-MISSIONE-118-V7-TECHNICAL-EVIDENCE.md` documenta i due esiti tecnici circoscritti; Studio Atlas li proietta soltanto se tutti i byte della copia V7 coincidono con i digest curati. Nessuna approvazione umana o pubblicazione automatica. Le ricevute di produzione e i ruoli autentici restano da raccordare.
