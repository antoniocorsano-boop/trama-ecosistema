# TRAMA Lessons Engine

This directory contains deterministic projections and human-readable canonical lesson documents for the governed TRAMA Lessons Engine.

## Authority

Project Knowledge remains the operational authority. `LESSONS_INDEX.json` and `LESSONS_INDEX.md` are generated lookup projections only; they do not grant authority, approve a lesson, authorize a merge, or authorize runtime execution.

A lesson enters the canonical set only through a `FAILURE_LEARNING` KnowledgeEvent carrying Lessons Engine metadata plus its matching document under `canonical/<LESSON-ID>.md`, after the exact-head-bound human GitHub decision required by the governance contract.

Legacy `FAILURE_LEARNING` events without Lessons Engine metadata remain valid Project Knowledge and are not silently reclassified as indexed lessons.

## Consistency

Run:

```bash
python3 scripts/build_lessons_index.py --write
python3 scripts/build_lessons_index.py --check
```

The builder fails closed on duplicate lesson IDs, missing canonical documents, orphan canonical documents, unsupported lesson status, or projection drift.
