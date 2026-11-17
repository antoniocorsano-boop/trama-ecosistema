# VF-3D — Laboratorio Blender interattivo: qualificazione circoscritta

**Stato:** DESIGN / UPSTREAM DOCUMENTATION REVIEWED / LIVE TEST NOT RUN.
**Raccordo:** VF-3D-01, ADR-021, TRAMA #338, #340, #344; Atlas #106 (P2/B03). RIF-06 è il riferimento approvato per il confronto; i byte e il digest vanno verificati prima dell'esecuzione. Non sostituisce SP-08.1c (TripoSR), né modifica il planner, la Compute Policy o l'autorità editoriale.

## Decisione

Aggiungere a J07 BLENDER_FINISH una modalità di lavoro interattiva a sessione persistente, opzionale rispetto alla modalità batch esistente. Nessun secondo orchestratore o nuovo servizio pubblico. L'agente modifica copie della scena, legge lo stato, acquisisce viste e confronta rendering senza creare un nuovo commit a ogni intervento. GitHub conserva codice, decisioni, hash e prove finali. Il master B03 resta immutabile; nessun export candidato sovrascrive il riferimento o l'asset approvato.

## Candidati e differenze verificabili

- Qwen-MM-Plugins Blender: documentazione dichiara Blender 4.2.x, server MCP con add-on separato, 22 strumenti, supporto Codex, modalità headless con Xvfb. Capability senza chiave Qwen; servizi esterni possono avere chiavi/costi. Licenza progetto Apache-2.0, componenti derivati blender-mcp MIT (NOTICE). Candidato prioritario perché P2 usa Blender 4.2.23; compatibilità esatta non dimostrata.
- MCP ufficiale Blender: richiede Blender >=5.1, distinto dal precedente; eseguire confronto solo se il primo candidato non supera il gate, senza aggiornare la baseline 4.2.23. Non è un fallback automatico.
- Modalità batch esistente: riferimento di controllo e via produttiva già disponibile; non abbandonarla finché la modalità interattiva non è qualificata.

Fonti (consultate 2026-11-17):
- https://qwenlm.github.io/qwen-mm-plugins-hub/plugins/blender/
- https://qwenlm.github.io/qwen-mm-plugins-hub/plugins/blender/cookbook/
- https://github.com/QwenLM/Qwen-MM-Plugins/blob/main/src/capabilities/blender/NOTICE.md
- https://www.blender.org/lab/mcp-server/

## Gate in ordine (uno per volta)

| Gate | Prova ed evidenza minima | Stop |
|---|---|---|
| L0 | Revisione upstream fissata, lock dipendenze e licenze; binario Blender 4.2.23 con hash; compute entitlement fresco, costo marginale zero dimostrato, client MCP e canale immagini realmente disponibili | STOP_NO_FREE_RUNTIME / STOP_UNQUALIFIED_DEPENDENCIES / STOP_NO_CLIENT |
| L1 | Ambiente isolato, utente non privilegiato, workspace esclusivo senza credenziali, rete negata durante il lavoro, loopback soltanto, budget 15 min per prova, nessuna installazione/download automatico. Verificare che servizi a pagamento e strumenti di asset esterni non siano invocabili | STOP_ISOLATION |
| L2 | Una sessione reale: leggere scena vuota; creare cubo di controllo e materiale; salvare, ispezionare e renderizzare; modificare la scena nella medesima sessione, renderizzare di nuovo, verificare differenza e riaprire il file salvato. Conservare ID sessione, versione, hash, log e due PNG | STOP_SESSION_OR_RENDER |
| L3 | Copia verificata del master B03, camera e luce bloccate, RIF-06 verificato. Rendering baseline e due interventi massimi su microstruttura superficiale, piega centrale e riflessioni; snapshot per ogni intervento, viste frontale e obliqua comparabili | STOP_NO_REFERENCE / REVISE |
| L4 | Confronto indipendente B03 vs candidato: identità, naturalezza della curvatura, dettaglio materico, qualità fotografica, invarianti geometriche. Giudizio artistico umano separato da test tecnici. Conservare .blend e immagini; GLB solo se richiesto e con verifica baking/runtime | NO_PROMOTION se nessun vantaggio dimostrato |

## Contratto minimo di sessione

Registrare runId, sessionId, requestDigest, inputDigest, referenceDigest, baseSceneDigest, adapterRevision, blenderVersion, runtimeEvidenceRef, costEvidenceRef, isolamento, elenco operazioni consentite, limiti e timeout, snapshot e output con hash. Separare telemetria di sessione da ricevuta finale. Il codice Python arbitrario offerto dai server MCP non costituisce una barriera di sicurezza: isolare il processo e negare accessi a segreti, filesystem esterno e rete, anche in caso di chiamate improprie. Nessun endpoint pubblico o accesso al dispositivo del docente. Non conservare dati personali o credenziali nelle evidenze.

Non confondere una sessione interattiva interna con un servizio permanente: avvio on demand, chiusura esplicita e recupero da snapshot. Se un runner temporaneo non può sostenere un client agente reale, non dichiarare L2 superato con semplici script batch. Il calcolo CPU non richiede necessariamente GPU per L2, ma tempi e risorse vanno misurati.

## Esito atteso

L0–L2 provano l'integrazione tecnica, L3–L4 il vantaggio artistico. Il massimo di due cicli correttivi riguarda il pilota artistico; non autorizza ripetizioni automatiche. Se la prova non è fattibile a costo zero o non migliora B03, mantenere la baseline e chiudere il ramo sperimentale con motivazione. Nessuna nuova spesa, account, installazione, inferenza, pubblicazione o merge automatico autorizzato da questo documento. Non dichiarare esito PASS senza evidenze effettive.
