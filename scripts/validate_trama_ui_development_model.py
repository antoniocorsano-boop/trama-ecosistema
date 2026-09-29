#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/"docs/contracts/trama-ui-development-model-v1.md"
POLICY=ROOT/"governance/ui-development/trama-ui-development-model-v1.json"

def fail(msg):
    raise SystemExit("TRAMA_UI_DEVELOPMENT_MODEL_INVALID: "+msg)

def main():
    if not DOC.is_file(): fail("missing document")
    if not POLICY.is_file(): fail("missing machine-readable policy")

    p=json.loads(POLICY.read_text(encoding="utf-8"))
    if p.get("schemaVersion")!="trama.ui-development-model/v1": fail("schemaVersion")
    if p.get("modelId")!="TRAMA-UI-DEVELOPMENT-01": fail("modelId")
    if set(p.get("scope",[]))!={"ARENA","ATLAS","DOCENTE_OS","TRAMA_CONTROL_CENTER"}: fail("scope")
    if p.get("runtimeImpact")!="NONE": fail("runtimeImpact")
    if p.get("dosA1")!="RUNTIME_DEFERRED": fail("dosA1")

    expected=["USER_NEED","INFORMATION_MODEL","ORIENTATION","BENCHMARK","BUILD_BORROW_DECISION","COMPONENT_MAPPING","VISUAL_COMPOSITION","PROTOTYPE","EVIDENCE","HUMAN_VALIDATION","PROMOTION"]
    if p.get("sequence")!=expected: fail("sequence")

    if p.get("buildBorrowOrder")!=["NATIVE","BORROW_PRIMITIVE","ADAPT_PATTERN","TRAMA_DISTINCTIVE","PRODUCT_SPECIFIC"]:
        fail("build/borrow order")

    required_dep={"project","versionRange","license","maintenanceState","frameworkRequirement","accessibilityModel","customizationMechanism","runtimeCost","owner","updatePolicy","exitPath"}
    if set(p.get("externalDependencyRequiredFields",[]))!=required_dep: fail("dependency lifecycle fields")

    inv=p.get("invariants",{})
    for key in ["nativeFirst","behaviorBeforeVisualKit","productVisualIdentityPreserved","mobileIndependentComposition","humanValidationWhenMaterial","thirdPartyPopularityNotAdoptionCriterion"]:
        if inv.get(key) is not True: fail("invariant "+key)
    if inv.get("runtimeMigrationAuthorized") is not False: fail("runtime migration boundary")

    doc=DOC.read_text(encoding="utf-8")
    for token in [
        "borrow behavior, own expression",
        "Anti-generic UI rule",
        "card-first composition",
        "Mobile is a separate composition",
        "Using an accessible library does not make the composed interface accessible",
        "DISCOVER → EVALUATE → TRIAL → EVIDENCE → QUALIFY → STABLE"
    ]:
        if token.lower() not in doc.lower(): fail("document invariant "+token)

    print("TRAMA UI Development Model v1: PASS")

if __name__=="__main__":
    main()
