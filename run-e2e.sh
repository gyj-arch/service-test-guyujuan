#!/bin/bash
set -e

# Project root directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  Kong Gateway Manager E2E Test Script"
echo "=========================================="

# Detect if Ubuntu/Debian
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "$ID"
  else
    echo "unknown"
  fi
}

# Install dependencies (Ubuntu/Debian)
install_deps() {
  local os=$(detect_os)
  if [[ "$os" != "ubuntu" && "$os" != "debian" ]]; then
    echo "Warning: This script is optimized for Ubuntu/Debian, current system: $os"
    echo "Please install manually: Node.js 18+, Docker, Docker Compose"
    read -p "Dependencies installed? Press Enter to continue, Ctrl+C to exit: "
  fi

  echo "=== 1. Install Node.js 18+ ==="
  if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "Node.js already installed: $(node -v)"
  fi

  echo "=== 2. Install Docker and Docker Compose ==="
  if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    echo "Note: If docker requires sudo, log out and back in, or use: newgrp docker"
  else
    echo "Docker already installed: $(docker --version)"
  fi

  # Ensure docker compose is available (Docker Compose V2)
  if ! docker compose version &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
  fi
}

# Pull code
pull_code() {
  echo "=== 3. Git Pull ==="
  git pull
}

# Install npm dependencies
install_npm() {
  echo "=== 4. Install npm dependencies ==="
  npm ci
}

# Start environment and run tests
run_tests() {
  # Use sudo if current user lacks docker access
  DOCKER_CMD="docker"
  if ! docker ps &> /dev/null; then
    DOCKER_CMD="sudo docker"
    echo "Using sudo for Docker commands"
  fi

  echo "=== 5. Start Kong (Docker) ==="
  cd "$SCRIPT_DIR/docker"
  $DOCKER_CMD compose up -d
  cd "$SCRIPT_DIR"

  echo "=== 6. Wait for Kong to be ready ==="
  if ! timeout 120 bash -c 'until curl -sf http://localhost:8001/status > /dev/null 2>&1; do echo "  Waiting for Kong..."; sleep 2; done'; then
    echo "Error: Kong startup timeout"
    cd "$SCRIPT_DIR/docker" && $DOCKER_CMD compose down
    exit 1
  fi
  echo "Kong is ready"

  echo "=== 7. Run Cypress tests ==="
  npm run cypress:run
  TEST_EXIT=$?

  echo "=== 8. Stop Docker services ==="
  cd "$SCRIPT_DIR/docker"
  $DOCKER_CMD compose down
  cd "$SCRIPT_DIR"

  exit $TEST_EXIT
}

# Main flow
main() {
  # Optional: skip install step if env is ready (set SKIP_INSTALL=1)
  if [[ "${SKIP_INSTALL:-0}" != "1" ]]; then
    install_deps
  fi

  pull_code
  install_npm
  run_tests
}

main "$@"
