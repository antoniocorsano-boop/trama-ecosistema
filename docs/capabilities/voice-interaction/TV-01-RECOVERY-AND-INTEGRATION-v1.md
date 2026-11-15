# TV-01 — TRAMA Voice Interaction: recupero e integrazione

**Data:** 2026-11-15  
**Stato:** PROPOSED / CONTRACT_AND_RECOVERY_PLAN / NO_RUNTIME_AUTHORIZATION  
**Perimetro:** Copilota contestuale TRAMA, Docente OS (pilota), Arena, Atlas, Studio Atlas, Registro Docente (integrazioni candidate), Control Center (osservazione).  
**Authority change:** NONE. DOS-A1 e gli stati di qualificazione esistenti non cambiano.

## 1. Obiettivo

Consentire al docente di comandare le funzionalità dei prodotti TRAMA attraverso il linguaggio naturale parlato, con risposta visiva e, quando appropriato, vocale. Non introdurre un nuovo assistente, una nuova autorità centrale o un secondo motore di esecuzione. La voce è un canale di ingresso/uscita del Copilota contestuale esistente. L'interazione testuale rimane equivalente e sempre disponibile.

Distinguere TV-01 (interazione operativa) da Audio Factory (produzione di narrazioni e risorse audio). Nessuna dipendenza obbligatoria tra i due.

## 2. Inventario TV-01A — evidenze statiche

Fonti storiche consultate, senza modificare i repository sorgente:

