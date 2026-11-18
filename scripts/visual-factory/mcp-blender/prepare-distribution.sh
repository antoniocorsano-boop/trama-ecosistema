#!/usr/bin/env bash
set -euo pipefail
cd "$RUNNER_TEMP/vf3d-l0"
file=blender-4.2.23-linux-x64.tar.xz
digest=bea0eb3146be13eae6225409a117b215184f41b7f79e799f97cb3abb8f6dc404
# Reuse the public distribution sources qualified by Atlas.
valid() {
  [[ -f "$1" && ! -L "$1" ]] &&
  [[ "$(stat -c %s "$1")" = 350707672 ]] &&
  printf '%s  %s\n' "$digest" "$1" | sha256sum --strict --check
}
source=
for base in https://download.blender.org/release/Blender4.2 https://mirror.clarkson.edu/blender/release/Blender4.2 https://mirror.dotsrc.org/blender/release/Blender4.2; do
  echo "Trying approved distribution source: $base"
  rm -f "$file.part"
  if curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --connect-timeout 15 --max-time 120 --output "$file.part" "$base/$file"; then
    if valid "$file.part"; then
      mv "$file.part" "$file"
      source="$base"
      break
    fi
    echo "Rejected archive: size or digest mismatch"
  fi
  rm -f "$file.part"
done
[[ -n "$source" ]] || { echo "BLOCKED: all approved distribution sources failed; no execution"; exit 1; }
valid "$file"
echo "Verified distribution source: $source"
tar -xJf "$file"
./blender-4.2.23-linux-x64/blender --version
