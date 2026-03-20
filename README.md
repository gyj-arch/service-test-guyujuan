# Kong Gateway Manager E2E Tests

Cypress E2E test suite for validating Kong Gateway Manager's Service and Route lifecycle: create, verify, update, and delete. Supports both UI operations and Kong Admin API operations.

## Prerequisites

- **Node.js** 18+
- **Kong Gateway** running (or via Docker)
- **Kong Manager** accessible (for UI operations)

## Project Structure

```
├── cypress/
│   ├── e2e/                           # Test specs
│   │   ├── gateway_service/           # Service tests
│   │   │   ├── service_create.cy.js       # Create Service (UI)
│   │   │   └── service_new_grid.cy.js     # Service list/grid
│   │   ├── route/                     # Route tests
│   │   │   ├── route_create.cy.js         # Create Route (API + UI)
│   │   │   └── route_parameters_match.cy.js  # Route params (strip_path, etc.)
│   │   └── service_route_basic_flow.cy.js   # Full flow: Service → Route → verify → delete
│   ├── fixtures/                      # Test data
│   │   ├── basicFlow.json             # Default Service/Route config
│   │   ├── kongManager.json           # Kong connection config
│   │   ├── gatewayService.json
│   │   └── serviceParametersCheck.json
│   ├── support/
│   │   ├── commands.js                # Custom commands (incl. Kong API)
│   │   ├── e2e.js                     # Global setup, generateRandomId
│   │   ├── services/                  # Business logic
│   │   │   ├── gateway_service_business.js
│   │   │   └── route_business.js
│   │   └── pages/                     # Page Objects
│   ├── reports/                       # Mochawesome report output
│   └── screenshots/                   # Failure screenshots
├── .github/workflows/
│   └── cypress.yaml                   # CI config (Chrome, Firefox, Edge)
├── .vscode/
│   └── launch.json                    # VS Code debug config
└── cypress.config.js
```

## Installation

```bash
npm ci
```

## Configuration

### 1. Kong Connection Config

Edit `cypress/fixtures/kongManager.json`:

```json
{
  "host": "localhost",
  "port": 8002,
  "serverPort": 8000,
  "adminPort": 8001,
  "protocol": "http",
  "workspace": "default",
  "serverBaseURL": "http://localhost:8002",
  "adminURL": "http://localhost:8001"
}
```

| Field | Description |
|-------|-------------|
| `host` / `port` | Kong Manager UI address |
| `adminPort` | Kong Admin API port (create/delete Service, Route) |
| `serverPort` | Kong Proxy port (verify Route reachability) |
| `workspace` | Kong workspace name |
| `adminURL` | Admin API full URL (preferred, avoids URL parsing issues) |

### 2. Base URL

`cypress.config.js` sets `baseUrl: 'http://localhost:8002'`. To override, set the environment variable:

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
| `npm run cypress:chrome` | Run with Chrome |
| `npm run test:e2e` | Same as `cypress:run` |
| `npm run test:e2e:report` | Run with Mochawesome report |
| `npm run test:ci` | CI mode (JUnit report) |

## Custom Commands (Kong API)

`cypress/support/commands.js` provides these Kong Admin API commands:

| Command | Description |
|---------|-------------|
| `cy.createServiceViaAPI(serviceConfig)` | Create Service, returns response |
| `cy.createRouteViaAPI(routeConfig)` | Create Route (routeConfig must include `service` name or ID) |
| `cy.updateRouteViaAPI(routeId, routeUpdates)` | Update Route |
| `cy.deleteServiceViaAPI(serviceNameOrId)` | Delete Service |
| `cy.deleteRouteViaAPI(routeNameOrId)` | Delete Route |
| `cy.shouldRouteWorksCorrectly(routeURL, options)` | Verify Route returns 200, returns response |
| `cy.shouldRouteNotWorks(routeURL, options)` | Verify Route returns 404/426/5xx, returns response |

### shouldRouteWorksCorrectly / shouldRouteNotWorks Options

Both accept an optional `options` object:

```javascript
{
  method: 'GET',           // HTTP method, default GET
  headers: {},             // Request headers, e.g. { Host: 'api.example.com' }
  https_redirect_status_code: 426  // shouldRouteNotWorks only: expected status for HTTPS upgrade
}
```

**shouldRouteNotWorks** treats these as success: 404, 426, 5xx (500–599). Use `.then((res) => res)` to get the response.

```javascript
// Basic usage
cy.shouldRouteWorksCorrectly('http://localhost:8000/anything');
cy.shouldRouteNotWorks('http://localhost:8000/unknown-path').then((res) => expect(res.status).to.eq(404));

// With options
cy.shouldRouteWorksCorrectly(url, { method: 'POST', headers: { Host: 'api.example.com' } });
cy.shouldRouteNotWorks(url, { headers: { Host: 'api.example.com' } });
```

## Test Flows

### service_route_basic_flow.cy.js
Full UI flow: Create Service → Create Route → Verify Route works → Delete Route → Delete Service → Verify 404.

### route_parameters_match.cy.js
Creates Service and Route via API, verifies `strip_path` behavior:
- strip_path=true: Path stripped before forwarding, request succeeds (200)
- strip_path=false: Path preserved, returns 404/426/5xx when path doesn't match

### route_create.cy.js
Creates Service (API) and Route (UI), verifies Route creation and reachability.

### service_create.cy.js
Creates Gateway Service via UI, verifies creation success.

## Run Scripts

| Script | Platform |
|--------|----------|
| `./run-e2e.sh` | Linux (Ubuntu/Debian) |
| `./run-e2e-mac.sh` | macOS |
| `run-e2e.bat` | Windows |

Scripts: git pull → npm ci → start Kong (Docker) → run tests → stop Docker. Set `SKIP_INSTALL=1` to skip dependency installation on Linux.

## Reports

- **Mochawesome**: `cypress/reports/` (HTML + JSON)
- **Screenshots**: `cypress/screenshots/` (on failure)
- **Videos**: Enable in `cypress.config.js` if needed

## Debugging

Use `.vscode/launch.json` in VS Code to debug Cypress tests. Select the matching debug config and press F5.

## CI (GitHub Actions)

- **Triggers**: `push` and `pull_request` on `main` and `develop`
- **Browsers**: Chrome, Firefox, Edge
- **Flow**: Start Kong via `docker/docker-compose`, run Cypress tests
- **Artifacts**: Reports, screenshots, videos (on failure) uploaded

**Note**: CI requires `docker/` directory and `docker-compose` configuration.

## Notes

- Implement `cy.login()` in `cypress/support/commands.js` if authentication is required
- If selectors use `data-testid`, update `cypress/support/pages/` accordingly
