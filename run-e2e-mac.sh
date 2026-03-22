#!/bin/bash
set -e

# Project root directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

usage() {
  cat <<'USAGE'
==========================================
  Kong Gateway Manager E2E Test (macOS)
==========================================

Usage:
  ./run-e2e-mac.sh [OPTIONS]

Options:
  --spec <pattern>    Cypress spec file or glob pattern to run
  --browser <name>    Browser to use (chrome, firefox, edge, electron)
  --help, -h          Show this help message

Prerequisites:
  - Docker Desktop for Mac (running)
  - Node.js 18+
  - Git

Examples:
  # Run all tests with default browser (Electron)
  ./run-e2e-mac.sh

  # Run a single spec file
  ./run-e2e-mac.sh --spec "cypress/e2e/route/route_create.cy.js"

  # Run all specs under a folder using glob
  ./run-e2e-mac.sh --spec "cypress/e2e/route/*.cy.js"

  # Run with Chrome browser
  ./run-e2e-mac.sh --browser chrome

  # Combine spec and browser
  ./run-e2e-mac.sh --spec "cypress/e2e/service_route/*.cy.js" --browser firefox

USAGE
}

echo "=========================================="
echo "  Kong Gateway Manager E2E Test (macOS)"
echo "=========================================="

# Parse arguments: --spec <file>, --browser <name>
SPEC=""
BROWSER=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h) usage; exit 0 ;;
    --spec)    SPEC="$2"; shift 2 ;;
    --browser) BROWSER="$2"; shift 2 ;;
    *)         shift ;;
  esac
done

# Detect Docker Compose (v1: docker-compose, v2: docker compose)
if docker compose version &> /dev/null; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null && docker-compose version &> /dev/null; then
  COMPOSE_CMD="docker-compose"
else
  echo "Error: Docker Compose not found. Install docker-compose or Docker Desktop."
  exit 1
fi

# Pull code
echo ""
echo "=== 1. Git Pull ==="
git pull

# Install npm dependencies
echo ""
echo "=== 2. Install npm dependencies ==="
npm ci

# Start Kong and run tests
echo ""
echo "=== 3. Start Kong (Docker) ==="
cd "$SCRIPT_DIR/docker"
$COMPOSE_CMD up -d
cd "$SCRIPT_DIR"

echo ""
echo "=== 4. Wait for Kong to be ready ==="
count=0
max_attempts=60
until curl -sf http://localhost:8001/status > /dev/null 2>&1; do
  count=$((count + 1))
  if [ $count -ge $max_attempts ]; then
    echo "Error: Kong startup timeout after 120 seconds"
    cd "$SCRIPT_DIR/docker" && $COMPOSE_CMD down
    exit 1
  fi
  echo "  Waiting for Kong..."
  sleep 2
done
echo "Kong is ready"

# Build cypress run command with optional --spec and --browser
echo ""
echo "=== 5. Run Cypress tests ==="
CYPRESS_ARGS=""
if [[ -n "$SPEC" ]]; then
  CYPRESS_ARGS="$CYPRESS_ARGS --spec $SPEC"
fi
if [[ -n "$BROWSER" ]]; then
  CYPRESS_ARGS="$CYPRESS_ARGS --browser $BROWSER"
fi
npx cypress run $CYPRESS_ARGS
TEST_EXIT=$?

echo ""
echo "=== 6. Stop Docker services ==="
cd "$SCRIPT_DIR/docker"
$COMPOSE_CMD down
cd "$SCRIPT_DIR"

exit $TEST_EXIT
