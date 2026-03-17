# Kong Gateway Manager E2E Tests

Cypress E2E test suite for validating Kong Gateway Manager's Service and Route lifecycle: create, verify, and delete.

## Prerequisites

- **Node.js** 18+
- **Kong Gateway** running (or via Docker)
- **Kong Manager** accessible for UI operations

## Project Structure

```
├── cypress/
│   ├── e2e/                    # Test specs
│   │   └── service_route_basic_flow.cy.js  # Main flow: create Service → Route → verify → delete
│   ├── fixtures/               # Test data
│   │   ├── basicFlow.json     # Service/Route config (name, url, path, method)
│   │   ├── kongManager.json   # Kong connection (host, port, adminPort, serverPort)
│   │   └── gatewayService.json
│   ├── support/
│   │   ├── commands.js        # Custom commands (e.g. getText)
│   │   ├── services/          # Business logic (GatewayServiceBusiness, RouteBusiness)
│   │   └── pages/             # Page Objects
│   ├── reports/               # Mochawesome report output
│   └── screenshots/           # Failure screenshots
├── .github/workflows/
│   └── cypress.yaml           # CI config (multi-browser)
├── .vscode/
│   └── launch.json            # VS Code debug config
└── cypress.config.js
```

## Installation

```bash
npm ci
```

## Configuration

### 1. Kong Manager Config

Edit `cypress/fixtures/kongManager.json`:

```json
{
  "host": "localhost",
  "port": 8002,
  "serverPort": 8000,
  "adminPort": 8001,
  "protocol": "http",
  "workspace": "default"
}
```

- `host` / `port`: Kong Manager UI address
- `adminPort`: Kong Admin API port (used for cleanup in `after` hook)
- `serverPort`: Kong Proxy port (used for route verification)

### 2. Base URL

Set `CYPRESS_BASE_URL` to your Kong Manager URL.

**Windows (PowerShell):**
```powershell
$env:CYPRESS_BASE_URL = 'http://localhost:8002'
```

**Linux/macOS:**
```bash
export CYPRESS_BASE_URL='http://localhost:8002'
```

### 3. Test Data

`cypress/fixtures/basicFlow.json` defines default Service and Route configuration. Adjust as needed.

## Running Tests

| Command | Description |
|---------|-------------|
| `npm run cypress:open` | Open Cypress interactive runner |
| `npm run cypress:run` | Run headless |
| `npm run cypress:chrome` | Run with Chrome browser |
| `npm run test:e2e` | Same as `cypress:run` |
| `npm run test:e2e:report` | Run with Mochawesome report |
| `npm run test:ci` | CI mode (JUnit reporter) |

## Reports

- **Mochawesome**: `cypress/reports/` (HTML + JSON)
- **Screenshots**: `cypress/screenshots/` (on failure)
- **Videos**: `cypress/videos/` (enable in config if needed)

## Debugging

Use `.vscode/launch.json` in VS Code to debug `sanity_flow.cy.js`. Select `Debug sanity_flow.cy.js` or `Debug sanity_flow.cy.js (headed)` and press F5.

## CI (GitHub Actions)

- **Triggers**: `push` and `pull_request` on `main` and `develop` branches
- **Browsers**: Chrome, Firefox, Edge
- **Flow**: Starts Kong via Docker (`docker/`), runs Cypress tests
- **Artifacts**: Reports, screenshots, and videos uploaded on failure

**Note**: CI requires a `docker/` directory with `docker-compose` configuration. Add or adjust the workflow if this directory is missing.

## Test Flow

`sanity_flow.cy.js` covers:

1. Create Gateway Service (via UI)
2. Create Route for the Service
3. Verify route via Kong Proxy (expect 200)
4. Delete Route and Service
5. Verify route returns 404 after deletion
6. `after` hook cleans up via Kong Admin API if Service/Route still exist

## Notes

- Implement `cy.login()` in `cypress/support/commands.js` if authentication is required.
- Selectors use `data-testid`; update `cypress/support/pages/` if your app DOM changes.
