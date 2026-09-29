# CAP-ATLAS-PERCORSI — Decision Rationale: Sustainability, Consequences and Knowledge Reuse

**Gate:** G1 — Discovery  
**Status:** WORKING_GOVERNANCE_PRINCIPLE  
**Scope:** Atlas Percorsi; candidate reusable TRAMA principle

## Why this document exists

Research interpretation and design reasoning are durable project knowledge. If only final decisions are stored, later work must reconstruct the same chain of reasoning, repeat searches and analyses, consume additional human and computational resources, and increase the risk of inconsistent conclusions.

For a school institution, sustainability is not only content to teach. It should also shape how digital systems are researched, designed, developed, operated and maintained.

## Core principle — consequences are design objects

Every material human or automated action in the lifecycle can have consequences. TRAMA should therefore seek, where reasonably possible, to make relevant consequences:

1. **foreseeable** — identify plausible effects before acting;
2. **observable** — know whether the effect occurred;
3. **measurable** — use an appropriate indicator where measurement is meaningful and proportionate;
4. **preventable** — prefer avoiding unnecessary impact at source;
5. **reducible/containable** — limit magnitude, duration, propagation and recurrence;
6. **reversible/remediable** — provide rollback, deletion, correction or recovery where feasible;
7. **eliminable** — remove unnecessary harmful causes rather than normalising mitigation forever;
8. **reviewable** — retain enough evidence to understand why an action was taken and what was learned.

Not every consequence is fully predictable or quantifiable. Uncertainty must be recorded rather than converted into false precision.

## Evidence basis

### SUST-001 — UNESCO: responsible and efficient AI
UNESCO's current AI ethics/governance guidance calls for recognising, assessing and mitigating environmental impacts across the full AI lifecycle, including energy, water, materials, infrastructure and end-of-life effects. It also frames public institutions as actors that can institutionalise measurement and mitigation.
Reference: https://www.unesco.org/ethics-ai/en/advancing-responsible-efficient-ai
**Implication:** computational/environmental impact belongs in governance, not only procurement or infrastructure operations.

### SUST-002 — UNESCO: whole-institution sustainability in education
UNESCO's 2026 whole-institution approach to Education for Sustainable Development treats sustainability as something to embed across teaching/learning, governance, operations, community engagement and organisational culture.
Reference: https://www.unesco.org/en/articles/driving-sustainability-education-through-whole-institution-approach
**Implication:** a school digital ecosystem should seek coherence between what it teaches about responsibility and how it operates.

### SUST-003 — EU ICT environmental impact
European Commission/Interoperable Europe materials describe ICT as having both sustainability benefits and material environmental impacts and stress measurement, transparency and governance. Methodologies are still heterogeneous, so environmental claims require caution.
Reference: https://interoperable-europe.ec.europa.eu/collection/rolling-plan-ict-standardisation/ict-environmental-impact-rp-2026
**Implication:** avoid unsupported claims such as assigning a precise carbon value to an individual prompt without suitable measurement data; use operational proxies until trustworthy measurements exist.

### SUST-004 — European Declaration on Digital Rights and Principles
The sustainability chapter states that digital products and services should mitigate negative environmental and social impacts and that people should have understandable information supporting responsible choices.
Reference: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32023C0123(01)
**Implication:** sustainability and transparency are legitimate design criteria for public digital services.

## Knowledge-reuse rule

For every substantial research/design cycle, preserve not only the result but the minimum sufficient reasoning package:

`QUESTION → SOURCES → EVIDENCE → LIMITATIONS/UNCERTAINTY → INTERPRETATION → CONSEQUENCE → DECISION/OPEN QUESTION → VALIDATION → NEGATIVE KNOWLEDGE`

The objective is not to archive every chat token. The objective is to store the smallest durable representation that prevents needless reconstruction while remaining inspectable.

## Documentation hierarchy

- **Evidence register:** what external evidence says, with population/context and limitations.
- **Rationale document:** how evidence and institutional values are interpreted for the capability.
- **Decision/specification/ADR:** what has actually been authorised.
- **Negative knowledge:** what was rejected or shown not to work, and why.
- **Validation record:** what was tested and with what outcome.