| Sorgente (versione identificata) | Evidenza | Esito recupero |
| --- | --- | --- |
| [DocenteDocAi LiveAssistant](https://github.com/antoniocorsano-boop/DocenteDocAi/blob/a145c5e83e2a24023388ed29f8040e37e52c322f/src/components/LiveAssistant.tsx) | Acquisizione microfono, PCM, sessione Gemini Live, uscita audio, tool calls navigate/searchWeb/addNote/addEvaluation | Recuperare concetto e casi d'uso; riscrivere confini e ciclo di vita. Non importare direttamente. |
| [DocenteDocAi Beta LiveAssistant](https://github.com/antoniocorsano-boop/DocenteDocAi_Beta/blob/24344049f0df8798fc52f6d8fa4168ea791a1998/src/components/LiveAssistant.tsx) | Medesima dichiarazione delle quattro funzioni e istruzione di sistema con cognomi | Stessi vincoli; nessuna prova di miglioramento runtime. |
| [AssistantModal](https://github.com/antoniocorsano-boop/DocenteDocAi/blob/a145c5e83e2a24023388ed29f8040e37e52c322f/src/components/AssistantModal.tsx) | SpeechRecognition / webkitSpeechRecognition, it-IT, risultati intermedi, gestione errori | Recuperare UX; verificare disponibilità e percorso locale effettivo; eliminare auto-invio e rischio di stato React obsoleto. |
| [VoiceNoteRecorder](https://github.com/antoniocorsano-boop/DocenteDocAi/blob/a145c5e83e2a24023388ed29f8040e37e52c322f/src/components/VoiceNoteRecorder.tsx) | Registrazione e invio audio WebM a modello Gemini per trascrizione | Recuperare gestione esplicita dello stream; escludere il percorso remoto nel pilota. |
| [Orbit Jarvis Blueprint](https://github.com/antoniocorsano-boop/DocenteDocAi/blob/a145c5e83e2a24023388ed29f8040e37e52c322f/docs/ORBIT_JARVIS_BLUEPRINT.md) | Contestualità, capability, azioni e tracciabilità | Recuperare principi, non duplicare il nucleo TRAMA. |
| [Copilot Engine](https://github.com/antoniocorsano-boop/DocenteDocAi/blob/a145c5e83e2a24023388ed29f8040e37e52c322f/src/ai/copilot/copilotEngine.ts) | Comandi strutturati e funzione pura | Riferimento per mapping semantico; niente importazione di logica verticale. |
| [Arena useSpeech](https://github.com/antoniocorsano-boop/CurManLight_arena/blob/d8b1bf43388cb5c4cdcc940b0c558bb128976c4c/src/hooks/useSpeech.ts) | SpeechSynthesisUtterance e selezione voce | Candidato per sintesi locale, da qualificare. |
| [TRAMA Contextual Copilot Core](../../../shared/contextual-copilot-core/README.md) | Registry, resolveRequest, discoverRequestIntent, dispatch, guardrail | Punto di integrazione canonico, non da sostituire. |

Rilievi bloccanti per il riuso diretto: il vecchio LiveAssistant invia cognomi e audio a un provider esterno; addNote e addEvaluation sono dichiarate ma non implementate nell'esecutore esaminato, che restituisce un esito predefinito positivo anche per funzioni non gestite. Il ramo navigate ricade su home per destinazioni non valide. La chiusura della sessione non mostra una chiamata esplicita a stop() per tutte le tracce del microfono. Il vecchio modello preview, disponibilità, costi, latenza e compatibilità reale non sono verificati. L'inventario è statico e non è una certificazione di funzionamento.

## 3. Confini architetturali TV-01B

Riferimenti: [OR-07](../../contracts/trama-shared-capability-layer-contract-v0.md), [OR-08](../../contracts/trama-runtime-portability-contract-v0.md), [core](../../../shared/contextual-copilot-core/README.md).

Flusso: gesto esplicito → acquisizione locale → trascrizione finale modificabile → classificazione del dato e snapshot del consumer → resolveRequest (eventuale discoverRequestIntent solo come proposta) → policy/consenso → dispatch del consumer per azioni autorizzate → ricevuta verificata → risposta visiva/voce opzionale.

Proposta di porte sostituibili, senza registrare nuove capability operative in questa fase:
- SpeechInputPort: rilevazione disponibilità locale effettiva, avvio esplicito it-IT, stop/cancel, risultati intermedi non eseguibili, risultato finale, errori espliciti.
- SpeechOutputPort: disponibilità locale effettiva, speak/cancel, esclusione di lettura di dati riservati in ambienti condivisi.
- VoiceSession: stati IDLE, LISTENING, REVIEW, RESOLVING, CONFIRMATION_REQUIRED, EXECUTING, COMPLETED, UNAVAILABLE, FAILED, CANCELLED; una sessione per volta; nessun microfono in background.
- Request: requestId, caller/surface, snapshot verificato dal consumer, testo finale, classificazione, origine vocale; trascrizione effimera, niente audio nel contratto del core o nelle evidenze.
- Result: requestId, stato effettivo, actionId se risolto, ricevuta di dominio se eseguito; nessun successo simulato.

La disponibilità di Web Speech API non dimostra elaborazione locale: nessun fallback remoto implicito. Il consumer autorizza e controlla i suoi dati e le proprie route; il core filtra capacità dichiarate, valuta policy e non acquisisce autorità. DISCOVERED non significa autorizzato. Risoluzione ambigua, input non riconosciuto, azione ignota, contesto cambiato o provider indisponibile producono nessuna esecuzione; ritorno alla modalità testuale.

## 4. Politica e sicurezza

- Pilota con dati sintetici/non personali; zero invio audio o trascrizioni a servizi esterni, zero telemetria di contenuto, zero persistenza di audio e trascrizioni nel layer condiviso.
- Classificare prima del routing, non dopo l'invio; nessun nominativo, valutazione o altra informazione personale degli studenti in provider, prompt, log o ricevute condivise. Nessuna identificazione biometrica.
- Microfono solo su gesto esplicito, indicatore visibile e stop accessibile; arresto di tutte le tracce e cancellazione dell'audio su stop, errore, revoca permesso, navigazione, blocco, background e chiusura.
- Nessuna azione su risultati intermedi o rumore ambientale; conferma visiva contestuale delle operazioni mutative, nuova verifica al dispatch, protezione contro ripetizioni e azioni duplicate.
- OR-07 v0 ammette READ_ONLY e PROPOSE_ONLY. Nessuna mutazione di dominio, pubblicazione, scrittura esterna o decisione istituzionale abilitata da TV-01. Eventuali azioni future richiedono contratto e autorità verticale, qualifica e revisione umana separata.
- Zero costi obbligatori; provider sostituibili; nessuna chiave API client, nessun account aggiuntivo richiesto per il pilota.
- Risposte vocali disattivabili, testo sempre accessibile; nessuna risposta contenente dati riservati pronunciata in classe. Nessuna attivazione studente o pubblicazione.

## 5. Sequenza e criteri di avanzamento

| Fase | Deliverable | Gate |
| --- | --- | --- |
| TV-01A | Inventario statico e rilievi legacy | Revisione delle fonti e classificazione recupero/riscrittura/esclusione |
| TV-01B | Contratto candidato e piano | Riesame architetturale/privacy; nessuna modifica authority |
| TV-01C | Esperimento locale isolato con adattatori sostituibili | Audio sintetico o volontario non personale; rete disattivata e osservazione richieste; zero egress; costo zero; errori e cleanup |
| TV-01D | Adattatore vocale → Contextual Copilot Core | Test con porte simulate, nessuna esecuzione implicita, regressione core invariata |
| TV-01E | Pilota Docente OS docente-only | Navigazione, consultazione e proposte; prova reale web/Android; niente dati studente |
| TV-01F | Estensioni verticali candidate | Qualifica separata per ogni consumer; Registro Docente resta locale e non mutativo nel perimetro TV-01; Atlas studente escluso dal pilota |
| TV-01G | Dialogo bidirezionale | Valutazione separata per privacy, costi, interruzione, latenza e disponibilità locale; nessun provider Live scelto ora |

## 6. Matrice minima di qualificazione

- Riconoscimento: italiano, rumore, annullamento, negazione/revoca permessi, assenza microfono, assenza rete, dispositivo senza motore locale; testo alternativo sempre funzionante.
- Comandi: "mostrami l'orario", "apri la preparazione della lezione", "cerca un laboratorio sull'energia" (soltanto azioni dichiarate); comando ambiguo o fuori perimetro → chiarimento o nessuna esecuzione.
- Policy: azione inventata, capability mancante, DISCOVERED senza autorizzazione, contesto obsoleto, richiesta di scrittura/decisione istituzionale, contenuto personale → nessuna azione non autorizzata.
- Ciclo di vita: doppio tap, stop, cambio pagina, blocco/background, perdita connessione, riconoscimento tardivo → nessun microfono residuo né dispatch duplicato.
- Esito: executor indisponibile o errore → non dichiarare successo; receipt proveniente dal consumer; risposta testuale equivalente; sintesi interrompibile.
- Accessibilità: target touch adeguato, etichetta accessibile, stato leggibile, tastiera, zoom 200%, Android e web reali. Iconografia sobria e non invasiva.
- Evidenze: versioni adapter e dispositivo, casi e risultati con dati sintetici, prova assenza egress, consumo risorse e latenza misurata; regressione core e revisione indipendente. Nessun PASS presunto.

## 7. Decisione operativa proposta

TV-01A è una ricognizione statica documentata; TV-01B è un candidato per revisione, non un contratto approvato. Primo passo successivo: confrontare candidati STT/TTS locali gratuiti, compatibilità italiana e licenze, poi prototipo isolato TV-01C. Non aggiungere dipendenze, abilitare microfoni, provider o distribuzione, né modificare prodotti in questa PR documentale.
