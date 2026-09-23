# R4-P2/S1 — Product review del prototipo

**Data:** 2026-09-23  
**Esito:** CHANGES APPLIED / READY FOR HUMAN PRODUCT REVIEW  
**Perimetro:** prototipo NO_RUNTIME

## Rilievi

### P1 — Attrito eccessivo nel percorso ordinario
Il prototipo iniziale presentava immediatamente tre blocchi di compilazione. Pur essendo tutti facoltativi, la forma visiva poteva trasformare la riflessione in un nuovo adempimento.

**Correzione:** aggiunto il percorso rapido **“Tutto regolare · chiudi”**. Il docente può chiudere la lezione senza compilare campi quando non esiste nulla di significativo da registrare.

### P1 — Consenso incompleto per la continuità
La conferma di una decisione e il suo trasferimento alla preparazione successiva erano concettualmente separati nella specifica, ma il prototipo mostrava soltanto la prima azione.

**Correzione:** una decisione segue ora due momenti distinti:
1. **Conferma** — la decisione diventa professionalmente valida;
2. **Porta nella prossima preparazione** — secondo consenso esplicito per la scrittura cross-surface.

La conferma della riflessione non trasferisce automaticamente alcuna decisione.

### P2 — Gestione del focus nel pannello modale
Il prototipo restituiva il focus alla chiusura ma non lo confinava nel dialogo.

**Correzione:** aggiunto confinamento del focus per Tab e Shift+Tab durante l’apertura del pannello.

## Verifica dei principi

- osservazione, riflessione e decisione restano distinte;
- il percorso rapido non genera inferenze né decisioni;
- nessuna azione IA produce scritture;
- nessuna decisione viene trasferita senza secondo consenso;
- il prototipo resta utilizzabile senza IA;
- Atlas non è richiesto;
- Arena non viene modificata;
- `KnowledgeResource != TeachingMaterial` resta invariato.

## Gate umano da eseguire

La review umana deve verificare:

1. se **“Tutto regolare · chiudi”** rende il flusso sufficientemente leggero;
2. se il doppio consenso **Conferma → Porta nella prossima preparazione** è comprensibile e non ridondante;
3. se il pannello è utilizzabile in meno di un minuto in un caso reale;
4. se **“Dalla lezione precedente”** appare nel punto giusto della preparazione;
5. se il linguaggio è professionale ma non burocratico.

Non viene autorizzato alcun runtime da questa review.
