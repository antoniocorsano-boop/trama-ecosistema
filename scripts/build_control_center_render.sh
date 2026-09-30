#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${TRAMA_RENDER_PUBLIC_DIR:-$ROOT/public}"
SKIP_LIVE="${TRAMA_RENDER_SKIP_LIVE:-0}"

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$ROOT/control-center/." "$OUT/"

if [[ "$SKIP_LIVE" == "1" ]]; then
  echo "TRAMA_RENDER_LIVE_CONTEXT_SKIPPED_BY_TEST"
  exit 0
fi

live_ready=1
if ! python3 -c 'import jsonschema' >/dev/null 2>&1; then
  if ! python3 -m pip install --disable-pip-version-check --quiet jsonschema; then
    live_ready=0
    echo "TRAMA_RENDER_LIVE_CONTEXT_DEPENDENCY_UNAVAILABLE"
  fi
fi

overlay="$(mktemp -t trama-live-overlay.XXXXXX.json)"
component_overlay="$(mktemp -t trama-live-component-evidence.XXXXXX.json)"
cleanup(){ rm -f "$overlay" "$component_overlay"; }
trap cleanup EXIT

if [[ "$live_ready" == "1" ]] && python3 "$ROOT/scripts/collect_atlas_live_component_evidence_r1.py" > "$component_overlay"; then
  if python3 "$ROOT/scripts/build_ecosystem_snapshot.py" \
      --live-component-overlay "$component_overlay" \
      --output "$OUT/data/ecosystem-snapshot.json"; then
    echo "TRAMA_RENDER_LIVE_COMPONENT_EVIDENCE_MATERIALIZED"
  else
    echo "TRAMA_RENDER_LIVE_COMPONENT_EVIDENCE_FALLBACK_MATERIALIZATION_FAILED"
  fi
else
  echo "TRAMA_RENDER_LIVE_COMPONENT_EVIDENCE_GOVERNED_FALLBACK"
fi

if [[ "$live_ready" == "1" ]] && python3 "$ROOT/scripts/run_live_repository_overlay.py" --pretty > "$overlay"; then
  if python3 "$ROOT/scripts/materialize_live_project_knowledge_bundle.py"       --overlay "$overlay"       --output "$OUT/data/context-packs/project-knowledge.json"; then
    echo "TRAMA_RENDER_LIVE_PROJECT_KNOWLEDGE_MATERIALIZED"
  else
    echo "TRAMA_RENDER_LIVE_PROJECT_KNOWLEDGE_FALLBACK_MATERIALIZATION_FAILED"
  fi
else
  echo "TRAMA_RENDER_LIVE_PROJECT_KNOWLEDGE_GOVERNED_FALLBACK"
fi

test -s "$OUT/index.html"
test -s "$OUT/maturity.html"
test -s "$OUT/data/ecosystem-snapshot.json"
test -s "$OUT/data/context-packs/project-knowledge.json"
