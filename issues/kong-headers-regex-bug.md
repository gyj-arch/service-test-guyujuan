# Route `headers` field with `~` regex prefix does not match requests under `traditional_compatible` router

## Summary

When using the default `traditional_compatible` router, the route `headers` field with `~` regex prefix is accepted by the Admin API and stored correctly, but the route **never matches any incoming request**. Exact value matching for the same header works correctly.

Additionally, the `expression` field (which could serve as a workaround) is rejected by the Admin API with `schema violation (expression: unknown field)` under `traditional_compatible` mode.

This means **there is no way to perform regex-based header matching** in the default Kong configuration.

## Environment

- **Kong Image:** `kong/kong-gateway` (latest)
- **Deployment:** Docker Compose (PostgreSQL backend)
- **Router Flavor:** `traditional_compatible` (default, not explicitly configured)
- **Kong Config:** `router_flavor` is commented out in `kong.conf.default`, using the default value

Verified via:

```powershell
(Invoke-RestMethod http://localhost:8001/).configuration.router_flavor
# Output: traditional_compatible
```

## Steps to Reproduce

### 1. Create a Service

```bash
curl -X POST http://localhost:8001/default/services \
  -H "Content-Type: application/json" \
  -d '{"name": "test-service", "url": "http://httpbin.org"}'
```

### 2. Create a Route with exact header matching (WORKS)

```bash
curl -X POST http://localhost:8001/default/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-header-route",
    "service": {"name": "test-service"},
    "paths": ["/anything-header-test"],
    "headers": {"x-api-version": ["v1", "v2"]}
  }'
```

### 3. Verify exact match works

```bash
# Returns 200 OK ✅
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v1"

# Returns 200 OK ✅
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v2"

# Returns 404 Not Found ✅ (value not in list)
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v3"

# Returns 404 Not Found ✅ (header not sent)
curl -i http://localhost:8000/anything-header-test
```

### 4. Update route to regex-based matching (BROKEN)

```bash
curl -X PATCH http://localhost:8001/default/routes/test-header-route \
  -H "Content-Type: application/json" \
  -d '{"headers": {"x-api-version": ["~v[0-9]+"]}}'
```

Admin API returns 200 and stores the value correctly:

```bash
curl -s http://localhost:8001/default/routes/test-header-route
# Response includes: "headers": {"x-api-version": ["~v[0-9]+"]}
```

### 5. Verify regex match does NOT work

```bash
# Expected: 200 OK, Actual: 404 Not Found ❌
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v1"

# Expected: 200 OK, Actual: 404 Not Found ❌
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v99"
```

Also tested with anchored regex — same result:

```bash
curl -X PATCH http://localhost:8001/default/routes/test-header-route \
  -H "Content-Type: application/json" \
  -d '{"headers": {"x-api-version": ["~^v[0-9]+$"]}}'

# Still 404 for all requests ❌
curl -i http://localhost:8000/anything-header-test -H "x-api-version: v1"
```

### 6. `expression` field is not available as workaround

```bash
curl -X PATCH http://localhost:8001/default/routes/test-header-route \
  -H "Content-Type: application/json" \
  -d '{"expression": "http.path ^= \"/anything-header-test\" && http.headers.x_api_version ~ \"^v[0-9]+$\""}'
```

Returns 400:

```json
{
  "code": 2,
  "name": "schema violation",
  "message": "schema violation (expression: unknown field)",
  "fields": {"expression": "unknown field"}
}
```

## Expected Behavior

Per [Kong Route documentation](https://docs.konghq.com/gateway/latest/admin-api/#route-object):

> **headers** — Match specific headers. Provide only one entry and prefix with `~` to enable regex-based matching.

The route should match requests where the `x-api-version` header value matches the regex pattern `v[0-9]+` (e.g., `v1`, `v2`, `v99`).

## Actual Behavior

| Configuration | Admin API | Route Matching |
|--------------|-----------|----------------|
| `["v1", "v2"]` (exact) | ✅ Accepted | ✅ Works correctly |
| `["~v[0-9]+"]` (regex) | ✅ Accepted | ❌ Never matches any request |
| `["~^v[0-9]+$"]` (regex with anchors) | ✅ Accepted | ❌ Never matches any request |
| `expression` field | ❌ Rejected: `unknown field` | N/A |

The Admin API accepts and stores the regex value without error, but the router does not evaluate it at request time. The route effectively becomes unreachable once a regex header value is configured.

## Impact

- **No workaround available** — Both the `headers` regex approach and the `expression` field approach fail
- **Silent failure** — Admin API accepts the regex config without warning, giving a false impression that the route is correctly configured
- **Data integrity risk** — Existing working routes can be broken by updating headers to use regex, with no error feedback

## Cleanup

```bash
curl -X DELETE http://localhost:8001/default/routes/test-header-route
curl -X DELETE http://localhost:8001/default/services/test-service
```
