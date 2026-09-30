#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export TRAMA_A7_PUBLIC_DIR="${TRAMA_RENDER_PUBLIC_DIR:-$ROOT/public}"

exec bash "$ROOT/scripts/build_control_center_a7_candidate.sh"
