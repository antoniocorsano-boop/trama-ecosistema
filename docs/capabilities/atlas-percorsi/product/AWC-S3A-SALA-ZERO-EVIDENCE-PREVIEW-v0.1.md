# AWC S3a — Prova tecnica visuale della Sala Zero (20 novembre 2026)

Stato: **CANDIDATO / SOLO ANTEPRIMA DOCENTE / NO DEPLOY / NO STUDENT AUTHORIZATION**.
Dipende da Studio Atlas S1–S2, PR #349. Non modifica l'infrastruttura della Biblioteca.

## Origine immutabile
- Curricolo Atlas, PR #136, commit `6285c47cf3c87e847fd6d00f8f6dfc8142590760`.
- Procedura `Atlas — AWC-F second-world transfer` RUN `44676144276`, risultato PASS.
- Archivio `atlas-awc-f-museo-zero-transfer`, ID `14601809466`, 1 548 003 byte, SHA-256 `782027195f22b61b55a6774f97996c3350c4cd02d961ed9dc395778577f3d63f`.
- Piano SHA-256 `fe6262023d8fb7d23317041da69475234448698431a89fff3cc0517c4c7756e3`.
- Scene `museo-zero.transfer` / `sala-zero.projection-cue`, riferimento narrativo `MZ4_TEST_MAPPING`.
- 16 oggetti, 192 triangoli; restituzione esatta dei fotogrammi WebGL e Blender attestata.
- Artefatto GitHub con conservazione limitata nel tempo; copia privata di recupero archiviata separatamente nel progetto TRAMA Ecosistema.

## Incremento effettivo
Nella fase **Scene** del progetto canonico MUSEO ZERO, una sezione a comparsa consente al docente di selezionare localmente l'archivio ZIP. Il lettore:
1. confronta **l'intero archivio** con la precisa impronta SHA-256 della prova approvata tecnicamente;
2. limita dimensioni e contenuti, legge l'indice ZIP e decomprime soltanto file previsti;
3. controlla fonte, revisione, piano, stato delle due derivazioni, permessi esplicitamente falsi e integrità delle immagini;
4. rende confrontabili gli stati **Originale / Inquadratura variata / Ripristinata / Segnale B** su Blender e WebGL;
5. conserva tutto esclusivamente in memoria temporanea del navigatore; revoca gli indirizzi locali quando la sezione viene smontata.

Nessun file è caricato su server terzi. Non sono necessari una GPU, un calcolo a pagamento, un nuovo motore o modifiche a `PathwayProject`. L'esperienza 2-D e l'anteprima governata per la revisione restano invariate.

## Precisazione obbligatoria
Questa è **un'ispezione della prova tecnica 3-D per fotogrammi**, non navigazione tridimensionale in tempo reale. I comandi modificano il fotogramma osservato, non azionano WebGL, Blender o un impianto. L'adattatore interattivo, il controllo parametrico `camera.orbit` e la verifica della qualità artistica su hardware reale sono la tranche successiva S3b, subordinata a un pacchetto distribuibile e immutabile.

Il rapporto originale mantiene `artisticApproval=false`, `studentAuthorized=false`, `publishable=false`. L'interfaccia non può trasformare tali valori in permessi.

## Accettazione
Prove `npm test`, `npm run typecheck`, `npm run build`, verifica nel navigatore mobile; riesame visivo umano dei fotogrammi da acquisire. La disponibilità temporanea dell'archivio in memoria non costituisce persistenza della bozza.
