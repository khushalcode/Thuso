#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────
# clean-and-dev.sh — clean stale build artifacts + start dev server
#
# Run this instead of `npm run dev` if you see a 404 on the home page.
# The 404 is caused by stale .next/out directories left over from a
# previous APK static-export build.
# ──────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

echo "==> Cleaning stale build artifacts..."
rm -rf .next out
echo "    ✓ Deleted .next and out"

echo ""
echo "==> Starting dev server..."
npm run dev
