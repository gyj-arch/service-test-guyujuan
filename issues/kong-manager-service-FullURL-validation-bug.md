# Kong Manager UI does not validate invalid Service URL before submission

## Summary

When creating a new Gateway Service via Kong Manager UI, the **Full URL** field does not perform client-side validation on the input. If a user enters a malformed URL (e.g., `http:/api.example.com` — missing a slash), the form submits successfully to the Admin API, which then returns a confusing error message:

> `schema violation (host: required field missing)`

This is a **two-layer bug**:

1. **Frontend**: No URL format validation before submission
2. **Backend error message**: The error `host: required field missing` does not accurately describe the problem — the real issue is that the URL is malformed and cannot be parsed into `protocol`, `host`, `port`, and `path` components

## Environment

- **Kong Image:** `kong/kong-gateway` (latest)
- **Deployment:** Docker Compose (PostgreSQL backend)
- **Browser:** Chrome (also reproducible in Edge, Firefox)
- **Kong Manager URL:** `http://localhost:8002`

## Steps to Reproduce

### 1. Open Kong Manager and navigate to "New Gateway Service"

Go to **Gateway Services** → **New Gateway Service**.

### 2. Select "Full URL" mode (default)

The **Full URL** radio option is selected by default under "Service endpoint."

### 3. Enter an invalid URL

Type a malformed URL in the **Full URL** field:

```
http:/api.example.com
```

> Note: This URL is missing the second slash after `http:` — the correct format should be `http://api.example.com`.

### 4. Fill in a service name

Enter any name, e.g., `new-service`.

### 5. Click "Save"

The form submits without any client-side validation warning.

### 6. Observe the error

A red error banner appears at the bottom of the page:

> **schema violation (host: required field missing)**

## Screenshot

![Kong Manager URL Validation Bug](kong-manager-url-validation-bug.png)

## Expected Behavior

### Option A: Frontend validation (preferred)

The UI should validate the URL format before submission. When an invalid URL is entered, the **Full URL** field should:

- Display an inline validation error (e.g., red border + message like "Invalid URL format")
- Prevent form submission until the URL is corrected

Standard URL validation should catch at minimum:

| Input | Valid | Reason |
|-------|-------|--------|
| `http://api.example.com` | Yes | Correct format |
| `https://api.example.com:8080/v1` | Yes | Correct format with port and path |
| `http:/api.example.com` | **No** | Missing `//` after scheme |
| `api.example.com` | **No** | Missing scheme (`http://` or `https://`) |
| `://api.example.com` | **No** | Missing scheme name |
| *(empty)* | **No** | Required field |

### Option B: Improved backend error (fallback)

If frontend validation is not feasible, the backend error message should be more descriptive:

- **Current:** `schema violation (host: required field missing)`
- **Suggested:** `Invalid URL format: unable to parse host from the provided URL. Please use a valid URL (e.g., http://example.com)`

## Actual Behavior

| Step | Expected | Actual |
|------|----------|--------|
| Enter `http:/api.example.com` in Full URL | Inline validation error shown | No validation, field appears valid |
| Click Save | Form blocked by validation | Form submits to Admin API |
| Error response | Clear error about invalid URL | Confusing error: `host: required field missing` |

The form gives no visual indication that the URL is malformed. The error message returned after submission refers to a missing `host` field, which is technically an internal schema field — not something the user directly interacts with in "Full URL" mode. This creates confusion because:

1. The user never sees a "host" field (it is hidden behind the "Full URL" abstraction)
2. The user may think the issue is with the **Name** or another field
3. The user has no guidance on *what* is wrong with the URL they entered

## Equivalent Admin API Behavior

For reference, the same error occurs when calling the Admin API directly with a malformed URL:

```bash
curl -X POST http://localhost:8001/default/services \
  -H "Content-Type: application/json" \
  -d '{"name": "new-service", "url": "http:/api.example.com"}'
```

Response:

```json
{
  "code": 2,
  "name": "schema violation",
  "message": "schema violation (host: required field missing)",
  "fields": {
    "host": "required field missing"
  }
}
```

The backend correctly rejects the request, but the error message is misleading — the root cause is a malformed URL, not a missing host field.

## Impact

- **User confusion** — The error message does not point to the actual problem (malformed URL), leading users to look for a "host" field that doesn't exist in Full URL mode
- **Poor UX** — No real-time feedback while typing; errors only appear after a round-trip to the server
- **Inconsistent validation** — Other Kong Manager forms (e.g., Route creation) may perform client-side validation, making this omission feel like a gap

## Suggested Fix

1. **Add client-side URL validation** to the Full URL input field using standard URL parsing (e.g., `new URL(input)` in JavaScript) before allowing form submission
2. **Improve the backend error message** to surface the actual root cause when URL parsing fails, rather than exposing internal schema field names
