# C6/S2b — Handoff e archivio locale delle revisioni EduTwin
2026-11-14 — IMPLEMENTATION_CANDIDATE / LOCAL_ONLY / FREE_ONLY / NO_RUNTIME.
Dipendenze #323 S1 e #324 S2a; issue #305. Nessuna promozione delle decisioni documentali #321/#322 o della storia Missione 118.

## Obiettivo operativo
Una bozza prodotta nella conversazione deve entrare nello Studio senza ricopiare testi, scene e decisioni. Prima modalità concreta: un singolo file JSON minimizzato, scelto dal docente attraverso Studio Atlas → Continua da ChatGPT → Importa bozza EduTwin. Non è un collegamento live a ChatGPT; nessuna integrazione di plugin o servizio esterno in questa tranche. Il file è un involucro di trasporto interno con projectId, expectedParentDigest (null solo all'inizio), input S2a. Non è un nuovo formato di pubblicazione: la compilazione continua a produrre il Pathway Authoring Package in AUTHORING. Non importare transcript, dati personali o ricevute di approvazione; il testo libero richiede verifica umana.

## Archivio
IndexedDB nello stesso browser dello Studio, distinto dalle attività ZIP esistenti perché conserva revisioni di authoring, non i file multimediali. Ogni scrittura ricompila la bozza e verifica la catena di input/digest; confronto dell'intero record precedente nella transazione, niente sovrascrittura di versioni o fork concorrenti; verifica dopo rilettura. Se una versione è obsoleta, blocco. Storico consultabile per numero di versione. Massimo 30 revisioni/progetto, 512 KiB per file; nessuna cancellazione automatica. La pagina non crea copie editabili indipendenti nel workspace, non aggira le review e non lancia l'anteprima learner. Una sola azione docente per scegliere il file; la preparazione del contesto della prossima revisione genera un file locale da riallegare, non trasmette nulla.
La conservazione è locale, non cifrata e non è un backup: cancellazione del browser/dispositivo può perderla. Digest non autentica l'autore e non protegge da un attore che riscrive l'intera origine. Le risorse restano riferimenti; assetBytesVerified false. Nessun collegamento Arena, nessun PASS, nessun runtime o pubblicazione.

## Qualificazione
Cinque test unitari di parsing, replay, continuità, rifiuto di revisioni obsolete/manomesse e autorità importata. Browser E2E nel flusso esistente: importazione pilota sintetico, esportazione contesto, revisione, riapertura dopo ricarica, storico, rifiuto di parent obsoleto. Nessun pacchetto privato Missione 118 caricato; fixture sintetica, non prodotto approvato. CI/revisione esatte obbligatorie. Non affermare avvenuto collaudo Android o qualità esperienziale.

## Passi successivi
S2c: collegare un'azione reale di ChatGPT alla produzione del file/ingresso e acquisizione dei byte degli asset mediante i contratti esistenti; qualificare i confini di accesso e conservazione e un backup esportabile. S3: collaudare il bridge e le meccaniche supportate, con revisione della storia e orientamento a contesto zero. Non degradare un'esperienza esplorativa a un quiz. S4 multimediale solo dopo revisione del prodotto giocabile. Nessun servizio a pagamento, nessun dato studente, nessuna pubblicazione automatica.
