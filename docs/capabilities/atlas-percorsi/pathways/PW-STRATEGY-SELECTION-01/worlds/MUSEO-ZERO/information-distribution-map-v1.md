# MUSEO ZERO — Information Distribution Map v1

**Status:** DESIGN_CANDIDATE / HUMAN_PRODUCT_REVIEW_REQUIRED  
**Runtime:** NOT_RUNTIME_AUTHORIZED

## 1. Rule

No single character, panel or location contains the complete explanation.

The learner must combine **environment + artefacts + people + simulation**.

## 2. Information inventory

| Information | Where it lives | Carrier type | Initially visible? |
|---|---|---|---|
| route was reversed | Ingresso + Lia | environment + character | partially |
| why route changed | accessibility clearance + Lia | visual trace + character | inspectable |
| Sensor B moved to new entry | Sala Zero + Omar + setup tag | object + character + artefact | inspectable |
| old Sensor A logic still active | Cabina regia cue mapping | system state | inspectable |
| projection starts late | failed rehearsal recording | world/event | immediately observable |
| sound cue follows projection late | failed rehearsal recording + Teo log | event + artefact | observable |
| physical move happened before final test | setup tag timestamp | artefact | inspectable |
| mapping was not updated after move | inferred by combining move + active mapping | learner inference | not stated directly |
| option constraints | route map, crew notes, control state | distributed | later relevant |

## 3. Character knowledge boundaries

### Lia
Knows:
- spatial reason for route change;
- new visitor entry.

Does not know:
- which cue trigger is active.

### Omar
Knows:
- Sensor B was physically moved;
- hardware tested locally.

Does not know:
- exact cue configuration in regia.

### Teo
Knows:
- current cue mapping;
- what rehearsal looked like.

Does not know:
- full reason for spatial reroute.

## 4. Environmental clues

The world itself should carry:
- old route arrow partly covered;
- new accessible path marking;
- physical sensor plate at new entry;
- unused/old trigger marker;
- projection preview starting visibly late;
- timing trace.

These clues reduce dependence on text dialogue.

## 5. Progressive relevance

Information is not “locked because level 2”.

It becomes relevant because the question changes.

### Chronology question
Useful:
- timestamps;
- change notes;
- character memory.

### Causality question
Useful:
- cue mapping;
- physical sensor location;
- simulation.

### Decision question
Useful:
- recovery times;
- reliability;
- visitor accessibility;
- operational complexity.

## 6. Anti-spoon-feeding rule

No dialogue line may state the full causal answer:

> “The sensor was moved but the software still points to the old trigger, therefore projection starts late.”

That conclusion must be constructed from distributed evidence.

## 7. Uncertainty

At least one plausible but non-causal change should exist, for example:
- projection artwork file changed earlier;
- sound volume adjusted.

These should be real changes but not the cause of the sync failure.

This prevents chronology from collapsing into “latest change = cause”.
