#!/bin/bash
# Installs project dependencies on session start so tests, linters, and the
# fallow MCP server (see .mcp.json) are ready to use.
#
# Runs in ASYNC mode: the hook returns immediately so it never blocks session
# init. A synchronous install here deadlocks cold-container startup, because it
# holds the pnpm store lock while the MCP client concurrently spawns the fallow
# server with its own pnpm, and the two pnpm processes wait on each other.
set -euo pipefail

# Tell Claude Code to run this hook in the background (non-blocking).
echo '{"async": true, "asyncTimeout": 600000}'

# Only run in Claude Code on the web (remote) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Idempotent: pnpm install is a no-op when the store/node_modules are current.
pnpm install --frozen-lockfile
