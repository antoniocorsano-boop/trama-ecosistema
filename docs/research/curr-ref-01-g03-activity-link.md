# CURR-REF-01/G03 — Riferimento semantico riutilizzabile fra attività, curricolo e criteri

**Data:** 20 novembre 2026 · **Stato:** candidato editoriale verificabile, non importabile e non pubblicabile.

**Prodotto di lavoro:** [configurazione G03](curr-ref-01-g03-activity-link-v0.1.json) · [validatore/proiezione](../../scripts/qualify_curr_ref_g03_link.py) · [prove avversariali](../../tests/test_curr_ref_01_g03_link.py). Il prototipo dipende dalla [proiezione G02](curr-ref-01-g02-editorial-case-v0.1.json) e dalla [ricevuta di origine G01](curr-ref-01-g01-uda-valutazione.json), senza duplicarne i testi.

## Decisione di progettazione

**Non creare un nuovo identificativo canonico della lezione.** In Docente OS esistono `CAN-PLAN-1`, `CAN-UDA-1-05`, il blocco `B25` e la proiezione `HTC-PRIMA-B25-PLAN-v1`; in Registro Docente il tipo `AssessmentDefinitionRevision.source` conserva già `{kind: 'explicit-activity', activityId}`. Il campo `activityId` da solo, tuttavia, non attesta né provenienza, né classe, né versione, né autorizzazione al trattamento. Non usarlo per un import automatico; l'identità dell'attività è un insieme verificato di riferimenti e di versione della fonte.

**Non fabbricare revisioni confermate di criteri o obiettivi.** Registro Docente richiede `confirmedByTeacher`, `confirmedAt` e riferimenti alle revisioni locali in `AssessmentEvidenceV1`; queste condizioni non sono ricavabili da una UdA, da un esito di prove automatiche o dal master curricolare provvisorio. Le due descrizioni `CR-G01-01` e `CR-G01-02` restano **proposte** di osservazione, non `criterionRevisionId` utilizzabili dal Registro.

## Catena concreta

| Autorità/ambiente | Identificativo verificato | Valore |
| --- | --- | --- |
| Arena | Master 1.3, impronta `b355be71` | Fonte provvisoria, non vigente |
| Arena | `secondaria-di-primo-grado-tecnologia-classe-i` / sezione 7.3.8 | Competenza locale candidata «confrontare soluzioni» |
| Docente OS | `CAN-PLAN-1` / `CAN-UDA-1-05` / `B25` | Collocazione e attività didattica |
| Docente OS | `HTC-PRIMA-B25-PLAN-v1` | Proiezione didattica approvata, non autorizzazione curricolare |
| TRAMA | `CR-G01-01` e `CR-G01-02` | Criteri proposti: processo e argomentazione |
| Registro Docente | Contratto locale `AssessmentEvidenceV1` | Destinatario potenziale futuro, **non integrato** |

La proiezione contiene un riferimento alla fonte dell'attività (inclusa l'impronta Git), al contesto di annualità e di regime e al candidato curricolare, mantenendo la distinzione fra progetto didattico, criterio proposto e osservazione effettiva. Non espone schede studente, identificativi di classe, osservazioni, voti, livelli o conferme attribuite al docente.

## Comando di verifica

Dalla radice del repository TRAMA:

```bash
python scripts/qualify_curr_ref_g03_link.py --surface EDITORIAL
python -m unittest discover -s tests -p 'test_curr_ref_01_g03_link.py'
```

Il comando produce solo una proiezione JSON in uscita standard e non scrive file, non contatta altri prodotti, non interroga archivi e non acquisisce dati personali. Gli ingressi sono una configurazione validata e le ricevute G01/G02 versionate; viene verificata l'effettiva impronta dei byte della G02 e sono confrontati il riferimento all'attività, classe, anno, regime, fonte, stato del master e criteri. In presenza di revisione non riconciliata la trasformazione viene **bloccata**, anziché utilizzare un riferimento scaduto.

Il programma rifiuta espressamente la superficie `PUBLIC` o `RUNTIME`, l'uso come registrazione di valutazione, le approvazioni sintetiche e l'aggiunta di campi personali. Il formato è riutilizzabile come **modello di collegamento editoriale**: nuove attività richiedono proprie ricevute verificate e la mappatura dei riferimenti, non la sostituzione di dati e stringhe in questa prova.

## Esito e passaggio successivo

**G03 dimostra un collegamento di riferimento non personale, non un flusso fra applicazioni.** Per passare all'uso in classe servono:
- una funzione esplicita nel prodotto che presenta al docente le attività e gli obiettivi, con identificativi e versioni effettivi;
- revisione e selezione dei criteri da parte del docente, che crea **solo allora** le revisioni richieste nel Registro;
- una separata decisione sul contratto e sul perimetro dei dati trasferiti; nessuna trasmissione di evidenze individuali a TRAMA, Arena, Docente OS o Atlas;
- validazione professionale e istituzionale del curricolo nel procedimento E-R4 di Arena prima di attribuire vigenza.

**Prossima priorità: G04 — collaudo nel prodotto del riferimento all'attività**, non un'ulteriore architettura astratta. Verificare prima consumatori esistenti, compatibilità mobile, conferma docente e sicurezza senza interferire con la linea documentale/valutativa di Registro Docente già in corso.
