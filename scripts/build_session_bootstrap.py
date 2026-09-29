#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SNAPSHOT = Path("control-center/data/project-context-snapshot.json")
DEFAULT_REGISTRY = Path("docs/knowledge/governed-document-registry.json")
DEFAULT_RESOLVER = Path("config/session-bootstrap-subjects.json")


class BootstrapError(RuntimeError):
    pass


def load_json(path: Path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def load_pack_builder():
    path = ROOT / "scripts/build_trama_context_pack.py"
    spec = importlib.util.spec_from_file_location("trama_context_pack", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-zA-Z0-9]+", " ", text.lower())
    return " ".join(text.split())


def contains_phrase(normalized_query: str, alias: str) -> bool:
    normalized_alias = normalize(alias)
    if not normalized_alias:
        return False
    return f" {normalized_alias} " in f" {normalized_query} "


def unique_strings(values):
    out = []
    seen = set()
    for value in values:
        if not isinstance(value, str) or not value:
            continue
        if value not in seen:
            seen.add(value)
            out.append(value)
    return out


def unique_objects(values):
    out = []
    seen = set()
    for value in values:
        key = json.dumps(value, sort_keys=True, ensure_ascii=False)
        if key not in seen:
            seen.add(key)
            out.append(value)
    return out


def resolve_subjects(query: str, resolver: dict, explicit_subject: str | None = None):
    if resolver.get("schemaVersion") != "trama.session-bootstrap-subjects/v1":
        raise BootstrapError("SUBJECT_RESOLVER_IDENTITY_INVALID")

    normalized_query = normalize(query)
    matched_rules = []
    context_subjects = list(resolver.get("defaultContextSubjects", []))

    for rule in resolver.get("rules", []):
        aliases = rule.get("aliases", [])
        matched_aliases = [
            alias for alias in aliases
            if contains_phrase(normalized_query, alias)
        ]
        if matched_aliases:
            matched_rules.append({
                "id": rule["id"],
                "matchedAliases": matched_aliases,
                "contextSubjects": list(rule.get("contextSubjects", [])),
            })
            context_subjects.extend(rule.get("contextSubjects", []))

    if explicit_subject:
        context_subjects.insert(0, explicit_subject)
        matched_rules.insert(0, {
            "id": "explicit-subject",
            "matchedAliases": [explicit_subject],
            "contextSubjects": [explicit_subject],
        })

    context_subjects = unique_strings(context_subjects)
    resolution_status = "RESOLVED" if explicit_subject or matched_rules else "PARTIAL"

    return {
        "status": resolution_status,
        "query": query,
        "explicitSubject": explicit_subject,
        "matchedRules": matched_rules,
        "contextSubjects": context_subjects,
    }


def relevant_documents(registry: dict, subjects: list[str]):
    if registry.get("schemaVersion") != "trama.governed-document-registry/v1":
        raise BootstrapError("GOVERNED_DOCUMENT_REGISTRY_IDENTITY_INVALID")

    normalized_subjects = {normalize(x) for x in subjects}
    docs = []
    for doc in registry.get("documents", []):
        doc_subjects = {normalize(x) for x in doc.get("subjects", [])}
        if normalized_subjects & doc_subjects:
            docs.append({
                "id": doc.get("id"),
                "path": doc.get("path"),
                "kind": doc.get("kind"),
                "status": doc.get("status"),
                "priority": doc.get("priority"),
                "subjects": doc.get("subjects", []),
                "decisionRef": doc.get("decisionRef"),
                "dependsOn": doc.get("dependsOn", []),
            })
    return docs


def merge_packs(subjects, snapshot, effective_context=None):
    builder = load_pack_builder()
    packs = [builder.build(subject, snapshot, effective_context) for subject in subjects]
    keys = [
        "facts",
        "decisions",
        "activeInvariants",
        "evidence",
        "exactHeads",
        "blockingGates",
        "dependencies",
        "knownConflicts",
        "knownRejectedApproaches",
        "nextCandidateActions",
        "sourceRefs",
    ]
    merged = {key: [] for key in keys}
    for pack in packs:
        for key in keys:
            merged[key].extend(pack.get(key, []))
    for key in keys:
        merged[key] = unique_objects(merged[key])
    return merged


def _effective_summary(effective_context):
    if effective_context is None:
        return {
            "provided": False,
            "required": True,
            "reason": "LIVE_CONTEXT_NOT_PROVIDED",
            "effectiveContextStatus": None,
            "liveObservationStatus": None,
            "semanticDriftStatus": None,
        }
    if effective_context.get("schemaVersion") != "trama.effective-project-context/v1":
        raise BootstrapError("EFFECTIVE_CONTEXT_IDENTITY_INVALID")
    status = effective_context.get("effectiveContextStatus")
    return {
        "provided": True,
        "required": status != "USABLE",
        "reason": "LIVE_CONTEXT_USABLE" if status == "USABLE" else "LIVE_CONTEXT_NOT_USABLE",
        "effectiveContextStatus": status,
        "liveObservationStatus": effective_context.get("liveObservationStatus"),
        "semanticDriftStatus": effective_context.get("semanticDriftStatus"),
        "liveObservedAt": effective_context.get("liveObservedAt"),
    }


def build_receipt(query, snapshot, registry, resolver, explicit_subject=None, effective_context=None):
    if snapshot.get("project") != "TRAMA" or snapshot.get("schemaVersion") != "1.0.0":
        raise BootstrapError("PROJECT_CONTEXT_SNAPSHOT_IDENTITY_INVALID")

    resolution = resolve_subjects(query, resolver, explicit_subject)
    documents = relevant_documents(registry, resolution["contextSubjects"])
    composed = merge_packs(resolution["contextSubjects"], snapshot, effective_context)
    live = _effective_summary(effective_context)

    governed_context_found = bool(
        documents
        or composed["facts"]
        or composed["decisions"]
        or composed["activeInvariants"]
        or composed["evidence"]
    )
    negative_knowledge_checked = "knownRejectedApproaches" in composed

    if not governed_context_found:
        bootstrap_status = "BLOCKED"
    elif resolution["status"] == "PARTIAL":
        bootstrap_status = "PARTIAL_CONTEXT"
    elif snapshot.get("status") != "CURRENT":
        bootstrap_status = "PARTIAL_CONTEXT"
    elif live["required"]:
        bootstrap_status = "READY_LIVE_CHECK_REQUIRED"
    else:
        bootstrap_status = "READY"

    source_refs = list(composed["sourceRefs"])
    source_refs.extend(
        {"documentId": doc["id"], "path": doc["path"]}
        for doc in documents
        if doc.get("id") and doc.get("path")
    )
    source_refs = unique_objects(source_refs)

    return {
        "schemaVersion": "trama.session-bootstrap-receipt/v1",
        "bootstrapStatus": bootstrap_status,
        "subjectResolution": resolution,
        "governedContext": {
            "snapshotRef": str(DEFAULT_SNAPSHOT),
            "snapshotGeneratedAt": snapshot.get("generatedAt"),
            "snapshotStatus": snapshot.get("status"),
            "governedDocuments": documents,
            "facts": composed["facts"],
            "decisions": composed["decisions"],
            "activeInvariants": composed["activeInvariants"],
            "evidence": composed["evidence"],
            "exactHeads": composed["exactHeads"],
            "blockingGates": composed["blockingGates"],
            "dependencies": composed["dependencies"],
            "knownConflicts": composed["knownConflicts"],
            "knownRejectedApproaches": composed["knownRejectedApproaches"],
            "nextCandidateActions": composed["nextCandidateActions"],
            "negativeKnowledgeChecked": negative_knowledge_checked,
        },
        "liveVerification": live,
        "sourceRefs": source_refs,
        "authority": {
            "readOnly": True,
            "createsAuthority": False,
            "authorizesWrite": False,
            "authorizesRuntime": False,
            "authorizesPromotion": False,
        },
    }


def validate_receipt(receipt):
    required = {
        "schemaVersion",
        "bootstrapStatus",
        "subjectResolution",
        "governedContext",
        "liveVerification",
        "sourceRefs",
        "authority",
    }
    missing = required - set(receipt)
    if missing:
        raise BootstrapError("RECEIPT_FIELDS_MISSING:" + ",".join(sorted(missing)))
    if receipt["schemaVersion"] != "trama.session-bootstrap-receipt/v1":
        raise BootstrapError("RECEIPT_IDENTITY_INVALID")
    if receipt["bootstrapStatus"] not in {
        "READY",
        "READY_LIVE_CHECK_REQUIRED",
        "PARTIAL_CONTEXT",
        "BLOCKED",
    }:
        raise BootstrapError("BOOTSTRAP_STATUS_INVALID")
    authority = receipt["authority"]
    if any(authority.get(key) for key in (
        "createsAuthority",
        "authorizesWrite",
        "authorizesRuntime",
        "authorizesPromotion",
    )):
        raise BootstrapError("BOOTSTRAP_AUTHORITY_ESCALATION")
    if authority.get("readOnly") is not True:
        raise BootstrapError("BOOTSTRAP_NOT_READ_ONLY")


def main():
    ap = argparse.ArgumentParser(
        description="Compose a governed TRAMA session bootstrap context before discovery work."
    )
    ap.add_argument("--query", required=True)
    ap.add_argument("--subject")
    ap.add_argument("--snapshot", default=str(DEFAULT_SNAPSHOT))
    ap.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    ap.add_argument("--resolver", default=str(DEFAULT_RESOLVER))
    ap.add_argument("--effective-context")
    ap.add_argument("--output")
    args = ap.parse_args()

    snapshot = load_json(Path(args.snapshot))
    registry = load_json(Path(args.registry))
    resolver = load_json(Path(args.resolver))
    effective = load_json(Path(args.effective_context)) if args.effective_context else None

    receipt = build_receipt(
        args.query,
        snapshot,
        registry,
        resolver,
        explicit_subject=args.subject,
        effective_context=effective,
    )
    validate_receipt(receipt)
    body = json.dumps(receipt, ensure_ascii=False, indent=2) + "\n"

    if args.output:
        out = ROOT / args.output
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(body, encoding="utf-8")
        print(out)
    else:
        print(body, end="")


if __name__ == "__main__":
    main()
