# Kong Gateway Manager E2E Tests

Cypress E2E test suite for validating Kong Gateway Manager's Service and Route lifecycle: create, verify, update, and delete. Covers both Kong Manager UI operations and Kong Admin API operations.

## Prerequisites

- **Node.js** 18+
- **Docker Desktop** (or Docker + Docker Compose)
- **Kong Gateway** running locally (via Docker or standalone)
- **Kong Manager** accessible at `http://localhost:8002`

## Project Structure

```
├── cypress/
│   ├── e2e/                              # Test specs
│   │   ├── gateway_service/              # Service tests
│   │   │   ├── service_create.cy.js          # Create Service via UI (full URL & separate components)
│   │   │   └── service_new_grid.cy.js        # Verify Service creation page parameters
│   │   ├── route/                        # Route tests
│   │   │   ├── route_create.cy.js            # Create Route via UI (basic, advanced, from service detail)
│   │   │   └── route_parameters_match.cy.js  # Route parameter behavior (strip_path, methods, hosts, protocols, preserve_host, https_redirect, headers)
│   │   └── service_route/                # Combined Service + Route tests
│   │       ├── service_route_basic_flow.cy.js    # Full lifecycle: create → verify → delete → confirm 404
│   │       └── multi_services_routes.cy.js       # Bulk creation (20 services), partial deletion, verification
│   ├── fixtures/                         # Test data
│   │   ├── basicFlow.json                    # Default Service/Route config
│   │   ├── kongManager.json                  # Kong connection config
│   │   └── serviceParametersCheck.json       # Service creation page parameter validation data
│   ├── support/
│   │   ├── commands.js                       # Custom Cypress commands (Kong Admin API wrappers)
│   │   ├── e2e.js                            # Global setup, error handling, utilities, after-spec cleanup
│   │   ├── services/                         # Business logic layer
│   │   │   ├── gateway_service_business.js       # Service operations (create, delete, navigate, verify)
│   │   │   └── route_business.js                 # Route operations (create, delete, navigate, verify)
│   │   └── pages/                            # Page Object Model
│   │       ├── gateway_service_main_page.js      # Service list page
│   │       ├── gateway_service_new_page.js       # Service creation page
│   │       ├── gateway_service_detail_page.js    # Service detail page
│   │       ├── route_main_page.js                # Route list page
│   │       ├── route_new_page.js                 # Route creation page
│   │       └── route_detail_page.js              # Route detail page
│   ├── reports/                          # Mochawesome HTML/JSON reports
│   └── screenshots/                      # Failure screenshots
├── docker/
│   └── docker-compose.yml                # Kong + PostgreSQL Docker setup
├── .github/workflows/
│   └── cypress.yaml                      # CI config (Chrome, Firefox, Edge)
├── issues/                              # Bug reports for Kong
│   ├── kong-headers-regex-bug.md            # Route headers regex matching bug
│   ├── kong-headers-regex-bug.png           # Screenshot for headers regex bug
│   ├── kong-manager-service-FullURL-validation-bug.md  # Service URL validation bug
│   └── kong-manager-FullURL-validation-bug.png          # Screenshot for URL validation bug
├── run-e2e.sh                            # One-click run script (Linux)
├── run-e2e-mac.sh                        # One-click run script (macOS)
├── run-e2e.bat                           # One-click run script (Windows)
├── cypress.config.js                     # Cypress configuration
└── package.json
```

## Quick Start

### Option 1: One-Click Run Scripts

These scripts handle everything: git pull, npm install, start Kong via Docker, run tests, and stop Docker.

**Linux (Ubuntu/Debian):**
```bash
chmod +x run-e2e.sh
./run-e2e.sh
```

**macOS:**
```bash
chmod +x run-e2e-mac.sh
./run-e2e-mac.sh
```

**Windows:**
```cmd
run-e2e.bat
```

