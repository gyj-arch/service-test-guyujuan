#!/bin/bash
set -e

# Project root directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Kong Gateway Manager E2E Test (macOS)"
echo "=========================================="

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

echo ""
echo "=== 5. Run Cypress tests ==="
npm run cypress:run
TEST_EXIT=$?

echo ""
echo "=== 6. Stop Docker services ==="
cd "$SCRIPT_DIR/docker"
$COMPOSE_CMD down
cd "$SCRIPT_DIR"

exit $TEST_EXIT
