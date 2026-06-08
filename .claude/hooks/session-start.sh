#!/bin/bash
# Installs project dependencies on session start so tests, linters, and the
# fallow MCP server (pnpm exec fallow-mcp, see .mcp.json) are ready to use.
set -euo pipefail

# Only run in Claude Code on the web (remote) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Idempotent: pnpm install is a no-op when the store/node_modules are current.
pnpm install --frozen-lockfile
