# Kong Gateway Manager E2E Tests

Cypress E2E 測試套件，用於驗證 Kong Gateway Manager 的 Service 與 Route 生命週期：建立、驗證、更新與刪除。支援 UI 操作與 Kong Admin API 操作。

## 前置需求

- **Node.js** 18+
- **Kong Gateway** 運行中（或透過 Docker）
- **Kong Manager** 可訪問（用於 UI 操作）

## 專案結構

```
├── cypress/
│   ├── e2e/                           # 測試規格
│   │   ├── gateway_service/           # Service 相關測試
│   │   │   ├── service_create.cy.js       # 建立 Service（UI）
│   │   │   └── service_new_grid.cy.js      # Service 列表/網格
│   │   ├── route/                     # Route 相關測試
│   │   │   ├── route_create.cy.js         # 建立 Route（API + UI）
│   │   │   └── route_parameters_match.cy.js  # Route 參數（strip_path 等）
│   │   └── service_route_basic_flow.cy.js   # 完整流程：Service → Route → 驗證 → 刪除
│   ├── fixtures/                      # 測試資料
│   │   ├── basicFlow.json             # Service/Route 預設配置
│   │   ├── kongManager.json           # Kong 連線配置
│   │   ├── gatewayService.json
│   │   └── serviceParametersCheck.json
│   ├── support/
│   │   ├── commands.js                # 自訂命令（含 Kong API 命令）
│   │   ├── e2e.js                     # 全域設定、generateRandomId
│   │   ├── services/                  # 業務邏輯
│   │   │   ├── gateway_service_business.js
│   │   │   └── route_business.js
│   │   └── pages/                     # Page Object
│   ├── reports/                       # Mochawesome 報告輸出
│   └── screenshots/                   # 失敗截圖
├── .github/workflows/
│   └── cypress.yaml                   # CI 配置（Chrome、Firefox、Edge）
├── .vscode/
│   └── launch.json                    # VS Code 除錯配置
└── cypress.config.js
```

## 安裝

```bash
npm ci
```

## 配置

### 1. Kong 連線配置

編輯 `cypress/fixtures/kongManager.json`：

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

| 欄位 | 說明 |
|------|------|
| `host` / `port` | Kong Manager UI 位址 |
| `adminPort` | Kong Admin API 埠（建立/刪除 Service、Route） |
| `serverPort` | Kong Proxy 埠（驗證 Route 是否可達） |
| `workspace` | Kong 工作區名稱 |
| `adminURL` | Admin API 完整 URL（優先使用，避免 URL 解析錯誤） |

### 2. Base URL

`cypress.config.js` 已設定 `baseUrl: 'http://localhost:8002'`。若需覆寫，可設定環境變數：

**Windows (PowerShell):**
```powershell
$env:CYPRESS_BASE_URL = 'http://localhost:8002'
```

**Linux/macOS:**
```bash
export CYPRESS_BASE_URL='http://localhost:8002'
```

### 3. 測試資料

`cypress/fixtures/basicFlow.json` 定義預設 Service 與 Route 配置，可依需求調整。

## 執行測試

| 指令 | 說明 |
|------|------|
| `npm run cypress:open` | 開啟 Cypress 互動式執行器 |
| `npm run cypress:run` | 無頭模式執行 |
| `npm run cypress:chrome` | 使用 Chrome 執行 |
| `npm run test:e2e` | 等同 `cypress:run` |
| `npm run test:e2e:report` | 執行並產生 Mochawesome 報告 |
| `npm run test:ci` | CI 模式（JUnit 報告） |

## 自訂命令（Kong API）

`cypress/support/commands.js` 提供以下 Kong Admin API 命令：

| 命令 | 說明 |
|------|------|
| `cy.createServiceViaAPI(serviceConfig)` | 建立 Service，回傳 response |
| `cy.createRouteViaAPI(routeConfig)` | 建立 Route（routeConfig 需含 `service` 名稱或 ID） |
| `cy.updateRouteViaAPI(routeId, routeUpdates)` | 更新 Route |
| `cy.deleteServiceViaAPI(serviceNameOrId)` | 刪除 Service |
| `cy.deleteRouteViaAPI(routeNameOrId)` | 刪除 Route |
| `cy.shouldRouteWorksCorrectly(routeURL, options)` | 驗證 Route 回傳 200，回傳 response |
| `cy.shouldRouteNotWorks(routeURL, options)` | 驗證 Route 回傳 404/426/5xx，回傳 response |

### shouldRouteWorksCorrectly / shouldRouteNotWorks 參數

兩者皆接受 `options` 物件（可選）：

```javascript
{
  method: 'GET',           // HTTP 方法，預設 GET
  headers: {},              // 請求頭，如 { Host: 'api.example.com' }
  https_redirect_status_code: 426  // 僅 shouldRouteNotWorks：HTTPS 升級時預期狀態碼
}
```

**shouldRouteNotWorks** 視為成功的狀態碼：404、426、5xx（500–599）。可透過 `.then((res) => res)` 取得 response。

```javascript
// 基本用法
cy.shouldRouteWorksCorrectly('http://localhost:8000/anything');
cy.shouldRouteNotWorks('http://localhost:8000/unknown-path').then((res) => expect(res.status).to.eq(404));

// 帶 options
cy.shouldRouteWorksCorrectly(url, { method: 'POST', headers: { Host: 'api.example.com' } });
cy.shouldRouteNotWorks(url, { headers: { Host: 'api.example.com' } });
```

## 測試流程

### service_route_basic_flow.cy.js
完整 UI 流程：建立 Service → 建立 Route → 驗證 Route 可達 → 刪除 Route → 刪除 Service → 驗證 404。

### route_parameters_match.cy.js
透過 API 建立 Service 與 Route，驗證 `strip_path` 行為：
- strip_path=true：路徑被移除後轉發，請求可達（200）
- strip_path=false：路徑保留，請求不匹配路徑時回傳 404/426/5xx

### route_create.cy.js
建立 Service（API）與 Route（UI），驗證 Route 建立成功並可達。

### service_create.cy.js
透過 UI 建立 Gateway Service，驗證建立成功。

## 報告

- **Mochawesome**：`cypress/reports/`（HTML + JSON）
- **截圖**：`cypress/screenshots/`（失敗時）
- **影片**：可在 `cypress.config.js` 中啟用

## 除錯

使用 `.vscode/launch.json` 在 VS Code 中除錯 Cypress 測試。選擇對應的除錯配置後按 F5。

## CI（GitHub Actions）

- **觸發**：`main`、`develop` 的 `push` 與 `pull_request`
- **瀏覽器**：Chrome、Firefox、Edge
- **流程**：透過 `docker/docker-compose` 啟動 Kong，執行 Cypress 測試
- **產物**：報告、截圖、影片（失敗時）上傳為 Artifact

**注意**：CI 需要 `docker/` 目錄與 `docker-compose` 配置。

## 備註

- 若需登入，可在 `cypress/support/commands.js` 實作 `cy.login()`
- 選擇器若使用 `data-testid`，請在 `cypress/support/pages/` 中同步更新
