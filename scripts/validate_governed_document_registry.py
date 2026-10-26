#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/"docs/knowledge/governed-document-registry.json"
DECISIONS=ROOT/"docs/decisions/decision-register.json"

ALLOWED_KINDS={"OPERATING_MODEL","ADR","ARCHITECTURE","CONTRACT","UI_CONTRACT","POLICY","GUIDE"}
ALLOWED_STATUS={"CURRENT","PROPOSED","SUPERSEDED","RETIRED"}
ALLOWED_PRIORITY={"FOUNDATIONAL","NORMATIVE","SUPPORTING"}
REQUIRED_DIDACTIC_COMPOSER_DOCUMENTS={
    "DOC-DIDACTIC-COMPOSER-ADR-022",
    "DOC-DIDACTIC-COMPOSER-DESIGN-V1",
    "DOC-DIDACTIC-COMPOSER-CAPABILITY",
    "DOC-DIDACTIC-COMPOSER-HUMAN-APPROVAL",
}

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def fail(message):
    raise SystemExit("GOVERNED_DOCUMENT_REGISTRY_INVALID: "+message)

def main():
    registry=load(REGISTRY)
    decisions=load(DECISIONS)
    if registry.get("schemaVersion")!="trama.governed-document-registry/v1":
        fail("schemaVersion")
    documents=registry.get("documents")
    if not isinstance(documents,list) or not documents:
        fail("documents")

    decision_by_id={x.get("id"):x for x in decisions.get("decisions",[])}
    adr_022=decision_by_id.get("TRAMA-ADR-022")
    if not adr_022:
        fail("TRAMA-ADR-022 not registered")
    if adr_022.get("status")!="APPROVED":
        fail("TRAMA-ADR-022 must be APPROVED")
    decision_ids=set(decision_by_id)
    ids=set()
    paths=set()

    for item in documents:
        did=item.get("id")
        path=item.get("path")
        if not isinstance(did,str) or not did:
            fail("document id missing")
        if did in ids:
            fail(f"duplicate id {did}")
        ids.add(did)

        if not isinstance(path,str) or not path:
            fail(f"{did}: path missing")
        if path in paths:
            fail(f"duplicate path {path}")
        paths.add(path)
        if not (ROOT/path).is_file():
            fail(f"{did}: missing file {path}")

        if item.get("kind") not in ALLOWED_KINDS:
            fail(f"{did}: invalid kind")
        if item.get("status") not in ALLOWED_STATUS:
            fail(f"{did}: invalid status")
        if item.get("priority") not in ALLOWED_PRIORITY:
            fail(f"{did}: invalid priority")
        subjects=item.get("subjects")
        if not isinstance(subjects,list) or not subjects or any(not isinstance(x,str) or not x for x in subjects):
            fail(f"{did}: invalid subjects")
        triggers=item.get("updateTriggers")
        if not isinstance(triggers,list) or not triggers:
            fail(f"{did}: updateTriggers required")

        decision_ref=item.get("decisionRef")
        if item.get("kind")=="ADR" and not decision_ref:
            fail(f"{did}: ADR requires decisionRef")
        if decision_ref and decision_ref not in decision_ids:
            fail(f"{did}: decisionRef not registered: {decision_ref}")

    missing_composer_docs=REQUIRED_DIDACTIC_COMPOSER_DOCUMENTS-ids
    if missing_composer_docs:
        fail("missing Didactic Composer governed documents: "+", ".join(sorted(missing_composer_docs)))

    for item in documents:
        for dep in item.get("dependsOn",[]):
            if dep not in ids:
                fail(f"{item['id']}: missing dependency {dep}")

    policy=registry.get("policy",{})
    if policy.get("chatIsAuthority") is not False:
        fail("chatIsAuthority must be false")
    if policy.get("requiresExistingFile") is not True:
        fail("requiresExistingFile must be true")
    if policy.get("requiresRegisteredDecisionForAdr") is not True:
        fail("requiresRegisteredDecisionForAdr must be true")
    if policy.get("orphanFoundationalDocumentsAllowed") is not False:
        fail("orphanFoundationalDocumentsAllowed must be false")

    foundational=[x for x in documents if x.get("priority")=="FOUNDATIONAL"]
    referenced={dep for x in documents for dep in x.get("dependsOn",[])}
    roots={x["id"] for x in foundational if not x.get("dependsOn")}
    for item in foundational:
        if item["id"] not in roots and item["id"] not in referenced:
            fail(f"{item['id']}: orphan foundational document")

    print(f"TRAMA governed document registry: PASS ({len(documents)} documents)")
    return 0

if __name__=="__main__":
    sys.exit(main())
