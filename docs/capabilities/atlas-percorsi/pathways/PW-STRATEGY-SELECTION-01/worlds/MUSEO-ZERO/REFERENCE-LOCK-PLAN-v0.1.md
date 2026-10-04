# MUSEO ZERO — Reference Lock Plan v0.1

**Candidate:** MZ-VF-001
**Factory:** TRAMA Visual Factory v0.1
**State:** REFERENCE_LOCK_PRODUCTION_ACTIVE
**Runtime:** NOT_AUTHORIZED

## Purpose

This tranche tests whether the visual quality benchmark can become a repeatable product language rather than a one-off generated storyboard.

No engine or motion work is authorised in this tranche.

## Required reference assets

1. **LIA-CANON-01**
   - adult museum setup crew member;
   - stable hairstyle, facial identity, body proportions and clothing silhouette;
   - contemporary practical clothing;
   - non-infantilising;
   - suitable for full-body and medium shots.

2. **SALA-ZERO-CANON-01**
   - contemporary museum room after closing;
   - large projection wall;
   - new entrance threshold;
   - subtle route marking;
   - credible exhibition lighting;
   - no dashboard / schematic overlay;
   - architecture reusable across F1–F6.

3. **F3-TOO-LATE-01**
   - Lia has already crossed the new entrance;
   - projection turns on too late;
   - spatial mismatch is understandable without caption;
   - same Lia and same Sala Zero references;
   - no generated text inside the image.

4. **F4-BACKSTAGE-CLUE-01**
   - believable museum control booth physically connected to the exhibition world;
   - one readable mapping relation;
   - same art direction as F3;
   - technical evidence remains diegetic;
   - no floating teaching diagram;
   - no generated explanatory prose in the image.

## Reference-lock acceptance

The tranche passes only if Human Review can answer YES:

- Lia is recognisably the same person between reference and F3/F4;
- Sala Zero is recognisably the same place;
- lighting/palette/material language is coherent;
- F3 communicates delayed response without explanatory text;
- F4 introduces technical evidence without turning the product into a dashboard;
- no HS02 generic-AI-look;
- no HS03 identity instability;
- no HS04 obvious generative artefacts;
- no HS05 technical diagram replacing the world;
- no HS07 infantilising lower-secondary tone.

## Production rule

Learner-facing text, labels, speech bubbles and UI are rendered separately from the visual plate.

Generated text embedded in an image is never canonical.

## Evidence state

Until open/reproducible generation is demonstrated, assets produced outside the selected Factory toolchain may be retained as:
- QUALITY_REFERENCE;
- COMPOSITION_REFERENCE;
- REFERENCE_LOCK_CANDIDATE.

They do not prove Factory reproducibility by themselves.

## Next gate

If all four assets are visually coherent:
**REFERENCE_LOCK_CANDIDATE_READY_FOR_OPEN_PIPELINE_REPRODUCTION**

If continuity fails:
**RETURN_TO_ART_DIRECTION**

Runtime, publication and implementation remain NOT_AUTHORIZED.
