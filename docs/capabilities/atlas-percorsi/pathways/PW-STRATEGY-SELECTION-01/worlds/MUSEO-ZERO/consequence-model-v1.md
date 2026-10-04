# MUSEO ZERO — Consequence Model v1

**Status:** DESIGN_CANDIDATE / HUMAN_PRODUCT_REVIEW_REQUIRED  
**Runtime:** NOT_RUNTIME_AUTHORIZED

## 1. World state variables

Minimal state model:

- `visitorRoute`: OLD | NEW
- `physicalSensor`: A_OLD_ENTRY | B_NEW_ENTRY
- `activeCueTrigger`: SENSOR_A | SENSOR_B | MANUAL
- `projectionSync`: ON_TIME | LATE
- `soundSync`: ON_TIME | LATE
- `exitLightSync`: ON_TIME | LATE
- `accessibilityClear`: YES | NO
- `rehearsalState`: FAILED | PARTIAL | READY

## 2. Initial world state

- visitorRoute = NEW
- physicalSensor = B_NEW_ENTRY
- activeCueTrigger = SENSOR_A
- accessibilityClear = YES
- projectionSync = LATE
- soundSync = LATE
- exitLightSync = LATE
- rehearsalState = FAILED

## 3. Learner-visible causal relation

`NEW ROUTE → SENSOR B AT NEW ENTRY`

but

`ACTIVE CUE STILL LISTENS TO SENSOR A → TRIGGER OCCURS LATE → PROJECTION/SOUND/EXIT CUES LATE`

## 4. Test consequences

### Test T1 — run current setup
Result:
- reproduces failure.

Learner sees:
- visitor passes new entry;
- no trigger;
- projection starts later near old trigger zone;
- downstream cues lag.

### Test T2 — switch simulated trigger to Sensor B
Result:
- projection begins at new entry;
- sound/exit sequence returns to intended timing.

This strongly supports the causal model.

### Test T3 — manual cue
Result:
- room can appear to work in one rehearsal;
- timing varies with operator/visitor pacing.

Useful but less reliable.

## 5. Recovery options

### Option A — restore old route / old trigger
Advantages:
- minimal control change.

Problems:
- conflicts with new route/access clearance;
- physical room would need rework.

### Option B — update cue mapping to Sensor B
Advantages:
- preserves accessible route;
- small configuration change;
- consistent automatic behaviour.

Cost:
- requires controlled retest.

### Option C — manual cue
Advantages:
- fastest temporary workaround.

Problems:
- less reliable;
- depends on operator timing;
- not robust for repeated visitors.

## 6. Expected supported recommendation

Option B is the strongest default recommendation given current constraints.

However, the important evidence is not “choosing B” by label.

Qualifying evidence requires:
- identifying the trigger mismatch;
- observing T2 consequence;
- comparing constraints.

## 7. Error/revision consequence

Wrong or weak model should produce informative world behaviour.

Examples:
- changing artwork file does not fix sync;
- changing sound volume does not fix projection timing;
- manual cue works once but reveals reliability limitation.

No punitive failure state.

## 8. Character/world reaction

After supported test:
- Omar recognises hardware was not the problem;
- Teo sees cue trace align;
- Lia confirms route can remain accessible;
- room status changes to READY FOR REHEARSAL.

## 9. Closure

The meaningful closure is:
- the room runs correctly in a simulated visitor pass;
- the crew proceeds to the next rehearsal.

No explicit pedagogical moral is required.
