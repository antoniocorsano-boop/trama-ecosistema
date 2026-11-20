# CURR-REF-01/G02 — Prototipo editoriale del raccordo UdA–criteri–evidenze

**Stato:** `EDITORIAL_SIMULATION_NOT_OBSERVATION` · **Ambito:** Tecnologia, prima secondaria, blocco B25 · **Uso:** esclusivamente locale e istruttorio.

Questa è una proiezione **eseguibile ma non integrata** nei prodotti. È costruita su [G01](curr-ref-01-g01-uda-valutazione.json), senza creare un secondo curricolo, un secondo contratto valutativo o una nuova fonte di autorità. Per esaminarla: [fixture G02](curr-ref-01-g02-editorial-case-v0.1.json); [generatore in sola lettura](../../scripts/qualify_curr_ref_g02_editorial.py); [verifiche di conformità](../../tests/test_curr_ref_01_g02_editorial.py).

## Origine e catena pedagogica

```text
ARENA — CAN-CURR-MASTER-00@1.3 (PROVVISORIO / NON VIGENTE)
  └─ Tecnologia secondaria I, competenza locale candidata: «confrontare soluzioni»
      └─ Collegamento editoriale proposto, NON riferimento approvato
         DOCENTE OS — CAN-PLAN-1 → CAN-UDA-1-05 → B25
          └─ Obiettivo: confrontare alternative con criteri espliciti e motivare
              └─ Prodotto atteso: matrice di scelta motivata
                  ├─ Criterio proposto 1: processo / confronto
                  └─ Criterio proposto 2: argomentazione / motivazione
                     └─ Esempi simulati, non osservazioni individuali
                       → riesame docente (PENDING)
                         → eventuale uso nel Registro SOLO con contratto,
                           contesto e conferma autonoma, non in questa fase
```

La proiezione B25 è un contenuto didattico già approvato per il funzionamento di Docente OS, **non** un'approvazione del curricolo. Il master di Arena è ancora `PROVISIONAL_COMPLETE`, non vigente. Registro Docente può consultare un contesto di Arena provvisorio in anteprima, ma non trattarlo come autorevole quando il risolutore richiede `APPROVED` e `VIGENTE`.

### Un esempio osservativo — dichiaratamente fittizio

- **Criterio processo:** due soluzioni ipotetiche A e B sono confrontate secondo funzionalità, fattibilità, sicurezza e materiali, senza punteggi.
- **Criterio argomentazione:** una preferenza ipotetica per la soluzione A è giustificata richiamando un vincolo esplicito e la sicurezza; la sua pertinenza non è stata verificata su uno studente.

**Non si registrano osservazioni, identità individuali, giudizi di competenza, voti o conferme del docente.** Non si producono criteri o rubriche ufficiali. L'eventuale osservazione reale resta nell'archivio locale del Registro Docente, con revisione e decisione effettiva del docente.

## Esecuzione e confini tecnici

Dalla radice del repository:

```bash
python scripts/qualify_curr_ref_g02_editorial.py --surface EDITORIAL
python -m unittest discover -s tests -p 'test_curr_ref_01_g02_editorial.py'
```

Il programma legge la ricevuta G01 e la configurazione G02, verifica l'impronta Git **effettiva dei byte di G01**, le versioni e i riferimenti di origine, produce una rappresentazione in JSON e non modifica file o stato applicativo. Non effettua chiamate di rete e non legge archivi degli studenti. Le revisioni dei file dei prodotti sono fissate nella ricevuta precedente; **non** sono sincronizzate autonomamente con gli sviluppi futuri dei repository.

Rifiuta l'uso per superfici `PUBLIC` o `RUNTIME`, un cambio non riesaminato della ricevuta G01, una dichiarazione di vigenza o approvazione, evidenze individuali, collegamenti aggiunti senza motivazione e qualsiasi permesso di valutare, trasferire o pubblicare.

## Limite e prossimo avanzamento

**G02 non è un'integrazione tra applicazioni.** Dimostra soltanto che si può rappresentare la stessa sequenza pedagogica rispettando confini di provenienza e autorità. I criteri sono editoriali e devono essere riesaminati dal docente; non sono automaticamente trasferibili nel modello `AssessmentEvidenceV1` di Registro. Prima di un uso effettivo serve un progetto con consenso e destinatari espliciti, verifica dei contratti, qualificazione del master applicabile e collaudo nelle applicazioni.

**G03 — priorità proposta:** qualificare, nel perimetro di TRAMA e con dati non personali, un contratto semantico di *riferimento all'attività* che conservi versione, origine, obiettivo e criteri **senza trasportare le osservazioni individuali**. Il sistema di valutazione non deve essere duplicato.

E-R4 (validazione professionale del curricolo) prosegue in parallelo, senza certificazioni automatiche.
