# Evidence Register — ATLAS-PERCHÉ-01

**Artifact:** ATLAS-PERCHÉ-01  
**Data registro:** 2026-09-23  
**Standard:** TRAMA-EVIDENCE-01  
**Ruolo:** canary di adozione dello standard dopo l'integrazione della PR #59.  
**Scopo:** separare fonti scientifiche, contesto istituzionale e prove di verifica dalla baseline progettuale.

## Registro fonti

| ID | Tipo | Fonte | Autorità / editore | Data/versione | Ambito | Forza | Claim supportato | Applicabilità | Localizzatore | Verificato | Reviewer | Stato | Note / limiti |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCI-AP-01 | SCI | *Metacognition and Self-Regulated Learning* | Education Endowment Foundation | 2nd ed., 2025 | scuola / metacognizione | evidence-informed guidance | pianificazione, monitoraggio, valutazione; integrazione nel curricolo | diretta come base generale, non specifica Atlas | https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition | 2026-09-23 | independent pedagogical review | VERIFIED | non dimostra efficacia causale degli archetipi Atlas |
| SCI-AP-02 | SCI | *See, Think, Wonder*; *What Makes You Say That?* | Project Zero, Harvard Graduate School of Education | pagina corrente | thinking routines | educational practice reference | osservazione, interpretazione, curiosità, reasoning basato su evidenze | adattata | https://pz.harvard.edu/resources/see-think-wonder ; https://pz.harvard.edu/resources/what-makes-you-say | 2026-09-23 | independent pedagogical review | VERIFIED | fonte di pratica; non prova causale del programma Atlas |
| SCI-AP-03 | SCI | Question Formulation Technique (QFT) | Right Question Institute | pagina corrente | formulazione delle domande | educational practice reference | produrre, trasformare, prioritizzare e usare domande | adattata | https://rightquestion.org/faq/ | 2026-09-23 | independent pedagogical review | VERIFIED | dipendente da implementazione e contesto |
| SCI-AP-04 | SCI | *A Framework for K–12 Science Education* | National Research Council / National Academies | 2012 | pratiche scientifiche K–12 | consensus framework | asking questions, investigations, data, explanations, argument from evidence, information evaluation | diretta come framework; adattata oltre scienze | https://nap.nationalacademies.org/resource/13165/reportbrief.html | 2026-09-23 | independent pedagogical review | VERIFIED | non autorizza trasferimento automatico a ogni disciplina |
| SCI-AP-05 | SCI | Brain-building through play / executive-function activity guides | Center on the Developing Child, Harvard University | pagina corrente | prima infanzia / funzioni esecutive | research-informed guidance | gioco e pratica come supporto ad attenzione, memoria di lavoro, flessibilità, autoregolazione | adattata | https://developingchild.harvard.edu/resources/handouts-tools/brainbuildingthroughplay/ | 2026-09-23 | independent pedagogical review | VERIFIED | non attribuire effetti specifici a un singolo pilot Atlas |
| SCI-AP-06 | SCI | Dialogic Teaching; Philosophy for Children evaluations | Education Endowment Foundation | progetti/evaluation pages | dialogo strutturato | trial/evaluation evidence | dialogo, ragionamento e discussione strutturata | context-dependent | https://educationendowmentfoundation.org.uk/projects-and-evaluation/projects/dialogic-teaching ; https://educationendowmentfoundation.org.uk/projects-and-evaluation/projects/philosophy-for-children | 2026-09-23 | independent pedagogical review | VERIFIED | esiti e trasferibilità da riportare con cautela |
| POL-IT-AP-01 | POL | D.M. 9 dicembre 2025, n. 221 — Indicazioni nazionali per infanzia e primo ciclo | Ministero dell'Istruzione e del Merito / Gazzetta Ufficiale | 2025; in vigore 2026 | scuola italiana 3–14 | institutional/normative curriculum context | curiosità, osservazione, problem solving, ipotesi, argomentazione, pensiero critico e fonti nel quadro curricolare | contestuale; binding effettivo gestito da Arena | https://www.gazzettaufficiale.it/atto/serie_generale/caricaDettaglioAtto/originario?atto.codiceRedazionale=26G00021&atto.dataPubblicazioneGazzetta=2026-01-27&elenco30giorni=true | 2026-09-23 | independent normative-context review | VERIFIED | non sostituisce il binding curricolare Arena |
| STD-AP-01 | STD | Web Content Accessibility Guidelines (WCAG) 2.2 | W3C | Recommendation | accessibilità web | technical standard | target AA e criteri verificabili per superfici Atlas | diretta alle superfici web controllabili | https://www.w3.org/TR/WCAG22/ | 2026-09-23 | independent accessibility-context review | VERIFIED | conformità da verificare su contenuti e journey reali |

## Evidence IDs di verifica TRAMA

| ID | Tipo | Evidenza | Oggetto | Stato |
| --- | --- | --- | --- | --- |
| EVD-AP-01 | EVD | review indipendente PR #60 su exact head `0a7c1fb3d4c60ee2ff02c51c19ed93030e3bc722` | review pedagogica/epistemologica pre-standard | HISTORICAL / PASS_WITH_REQUIRED_CLARIFICATIONS |
| EVD-AP-02 | EVD | recepimento C1-C5 nella stessa branch prima dell'adozione TRAMA-EVIDENCE-01 | livelli evidenza, pilot, licenze, progressione, valutazione | HISTORICAL / IMPLEMENTED |
| EVD-AP-CURRENT-GOV | EVD | ricevuta esterna GitHub Governance sullo SHA candidato corrente | coerenza repository/governance | PENDING |
| EVD-AP-CURRENT-REVIEW | EVD | review indipendente sullo SHA candidato corrente | integrità scientifica/normativa/evidence traceability | PENDING |

## Distinzione E1 / E2 / E3

- **E1**: evidenza consolidata o guidance evidence-informed utile come base generale;
- **E2**: pratica sostenuta da ricerca ma dipendente da implementazione e contesto;
- **E3**: pattern progettuale Atlas da validare empiricamente.

Nessuna fonte E1 o E2 trasforma automaticamente un pattern E3 in intervento “evidence-based”.

## Gap correnti

1. Gli archetipi A1-A12 e la progressione 3–14 sono E3 e richiedono pilot.
2. L'efficacia causale del programma non è dimostrata né rivendicata.
3. La trasferibilità cross-discipline di alcuni framework resta da validare.
4. Rights/accessibility devono essere verificati sugli asset e journey concreti.
5. ActivityPackage v1 resta contratto sperimentale e non runtime.
6. Il binding curricolare effettivo resta responsabilità Arena.

