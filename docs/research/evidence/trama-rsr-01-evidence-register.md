# Evidence Register — TRAMA-RSR-01

**Artifact:** TRAMA-RSR-01  
**Data registro:** 2026-09-23  
**Standard:** TRAMA-EVIDENCE-01  
**Scopo:** separare le fonti e le prove dal documento interpretativo principale.

## Registro fonti

| ID | Tipo | Fonte | Autorità / editore | Data/versione | Ambito | Forza | Claim supportato | Applicabilità | Localizzatore | Verificato | Reviewer | Stato | Note / limiti |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCI-01 | SCI | *Generative Artificial Intelligence and Language Teaching* | Cambridge University Press & Assessment; Moorhouse & Wong | 2025 | insegnamento linguistico / formazione docente | research evidence | P-GenAI-C; pianificazione/materiali; verifica output; etica; sviluppo professionale | diretta nel dominio linguistico, adattata altrove | DOI 10.1017/9781009618823 | 2026-09-23 | independent scientific review | VERIFIED | trasferibilità cross-discipline marcata ADAPTED |
| SCI-02 | SCI | *Developing language teachers’ professional generative AI competence* | *System*; Moorhouse et al. | 2024, vol. 125, 103399 | formazione iniziale docenti di lingua | peer-reviewed research | sviluppo e articolazione della competenza professionale GenAI | diretta per P-GenAI-C, adattata per TRAMA | DOI 10.1016/j.system.2024.103399 | 2026-09-23 | independent scientific review | VERIFIED | non costituisce certificazione individuale dei docenti |
| POL-IT-01 | POL | *Linee guida per l’introduzione dell’Intelligenza Artificiale nelle Istituzioni scolastiche* | Ministero dell’Istruzione e del Merito | versione 1.0, 2025; DM 166/2025 | istituzioni scolastiche italiane | institutional guidance | governance scolastica, introduzione sicura/inclusiva dell’IA, responsabilità e coinvolgimento comunità | diretta nel contesto scolastico italiano | https://www.mim.gov.it/documents/20182/0/MIM_Linee%2Bguida%2BIA%2Bnella%2BScuola_09_08_2025-signed.pdf/b70fdc45-4b75-1f7e-73bf-eab12989b928 | 2026-09-23 | independent normative-context review | VERIFIED | guidance istituzionale; non equivalente a legge |
| POL-EU-01 | POL | *Orientamenti sull’uso etico dell’intelligenza artificiale e dei dati nell’insegnamento e nell’apprendimento* | Commissione europea / European Education Area | aggiornamento 2026 | educatori scuola primaria e secondaria UE | institutional guidance | uso etico, decisioni contestuali, AI Act, GDPR, alfabetizzazione critica | diretta come guidance per educatori UE | https://education.ec.europa.eu/it/focus-topics/digital-education/actions/plan/ethical-guidelines-for-educators-on-using-artificial-intelligence | 2026-09-23 | independent normative-context review | VERIFIED | orientamento; non certifica conformità AI Act/GDPR |
| AUTH-IT-01 | AUTH | *La scuola a prova di privacy* / sezione Scuola | Garante per la protezione dei dati personali | versione corrente verificata 2026 | scuole italiane, studenti, famiglie, personale | authority guidance | protezione dati personali a scuola e nuovi strumenti IA | diretta per privacy; verificare atti specifici per casi di trattamento ad alto rischio | https://www.garanteprivacy.it/scuola | 2026-09-23 | independent normative-context review | VERIFIED | verificare provvedimenti specifici nel caso concreto |
| LAW-EU-01 | LAW | Regolamento (UE) 2016/679 — GDPR | Unione europea | vigente | trattamento dati personali UE | binding law | liceità, minimizzazione, trasparenza, diritti, protezione dati | applicabile quando TRAMA tratta dati personali | https://eur-lex.europa.eu/eli/reg/2016/679/oj | 2026-09-23 | independent normative-context review | VERIFIED | applicabilità requisito-per-requisito da valutare nel caso concreto |
| LAW-EU-02 | LAW | Regolamento (UE) 2024/1689 — AI Act | Unione europea | entrata in vigore 2024, applicazione per fasi | sistemi e pratiche IA nell’UE | binding law | obblighi/rischi IA applicabili secondo ruolo, sistema e caso d’uso | contestuale; richiede classificazione del caso concreto | https://eur-lex.europa.eu/eli/reg/2024/1689/oj | 2026-09-23 | independent normative-context review | VERIFIED | nessuna classificazione di conformità complessiva implicita |
| INT-01 | INT | *Guidance for Generative AI in Education and Research* | UNESCO | 2023, aggiornamento pagina 2026 | istruzione e ricerca internazionale | international guidance | approccio human-centred, privacy, età, validazione pedagogica/etica | orientativa, non cogente | https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research | 2026-09-23 | independent scientific/normative-context review | VERIFIED | non cogente |
| STD-01 | STD | ISO/IEC 42001:2023 | ISO/IEC | 2023 | sistemi di gestione IA | voluntary international standard | tracciabilità, trasparenza, gestione continua di rischi/opportunità | metodologica; nessuna certificazione TRAMA dichiarata | https://www.iso.org/standard/42001 | 2026-09-23 | independent method review | VERIFIED | riferimento metodologico; nessuna certificazione |
| STD-02 | STD | AI Risk Management Framework 1.0 + GenAI Profile | NIST | 2023 / 2024; RMF in revisione nel 2026 | gestione rischio IA | voluntary framework | govern/map/measure/manage; documentazione requisiti e TEVV | metodologica; non normativa in Italia | https://www.nist.gov/itl/ai-risk-management-framework | 2026-09-23 | independent method review | VERIFIED | framework volontario; non normativa italiana |

