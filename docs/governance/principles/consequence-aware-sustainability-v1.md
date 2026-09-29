# TRAMA Governance Principle — Consequence-Aware Sustainability v1

**Status:** PROPOSED  
**Origin:** CAP-ATLAS-PERCORSI G1  
**Scope candidate:** all TRAMA ecosystem capabilities and development practices  
**Runtime impact:** NONE

## Purpose

TRAMA is developed in an educational-institution context. Sustainability and responsibility must therefore shape not only educational content but also how capabilities are researched, designed, implemented, operated and evolved.

This principle preserves a simple governing idea: human and technical actions have consequences. Material consequences should be anticipated where reasonably possible, observed, measured when a sound method exists, prevented when avoidable, contained when prevention is incomplete, remediated when harm occurs, and eliminated at the source when feasible.

## Consequence chain

For each material capability decision, assess where applicable:

`ACTION → FORESEEABLE CONSEQUENCES → EVIDENCE/UNCERTAINTY → INDICATORS → PREVENTION → CONTAINMENT → REMEDIATION/REVERSIBILITY → ELIMINATION → RESIDUAL RISK`

The chain is analytical, not a claim that every consequence can be predicted or quantified.

## Proportionality

The analysis must be proportionate to the decision. It must not create documentation work whose cost exceeds its decision value.

A consequence is material when it can meaningfully affect one or more of:

- learners, especially minors or vulnerable users;
- privacy, safety, autonomy or accessibility;
- pedagogical quality and cognitive load;
- institutional/legal obligations;
- environmental/resource use;
- maintainability and operational burden;
- knowledge reuse and repeated computational work;
- third-party dependencies or external data flows.

## Knowledge preservation as sustainability

Repeatedly reconstructing an already-established analysis wastes human attention and computational work and increases the risk of inconsistent decisions.

Material reasoning should therefore be preserved in a compact, retrievable form using the chain:

`QUESTION → SOURCES → EVIDENCE → LIMITATIONS/UNCERTAINTY → INTERPRETATION → CONSEQUENCES → DECISION OR OPEN QUESTION → VERIFICATION → NEGATIVE KNOWLEDGE`

The goal is not to archive every conversation. The goal is to retain the minimum sufficient reasoning needed to understand why a material decision exists and to avoid unnecessary reconstruction.

## Measurement integrity

TRAMA must distinguish:

1. **directly measurable operational indicators**, such as duplicate research avoided, repeated external calls, transferred bytes, asset weight, build/deploy frequency, third-party requests, retained artefacts or avoidable regeneration;
2. **estimated environmental indicators**, which require a declared and defensible methodology;
3. **qualitative consequences**, which may be important even when they cannot be reduced to a trustworthy number.

No environmental quantity (for example CO2e, energy or water) may be presented as measured or saved solely by inference from reduced prompts, tokens or requests unless an adequate methodology and system boundary are documented.

Uncertainty must be recorded rather than replaced by false precision.

## Prevention hierarchy

When a material adverse consequence is identified, prefer in order:

1. eliminate the unnecessary action or dependency;
2. prevent the consequence by design;
3. reduce/minimise exposure or resource use;
4. contain the consequence;
5. provide recovery, reversal or remediation;
6. monitor residual risk and revisit when evidence changes.

Mitigation is not a substitute for avoiding an unnecessary harmful action.

## G1/G2 integration candidate

If adopted into the Capability Lifecycle, the following questions become explicit at discovery/governance for material decisions:

- What consequences are reasonably foreseeable?
- Who or what bears them?
- Which consequences are supported by evidence and which remain uncertain?
- What can be prevented before implementation?
- What can be measured directly without creating disproportionate telemetry or privacy risk?
- What can be reversed or repaired?
- What unnecessary resource use or repeated work can be eliminated?
- Does the proposed measurement itself create data, privacy, cognitive or environmental costs?

## Child-facing capabilities

For capabilities used by minors, consequence analysis must include at least:

- disclosure/data consequences;
- attention and cognitive-load consequences;
- accessibility/inclusion consequences;
- behavioural/manipulative engagement risks;
- consequences of imagery, motion, sound and interaction density;
- consequences of third-party services and outbound links;
- consequences of retaining or exporting personal artefacts.

The absence of personal-data collection is preferred to telemetry introduced merely to measure sustainability or engagement.

## Sustainable interface and asset direction

Where equivalent educational value is achievable, prefer designs that reduce unnecessary:

- decorative media and animation;
- oversized or repeatedly downloaded assets;
- third-party scripts and network requests;
- auto-playing media;
- computation whose only purpose is attention capture;
- duplicated generated content;
- regeneration of artefacts already available and valid.

This is subordinate to pedagogy and accessibility: smaller or cheaper is not automatically better if it reduces comprehension, inclusion or learning value.

## Negative knowledge

### NK-SUS-001 — Sustainability by declaration
Do not call a capability sustainable merely because sustainability is stated as a value. Require observable design/operational implications.

### NK-SUS-002 — Archive everything
Do not retain every intermediate conversation or artefact indiscriminately. Excess storage and information noise undermine reuse. Preserve decision-relevant reasoning.

### NK-SUS-003 — False environmental precision
Do not translate token/request reductions into exact CO2e, energy or water savings without a defensible methodology and declared boundary.

### NK-SUS-004 — Mitigate what could be avoided
Do not default to compensating for an avoidable consequence when the unnecessary action can be removed or redesigned.

### NK-SUS-005 — Telemetry for its own sake
Do not introduce user tracking or personal-data collection merely to produce sustainability or engagement metrics.

## Adoption path

This document is a **candidate cross-cutting governance principle** derived from the Atlas Percorsi pilot. It does not modify the already-adopted Capability Lifecycle by itself.

Before canonical adoption it requires:

- comparison with existing TRAMA governance and Knowledge Foundation rules;
- independent review for proportionality and unintended bureaucracy;
- confirmation that measurement requirements cannot justify new student tracking;
- explicit human approval;
- a separate governed lifecycle update if adopted ecosystem-wide.
