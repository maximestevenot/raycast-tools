#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Random Generator
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🎲
# @raycast.argument1 { "type": "dropdown", "placeholder": "Type", "data": [{ "title": "Password", "value": "pwd" }, { "title": "Alphanumeric", "value": "alpha-num" }, { "title": "Number", "value": "number" }, { "title": "UUID v7", "value": "uuidv7" }, { "title": "UUID v4", "value": "uuidv4" }] }
# @raycast.argument2 { "type": "text", "placeholder": "Length (pwd/alpha-num/number)", "optional": true }
# @raycast.packageName randgen

# Documentation:
# @raycast.description Generate a random string, password, or UUID and copy it to the clipboard.
# @raycast.author Maxime Stevenot

set -euo pipefail

# Locate the randgen binary (override with $RANDGEN_BIN if installed elsewhere).
RANDGEN="${RANDGEN_BIN:-$HOME/.local/bin/randgen}"
if [ ! -x "$RANDGEN" ]; then
  if command -v randgen >/dev/null 2>&1; then
    RANDGEN="$(command -v randgen)"
  else
    echo "randgen not found — build it with: cd ~/wu/generators/randgen && go build -o ~/.local/bin/randgen ." >&2
    exit 1
  fi
fi

type="$1"
length="${2:-}"

# Only the string generators take a length; UUIDs ignore it.
args=("$type")
case "$type" in
  pwd | alpha-num | number)
    if [ -n "$length" ]; then
      args+=("$length")
    fi
    ;;
  uuidv4 | uuidv7) ;;
  *)
    echo "Unknown type: $type" >&2
    exit 1
    ;;
esac

# -c copies to the clipboard; capture stdout to display the value in Raycast.
result="$("$RANDGEN" "${args[@]}" -c 2>/dev/null)"
echo "📋 Copied: $result"
