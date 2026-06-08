#!/usr/bin/env bash
# Environment setup for Claude Code on the web.
#
# Point your web environment's setup/install command at this script
# (e.g. `bash scripts/setup.sh`). It runs at container provisioning —
# before the agent session and before MCP servers start — so that
# node_modules (and the fallow MCP binary in .mcp.json) is guaranteed to
# exist by the time the session begins. This avoids both the cold-start
# race and the pnpm store-lock deadlock that a SessionStart hook hit when
# it ran concurrently with the MCP client's own pnpm invocation.
set -euo pipefail

cd "$(dirname "$0")/.."

# Idempotent: a no-op when the store/node_modules are already current.
pnpm install --frozen-lockfile