## Evidence IDs di verifica TRAMA

| ID | Tipo | Evidenza | Oggetto | Stato |
| --- | --- | --- | --- | --- |
| EVD-01 | EVD | PR #59, independent scientific review su exact head `59d50f7d3f17affaf31ff04b5b8c45bb78564124` | fedeltà fonte + contesto istituzionale | HISTORICAL / CHANGES_REQUIRED |
| EVD-02 | EVD | Governance workflow run `35870343110` su exact head `9e894e5be0aa18d69cd84bb84390c992d74533cf` | coerenza repository / governance automatica | HISTORICAL / PASS |
| EVD-03 | EVD | `docs/assurance/trama-evidence-01.md` | standard di tracciabilità e separazione evidence pack | PROPOSED |
| EVD-04 | EVD | PR #59, independent scientific/normative traceability review su exact head `9e894e5be0aa18d69cd84bb84390c992d74533cf` | chiusura rilievi scientifici + integrità evidence system | HISTORICAL / CHANGES_REQUIRED |
| EVD-CURRENT-GOV | EVD | ricevuta esterna GitHub Governance sullo SHA candidato corrente | coerenza repository / governance automatica | PENDING |
| EVD-CURRENT-REVIEW | EVD | ricevuta esterna di review indipendente sullo SHA candidato corrente | scientific/normative/evidence integrity | PENDING |

## Distinzione di autorità

Le fonti non sono intercambiabili:

- **SCI-***: supportano affermazioni scientifiche o professionali; non creano obblighi giuridici.
- **LAW-***: possono creare obblighi cogenti se applicabili al caso concreto.
- **AUTH-***: esprimono indicazioni/provvedimenti dell’autorità competente nel proprio perimetro.
- **POL-***: orientano governance e pratica istituzionale; la loro forza va letta nel contesto dell’atto.
- **INT-***: forniscono orientamento internazionale non cogente.
- **STD-***: descrivono standard o framework volontari, salvo adozione contrattuale o organizzativa separata.
- **EVD-***: dimostrano ciò che TRAMA ha effettivamente verificato; non sostituiscono le fonti.

## Gap correnti

1. La derivazione P-GenAI-C cross-discipline deve restare marcata `ADAPTED`.
2. RSR-E “Proportional AI” è una `DESIGN_RULE` TRAMA, non un risultato scientifico diretto.
3. Nessuna affermazione di conformità completa a GDPR/AI Act è autorizzata da questo registro.
4. Gli usi learner-level di IA richiedono analisi separata per età, privacy, ruolo istituzionale e tipo di trattamento.
5. L’eventuale uso dell’IA su elaborati individuali degli studenti richiede un distinto evidence pack e una distinta decisione di governance.

