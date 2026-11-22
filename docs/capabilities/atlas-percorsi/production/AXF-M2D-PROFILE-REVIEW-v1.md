# AXF-M2-D — Revisione delle evidenze e composizione candidata
15 novembre 2026 — TECHNICAL_EVIDENCE_REVIEWED / AUTHORING_CHANGE_TEST_PENDING / NOT_RUNTIME_AUTHORIZED.
Fonti: [M2-C](AXF-M2C-EQUIVALENT-WORLD-EVIDENCE-v1.md), [indirizzo multimotore](AXF-M2D-MULTIENGINE-DECISION-v1.md), [storyboard](AXF-M1-ENERGIA-STORYBOARD-v1.md). Atlas #96 head 3589c363e24fc66be588d336849997545bcd1b7f, run 43705917257, artefatto 14158363789: ZIP recuperato, SHA256 18354f42cbab6c640866007427afa6c62179f8431911f4ec8790caa3db1cd8f2 verificato. Otto PNG e comparison.json ispezionati in sessione; non è review umana o indipendente.
## Resa e misurazioni
| Viewport | Phaser avvio ms | GDevelop avvio ms | Altezza pagina in screenshot |
|---|---:|---:|---:|
| 320×720 | 184 | 219 | 1422 px |
| 390×844 | 157 | 199 | 1271 px |
| 844×390 | 145 | 199 | 1344 px |
| 1280×800 | 138 | 154 | 1344 px |
Ready misura callback del renderer in una singola esecuzione per viewport; non tempo fino a piena interattività percepita né benchmark statistico. Peso directory 1390396 vs 926499 byte; GDevelop export 3 s nel runner. Non confrontabile direttamente con tempo di composizione umano. Entrambi mostrano geometrie, etichette e comandi equivalenti, valori coerenti. Su 320 px il titolo e i comandi si spezzano, tavola piccola; su orizzontale la scena 468 px supera l'altezza viewport 390. In tutti i casi pagina lunga, nessuna identità narrativa né oggetti illustrati, azioni del banco fuori dalla scena. Resa immersiva REVISE per entrambi; equivalenza funzionale PASS. Non attribuire differenze di qualità alla tecnologia. 
## Automazione e interoperabilità
Sorgente unica Tiled TMX, export JSON, PNG deterministici, import Phaser diretto; generatore Python produce progetto GDevelop nativo con sprite, coordinate e tre binding di azione, export ufficiale locale. GDevelop introduce un passaggio di generazione/export e bridge iframe same-origin; non è test dell'host Atlas di produzione. Phaser ha già candidato host specializzato #95. Entrambi riusano stesso modello e host HTML. Il tempo di modifica umana e la qualità di authoring visuale non misurati. Prova mirata aggiunta in Atlas #96 head a02341910803bfb8c0944d4e5237260be5ed6059: spostare quaderno y=42→170 in una sola sorgente, rigenerare entrambi, confronto semantico coordinate e risorse, posizione precedente inattiva e nuova attiva, traccia e privacy in due viewport. Esito in attesa, non dichiarare PASS prima del run.
## Composizione M3 proposta (non autorizzazione)
| Scena storyboard | Profilo | Scelta candidata e ragione | Alternativa |
|---|---|---|---|
| E01/E07 | Storia | renderer illustrato esistente, PE-01/04, continuità e controllo lettura | HTML accessibile |
| E02 | Esplorazione | GDevelop candidato circoscritto: scena illustrata, tre zone e dialoghi contestuali, verifica del beneficio; nessun motore curricolare | Tiled+Phaser se bridge/beneficio non dimostrato |
| E03/E04 | Esperimento | Phaser + modello puro già qualificato, azione sulla stazione e dati a fianco, alternative DOM | HTML equivalente, non prima scelta visuale |
| E05 | Decisione/mostra | renderer illustrato + conseguenza del modello in host | scena spaziale solo se utile |
| E06 | Trasferimento | modello distinto da qualificare, renderer leggero o Phaser se interazione utile | rinviare se review scientifica mancante, non inventare approvazione |
Riutilizzare PE-01–04 e master secondo Reference Lock M1. Nuovi asset solo con storyboard e diritti; niente ritagli incoerenti. E02/E03 devono essere percepiti come stesso atelier, non due app: passaggio contestuale, stato volatile posseduto dall'host, uscita e ritorno, solo un renderer attivo, verifica indipendente delle evidenze. Proposta di un micro-handoff isolato prima della generalizzazione; contratto v0.2 non esteso da questa ricevuta.
## Gate residui
M2-D resta aperto: esito prova modifica, beneficio concreto del profilo GDevelop, decisione umana circoscritta M3. F3-B resta REVISE; non far passare schema comparativo per prodotto. W6A, diritti/licenze e lock, accessibilità completa, device/LIM, integrazione host, Arena e review scientifica del trasferimento restano aperti. Nessun costo, deploy o uso studenti.