# Evidence Register — R4-P2 Professional Practice

**Artifact:** TRAMA-DOS-PP-01 / R4-P2  
**Data registro:** 2026-09-23  
**Standard:** TRAMA-EVIDENCE-01  
**Scopo:** separare fonti scientifiche/professionali, contesto istituzionale e prove di verifica dalla specifica di Professional Practice.

## Registro fonti

| ID | Tipo | Fonte | Autorità / editore | Data/versione | Ambito | Forza | Claim supportato | Applicabilità | Localizzatore | Verificato | Reviewer | Stato | Note / limiti |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SCI-PP-01 | SCI | *Generative Artificial Intelligence and Language Teaching* | Moorhouse & Wong / Cambridge University Press & Assessment | 2025 | competenza professionale docente e GenAI, dominio linguistico | research evidence | IA come supporto professionale, verifica, sviluppo professionale continuo, controllo docente | ADAPTED fuori dal dominio linguistico | DOI 10.1017/9781009618823 | 2026-09-23 | independent scientific review via TRAMA-RSR-01 | VERIFIED / ADAPTED | non autorizza runtime né valutazione automatica |
| SCI-PP-02 | SCI | *AI and Teacher Professional Development*, cap. 9 di *Teaching with AI* | Med Kharbach / Educators Technology | 2026 | sviluppo professionale docente con IA | research-informed professional guidance | riflessione professionale, personal learning assistant, knowledge system, microteaching e sviluppo continuo | ADAPTED / PRACTICE-ORIENTED | https://medkharbach.com/teaching-with-ai/ | 2026-09-23 | independent source check | PARTIAL | fonte professionale research-informed; non trattata come prova causale peer-reviewed |
| POL-IT-PP-01 | POL | Linee guida per l'introduzione dell'IA nelle istituzioni scolastiche | Ministero dell'Istruzione e del Merito | 2025, DM 166/2025 | scuole italiane | institutional guidance | responsabilità, governance, uso sicuro/inclusivo dell'IA | CONTEXTUAL | https://www.mim.gov.it/documents/20182/0/MIM_Linee%2Bguida%2BIA%2Bnella%2BScuola_09_08_2025-signed.pdf/b70fdc45-4b75-1f7e-73bf-eab12989b928 | 2026-09-23 | independent normative-context review via TRAMA-RSR-01 | VERIFIED | guidance istituzionale; non equivale a legge |
| EVD-PP-CURRENT-GOV | EVD | ricevuta esterna Governance sullo SHA candidato corrente | GitHub Actions | current exact head | repository/governance | automated evidence | coerenza repository e gate di governance | DIRECT | external receipt | post-commit | automated | PENDING | non va copiata in commit dopo il PASS |
| EVD-PP-CURRENT-REVIEW | EVD | review indipendente exact-head | TRAMA review | current exact head | scientific/evidence/product integrity | independent review | chiusura dei gap scientifici e di governance | DIRECT | external receipt | post-commit | independent reviewer | PENDING | ricevuta esterna secondo TRAMA-EVIDENCE-01 |

## Limiti interpretativi

- La fonte Kharbach è usata come **professional/research-informed guidance**, non come prova di efficacia causale.
- La fonte Cambridge riguarda principalmente l'insegnamento linguistico; il trasferimento a Professional Practice è marcato **ADAPTED**.
- Le capacità IA di R4-P2 restano advisory-only e richiedono un gate distinto prima di qualunque runtime.
- Nessuna fonte autorizza valutazione automatica del docente, diagnosi sugli studenti o scritture professionali silenziose.
