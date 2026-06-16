#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Shahpur Frontend – Workspace Cleanup
# ─────────────────────────────────────────────────────────────────────
# Removes Next.js build caches, Node modules, OS junk, and log files.
# Safe to run any time.
#
# Usage:
#   ./cleanup.sh              # safe defaults (recommended)
#   ./cleanup.sh --deep       # also wipe node_modules and .next cache
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")"

DEEP=0
for arg in "$@"; do
  case "$arg" in
    --deep) DEEP=1 ;;
    -h|--help)
      sed -n '1,15p' "$0"
      exit 0
      ;;
  esac
done

say() { printf "\033[1;36m▸ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }

# ── 1. TypeScript build info ─────────────────────────────
say "Removing *.tsbuildinfo files"
find . -type f -name "*.tsbuildinfo" -not -path "*/node_modules/*" -delete 2>/dev/null || true
ok "done"

# ── 2. Stale log files ───────────────────────────────────
say "Removing *.log files outside node_modules / .next"
find . -type f -name "*.log" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -delete 2>/dev/null || true
ok "done"

# ── 3. OS junk ───────────────────────────────────────────
say "Removing OS junk (.DS_Store, Thumbs.db, etc.)"
find . -type f \( -name ".DS_Store" -o -name "Thumbs.db" -o -name "Desktop.ini" -o -name "ehthumbs.db" \) -delete 2>/dev/null || true
ok "done"

# ── 4. Deep mode ─────────────────────────────────────────
if [ "$DEEP" = "1" ]; then
  if [ -d .next ]; then
    say "DEEP: removing frontend/.next build cache"
    rm -rf .next
    ok "done"
  fi
  if [ -d node_modules ]; then
    say "DEEP: removing frontend/node_modules"
    rm -rf node_modules
    ok "done — reinstall with npm install before next build"
  fi
fi

printf "\n\033[1;32m✓ frontend cleanup complete\033[0m\n"