A later agent or human should be able to recover the reasoning without replaying the original conversation.

## Resource-conscious research and AI use

Candidate operational rules:

- retrieve existing governed knowledge before repeating external research;
- update existing evidence records rather than creating parallel summaries;
- search incrementally: answer the unresolved question, not the whole domain again;
- prefer authoritative primary sources and high-quality syntheses to large undifferentiated source collections;
- cache durable conclusions with freshness/review dates;
- record failed/rejected approaches so they are not regenerated;
- avoid repeated model calls whose only purpose is reformatting already-governed information;
- use the least computationally intensive adequate method for the task when the choice is material and known;
- do not claim environmental savings that have not been measured.

## Consequence ledger template

For material capability decisions, record when applicable:

| Field | Meaning |
| --- | --- |
| Action/decision | What is proposed or performed |
| Intended benefit | Why it is needed |
| Affected parties/systems | Who/what may be affected |
| Plausible positive consequences | Expected benefits |
| Plausible adverse consequences | Safety, pedagogical, privacy, accessibility, environmental, operational or social effects |
| Evidence/confidence | What supports the forecast and how certain it is |
| Indicator | What can be observed/measured proportionately |
| Prevention | How unnecessary impact is avoided |
| Containment/mitigation | How residual impact is limited |
| Reversibility/remediation | How to undo/correct/recover |
| Elimination condition | When the harmful cause should be removed entirely |
| Residual uncertainty | What remains unknown |
| Review trigger | What new evidence/event requires reassessment |

This ledger is proportionate: trivial reversible changes do not require bureaucracy equivalent to high-impact decisions.

## Application to Atlas Percorsi

The principle applies directly to:

- child attention and cognitive load;
- privacy and disclosure surfaces;
- accessibility and exclusion risk;
- narrative/manipulation risk;
- third-party services and network calls;
- local storage/export/reset;
- asset weight, animation and unnecessary data transfer;
- AI-assisted content/research generation;
- repeated research and documentation work.

For example, a visually rich scene must be evaluated not only for attractiveness but for learning value, distraction risk, accessibility, transfer/data cost and whether a simpler representation provides the same pedagogical benefit.

## Measurement without false precision

Environmental impact measurement at individual interaction level is often provider-, hardware-, location- and workload-dependent. Until trustworthy telemetry or vendor disclosures support a metric, TRAMA should distinguish:

- **direct measurements** — measured values with method/source;
- **provider-reported metrics** — attributed and scoped;
- **operational proxies** — e.g. number of repeated research cycles avoided, asset bytes transferred, third-party calls, model calls by task class;
- **qualitative risk** — when reliable quantification is unavailable.

Proxy reduction is useful operational evidence but must not be presented as an exact carbon/water saving.

## Candidate lifecycle extension

For capabilities with material digital/AI/resource impact, add a cross-cutting `SUSTAINABILITY & CONSEQUENCE` review rather than a one-time terminal check. At each gate ask:

- what new consequences become possible at this gate?;
- can they be avoided by design?;
- what must be measured later?;
- what must remain reversible?;
- what knowledge should be persisted now to avoid future reconstruction?

## Negative knowledge

### NK-SUST-001 — Sustainability as communication only
Reject treating sustainability solely as curriculum content, branding or a final compliance paragraph.

### NK-SUST-002 — Archive everything
Reject indiscriminate storage of every intermediate token/output. Excess documentation creates its own retrieval, maintenance and resource cost. Preserve decision-relevant knowledge with traceability.

### NK-SUST-003 — Unverified per-prompt footprint claims
Reject precise energy/carbon/water claims for individual AI interactions unless supported by an appropriate measurement method and scoped data.

### NK-SUST-004 — Mitigation before prevention
Reject designing an avoidable harmful process and relying first on later compensation. Prefer prevention, then reduction/containment, remediation and only then treatment of unavoidable residual impact.

## Current status

This document preserves the reasoning as G1 project knowledge. It does not yet amend the canonical Capability Lifecycle. Reuse across TRAMA should be proposed and reviewed as a governance change after the principle is tested against Atlas Percorsi.