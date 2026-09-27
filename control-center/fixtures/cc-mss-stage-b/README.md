# CC-MSS-01 Stage B qualification fixtures

This directory contains the offline qualification matrix for the Stage B contract.

## Boundary

- no network;
- no live GitHub discovery;
- no collector execution;
- no UI/runtime mutation;
- DOS-A1 remains DEFERRED;
- PR #96 is not frozen as current truth: it is refreshed only in Stage D.

`qualification.json` enumerates the complete required matrix: 15 negative cases, 5 positive controls, 4 reference-integrity cases and 2 backward-readability cases.

`qualify_cc_mss_stage_b.py` checks completeness and deterministic expected reason codes. It is intentionally separate from live-source qualification. A PASS here proves the Stage B contract matrix is complete and internally consistent; it does not claim that Stage D cold-start/live-source qualification has passed.
