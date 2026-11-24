# STUDIO-ATLAS-DESIGN-02 — Atelier illustrato, da docente a studente
Decisione dell'ideatore: la rappresentazione mostrata in conversazione (Lato docente → Studio Atlas — Atelier digitale → Ambienti / Personaggi / Interazioni → Composizione dell'esperienza → Esperienza educativa fruibile in Atlas, Lato studente) diventa interfaccia applicativa, non soltanto illustrazione o documento. Base UX2b e7e072a4: tutte e tre le procedure GitHub PASS.
## Implementazione
Un componente AtelierWorkflow condiviso: pagina iniziale panoramica e progetto aperto (Idea) con accessi effettivi ai medesimi editor Mondo, Storia, Esperienza, Scene, Produzione, Prova. Non crea un secondo modello, non modifica contenuti né gate. Il docente può utilizzare i due temi già disponibili; disposizione a tre colonne su desktop e verticale su mobile. Nessuna dipendenza esterna. La schermata di origine era una composizione concettuale con immagini cercate esternamente, non un contratto pixel per pixel: le immagini qui sono originali canoniche Museo Zero riutilizzate in modo documentato, non il risultato automatico del progetto corrente.
## Registro delle risorse
Origine Curriculum-Atlas commit cdc7fee5082ba7ce59cd074bdb16725a8a36a6f5, byte identici verificati tramite SHA Git; destinazione products/studio-atlas/public/design/atelier/workflow/.
- ambienti.webp: public/media/museo-zero/narrative-v1/sala.webp — 394c0baafb33effcdd3c5d4637acd11304936cc0, 121098 byte.
- personaggi.webp: public/media/museo-zero/narrative-v1/squadra.webp — 0bfc6b8b0569c2be78ad029577455040aa726587, 172230 byte.
- interazioni.webp: public/media/museo-zero/narrative-v1/regia.webp — ac51399172129b363c374f5e85f1663c8e03c668, 168034 byte.
- esperienza.webp: public/media/museo-zero/sala-zero-r1.webp — 91da92be66a899e5070b9e6d8475a41af52744e2, 170436 byte.
Totale 631798 byte, risorse WebP locali, nessuna chiamata remota o generazione obbligatoria. Conservarne la provenienza; sono copie di distribuzione, non nuovi master.
## Qualificazione
Prova Chromium: quattro immagini decodificate, selettore dei temi, apertura degli editor reali, passaggio a Prova senza alterare il progetto, 320px senza overflow. Screenshot dei due temi su desktop e Atelier a 320px conservati come artefatto CI temporaneo; non approvazione professionale. Nessun rendering 3D generico o composizione universale dichiarati. I prossimi interventi seguono prove complete da progetto vuoto, essenziale, articolato, avanzato; non aggiungere nuove funzionalità isolate senza dimostrarne il raccordo. PR in bozza, nessun merge, deploy, autorizzazione studenti o spesa.