All scripts support `--spec` and `--browser` options (see [Run Scripts](#run-scripts) for details).

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm ci

# 2. Start Kong via Docker
cd docker && docker compose up -d && cd ..

# 3. Wait for Kong to be ready
curl http://localhost:8001/status

# 4. Run tests
npx cypress run

# 5. Stop Kong when done
cd docker && docker compose down && cd ..
```

## Configuration

### Kong Connection Config

Edit `cypress/fixtures/kongManager.json`:

```json
{
  "host": "localhost",
  "port": 8002,
  "serverPort": 8000,
  "adminPort": 8001,
  "httpsServerPort": 8443,
  "httpsAdminPort": 8444,
  "protocol": "http",
  "workspace": "default",
  "serverBaseURL": "http://localhost:8002",
  "adminURL": "http://localhost:8001",
  "httpsServerBaseURL": "https://localhost:8443",
  "httpsAdminURL": "https://localhost:8444"
}
```

| Field | Description |
|-------|-------------|
| `host` / `port` | Kong Manager UI address |
| `adminPort` | Kong Admin API port (for CRUD operations on Services and Routes) |
| `serverPort` | Kong Proxy port (for verifying Route reachability) |
| `httpsServerPort` | Kong HTTPS Proxy port (for protocol-related tests) |
| `httpsAdminPort` | Kong HTTPS Admin API port |
| `workspace` | Kong workspace name |
| `adminURL` | Admin API full URL (preferred over host:port composition) |

### Base URL

`cypress.config.js` sets `baseUrl: 'http://localhost:8002'` (Kong Manager UI). To override:

**Windows (PowerShell):**
```powershell
$env:CYPRESS_BASE_URL = 'http://your-kong-manager:8002'
```

**Linux/macOS:**
```bash
export CYPRESS_BASE_URL='http://your-kong-manager:8002'
```

### Test Data

`cypress/fixtures/basicFlow.json` defines the default Service and Route configuration used across tests. Adjust upstream URL, paths, hosts, methods, etc. as needed.

## Running Tests

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run cypress:open` | Open Cypress interactive runner (GUI) |
| `npm run cypress:run` | Run all tests headless (Electron) |
| `npm run cypress:chrome` | Run all tests with Chrome |
| `npm run test:e2e` | Alias for `cypress:run` |
| `npm run test:e2e:report` | Run with Mochawesome HTML report |
| `npm run test:ci` | CI mode with JUnit XML report |

### Run Specific Tests

```bash
# Single spec file
npx cypress run --spec "cypress/e2e/route/route_create.cy.js"

# All specs in a folder
npx cypress run --spec "cypress/e2e/gateway_service/*.cy.js"

# Multiple spec files
npx cypress run --spec "cypress/e2e/route/route_create.cy.js,cypress/e2e/route/route_parameters_match.cy.js"

# With a specific browser
npx cypress run --spec "cypress/e2e/route/*.cy.js" --browser chrome
```

### Run Scripts

All run scripts accept `--spec` and `--browser` flags, and support `--help` for usage info.

| Script | Platform | Description |
|--------|----------|-------------|
| `./run-e2e.sh` | Linux (Ubuntu/Debian) | Full setup including dependency installation |
| `./run-e2e-mac.sh` | macOS | Requires Docker Desktop pre-installed |
| `run-e2e.bat` | Windows | Requires Docker Desktop pre-installed |

**Examples:**

```bash
# Show help
./run-e2e.sh --help

# Run all tests (default browser)
./run-e2e.sh

# Run a single spec file
./run-e2e.sh --spec "cypress/e2e/route/route_create.cy.js"

# Run all route tests with Chrome
./run-e2e.sh --spec "cypress/e2e/route/*.cy.js" --browser chrome

# Combine spec and browser
./run-e2e-mac.sh --spec "cypress/e2e/service_route/*.cy.js" --browser firefox

# Windows: run with Edge
run-e2e.bat --spec "cypress/e2e/gateway_service/service_create.cy.js" --browser edge

# Linux: skip dependency installation (environment already set up)
SKIP_INSTALL=1 ./run-e2e.sh --spec "cypress/e2e/route/route_create.cy.js"
```

## Test Suites

### Gateway Service Tests

#### `service_create.cy.js`
Creates Gateway Services via the Kong Manager UI and verifies creation through the Admin API.
- **create gateway service with full url** — Fills in a full upstream URL, verifies creation, and toggles the service enabled/disabled status.
- **create gateway service with separate url component** — Fills in protocol, host, port, and path separately, then verifies creation.

#### `service_new_grid.cy.js`
Validates that the Service creation page displays the correct form fields and parameters.

### Route Tests

#### `route_create.cy.js`
Creates Routes via the Kong Manager UI from different entry points and verifies reachability. Service is created via API, Route via UI.
- **create basic route from routes page** — Creates a basic Route from the Routes list page, verifies it appears in the list and works (200).
- **verify the service cannot be deleted with routes** — Attempts to delete a Service that still has Routes, verifies the error message is shown, then cancels.
- **create advanced route from routes page** — Creates a Route with multiple paths, hosts, and protocol settings, verifies each path/host combination works.
- **create two routes for a service from service detail page** — Creates a Service via UI, then adds two Routes from the Service detail page, verifies both work.

#### `route_parameters_match.cy.js`
Validates Route parameter behaviors via the Admin API. All Routes are created programmatically.
- **strip_path** — Verifies `strip_path=false` preserves the route path prefix; `strip_path=true` strips it before forwarding upstream.
- **methods** — Verifies Route only accepts configured HTTP methods (GET, POST) and rejects others (PUT).
- **hosts** — Verifies Route matches only configured host headers and rejects unmatched hosts.
- **protocols** — Verifies Route works over HTTP and HTTPS; removing HTTP returns 426 Upgrade Required.
- **https_redirect_status_code** — Cycles through 426, 301, 302, 307, 308 and verifies correct redirect status and headers (Location header, Connection: Upgrade).
- **preserve_host** — Verifies `preserve_host=true` forwards the client Host header to upstream; `preserve_host=false` replaces it.
- **headers** — Verifies Route matches only when the specified header is present with the correct value. Tests exact matching (`x-api-version: v1`, `v2`), regex-based matching (`~v[0-9]+`), and header switching (`x-region: us-east`, `eu-west`). See [Known Issues](#known-issues) for regex matching limitations.

### Combined Service + Route Tests

#### `service_route_basic_flow.cy.js`
Full UI lifecycle test:
1. Create a Gateway Service via UI
2. Create a Route via UI
3. Verify the Route works (200 OK)
4. Delete the Route via UI
5. Delete the Service via UI
6. Verify the Route returns 404

#### `multi_services_routes.cy.js`
Bulk creation and partial deletion test via Admin API.
- **create 20 services, each service has a route** — Creates 20 Service/Route pairs and verifies each Route returns 200 immediately after creation.
- **should all routes work correctly** — Re-verifies all 20 Routes still return 200.
- **delete 5 routes, verify deleted routes stop working and remaining routes still work** — Deletes 5 Routes, verifies they return 404/426/5xx, then verifies the remaining 15 Routes still return 200.

## Custom Commands (Kong Admin API)

Defined in `cypress/support/commands.js`:

| Command | Description |
|---------|-------------|
| `cy.createServiceViaAPI(serviceConfig)` | Create a Service; returns response (`res.body.id` for service ID) |
| `cy.deleteServiceViaAPI(serviceNameOrId)` | Delete a Service (204 on success) |
| `cy.createRouteViaAPI(routeConfig)` | Create a Route (`routeConfig` must include `name` and `service`; supports `headers` for header matching) |
| `cy.updateRouteViaAPI(routeNameOrId, updates)` | PATCH update a Route |
| `cy.deleteRouteViaAPI(routeNameOrId)` | Delete a Route (204 on success) |
| `cy.shouldRouteWorksCorrectly(url, options)` | Retry until Route returns 200 (3-min timeout) |
| `cy.shouldRouteNotWorks(url, options)` | Retry until Route returns 404/426/5xx (3-min timeout) |
| `cy.get(selector).getText()` | Child command; returns trimmed text of one element or array of texts for multiple elements |

### `shouldRouteWorksCorrectly` / `shouldRouteNotWorks` Options

```javascript
{
  method: 'GET',           // HTTP method (default: GET)
  headers: {},             // Request headers, e.g. { Host: 'api.example.com' }
}
```

Both commands use `cypress-recurse` to retry with a 5-second interval for up to 3 minutes. This handles the propagation delay after Route creation or update.

**Examples:**

```javascript
// Verify a route returns 200
cy.shouldRouteWorksCorrectly('http://localhost:8000/anything');

// Verify with specific method and headers
cy.shouldRouteWorksCorrectly(url, { method: 'POST', headers: { Host: 'api.example.com' } });

// Verify a route is unreachable (404/426/5xx)
cy.shouldRouteNotWorks('http://localhost:8000/deleted-path');

// Chain to inspect the response
cy.shouldRouteNotWorks(url).then((res) => {
  expect(res.status).to.eq(404);
});
```

## Architecture

```
Test Spec (.cy.js)
    │
    ├── Business Layer (services/)
    │   ├── GatewayServiceBusiness   — orchestrates Service UI flows
    │   └── RouteBusiness            — orchestrates Route UI flows
    │       │
    │       └── Page Object Layer (pages/)
    │           ├── GatewayServiceMainPage / NewPage / DetailPage
    │           └── RouteMainPage / NewPage / DetailPage
    │
    └── Custom Commands (commands.js)
        └── Kong Admin API wrappers (create, update, delete, verify)
```

- **Page Objects** encapsulate UI selectors and low-level interactions.
- **Business Layer** composes page object methods into meaningful workflows (e.g., "create a service with full URL" = navigate + fill form + submit + verify).
- **Custom Commands** provide reusable Kong Admin API operations available in any test via `cy.<command>()`.

## Global Utilities and Cleanup

Defined in `cypress/support/e2e.js` and available in all tests:

| Function | Description |
|----------|-------------|
| `generateRandomId()` | Returns a unique string like `1710736543210-8321` (timestamp + random digits) |
| `generateUUID()` | Returns an 8-character hex string from `crypto.randomUUID()` |

### Automatic After-Spec Cleanup

A global `after()` hook runs after each spec file completes. It reads the name prefixes from `cypress/fixtures/basicFlow.json` (`service.name` and `route.name`), then deletes all Routes and Services whose names start with those prefixes via the Kong Admin API. This ensures leftover test data does not accumulate across runs, even if individual tests fail before their own `after()` hooks execute.

## Reports

| Type | Location | Generated By |
|------|----------|-------------|
| Mochawesome HTML | `cypress/reports/` | `npm run test:e2e:report` |
| JUnit XML | `cypress/reports/junit/` | `npm run test:ci` |
| Screenshots | `cypress/screenshots/` | Automatic on test failure |
| Videos | `cypress/videos/` | Enable `video: true` in `cypress.config.js` |

## CI (GitHub Actions)

Configured in `.github/workflows/cypress.yaml`:

- **Triggers**: `push` and `pull_request` on `main` and `test`
- **Browsers**: Chrome, Firefox, Edge (matrix strategy)
- **Flow**: Start Kong via `docker/docker-compose.yml` → run Cypress tests → upload artifacts
- **Artifacts**: Reports, screenshots, and videos (on failure) are uploaded

## Known Issues

Bug reports are stored in the `issues/` directory.

| Issue | File | Screenshot |
|-------|------|------------|
| Route `headers` regex matching (`~` prefix) does not work under `traditional_compatible` router | [`kong-headers-regex-bug.md`](issues/kong-headers-regex-bug.md) | [`kong-headers-regex-bug.png`](issues/kong-headers-regex-bug.png) |
| Kong Manager UI does not validate invalid Service Full URL before submission | [`kong-manager-service-FullURL-validation-bug.md`](issues/kong-manager-service-FullURL-validation-bug.md) | [`kong-manager-FullURL-validation-bug.png`](issues/kong-manager-FullURL-validation-bug.png) |

## Notes

- Implement `cy.login()` in `cypress/support/commands.js` if Kong Manager requires authentication.
- Page objects use CSS selectors; update `cypress/support/pages/` if selectors change across Kong versions.
- The `chromeWebSecurity: false` setting in `cypress.config.js` allows cross-origin requests during tests.
