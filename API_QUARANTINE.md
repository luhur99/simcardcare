# API Quarantine Gate

All API endpoints are **blocked by default**. To enable an endpoint, flip its flag in the registry.

---

## How to Open / Close an Endpoint

Edit [`src/lib/apiGate.ts`](src/lib/apiGate.ts) and set `enabled: true` for the endpoint you want to open:

```ts
// QUARANTINED (default)
"sim-cards.list": { enabled: false, description: "GET/POST /api/sim-cards" },

// OPEN
"sim-cards.list": { enabled: true,  description: "GET/POST /api/sim-cards" },
```

Save the file. Changes take effect immediately (hot-reload in dev, redeploy in production).

---

## Endpoint Registry

| Key | Route | Methods | Status |
|-----|-------|---------|--------|
| `sim-cards.list` | `/api/sim-cards` | GET, POST | 🔒 Quarantined |
| `sim-cards.detail` | `/api/sim-cards/[id]` | GET, PUT, DELETE | 🔒 Quarantined |
| `sim-cards.stats` | `/api/sim-cards/stats` | GET | 🔒 Quarantined |
| `sim-cards.activate` | `/api/sim-cards/actions/activate` | POST | 🔒 Quarantined |
| `sim-cards.install` | `/api/sim-cards/actions/install` | POST | 🔒 Quarantined |
| `sim-cards.grace-period` | `/api/sim-cards/actions/grace-period` | POST | 🔒 Quarantined |
| `providers.list` | `/api/providers` | GET, POST | 🔒 Quarantined |
| `providers.detail` | `/api/providers/[id]` | GET, PUT, DELETE | 🔒 Quarantined |
| `providers.toggle` | `/api/providers/[id]/toggle-status` | POST | 🔒 Quarantined |
| `devices.list` | `/api/devices` | GET, POST | 🔒 Quarantined |
| `calculations.burden` | `/api/calculations/daily-burden` | POST | 🔒 Quarantined |
| `calculations.logs` | `/api/calculations/burden-logs` | GET | 🔒 Quarantined |
| `hello` | `/api/hello` | GET | 🔒 Quarantined |

> **Note:** Update the Status column above whenever you open or close an endpoint.

---

## Response When Quarantined

Any request to a blocked endpoint returns:

```json
HTTP 503 Service Unavailable

{
  "success": false,
  "error": "This API endpoint is currently quarantined.",
  "endpoint": "sim-cards.list",
  "description": "GET/POST /api/sim-cards"
}
```

---

## Files Involved

| File | Purpose |
|------|---------|
| [`src/lib/apiGate.ts`](src/lib/apiGate.ts) | Registry + `withApiGate` wrapper — **the only file you need to edit** |
| `src/pages/api/sim-cards/index.ts` | Wrapped with `sim-cards.list` |
| `src/pages/api/sim-cards/[id].ts` | Wrapped with `sim-cards.detail` |
| `src/pages/api/sim-cards/stats.ts` | Wrapped with `sim-cards.stats` |
| `src/pages/api/sim-cards/actions/activate.ts` | Wrapped with `sim-cards.activate` |
| `src/pages/api/sim-cards/actions/install.ts` | Wrapped with `sim-cards.install` |
| `src/pages/api/sim-cards/actions/grace-period.ts` | Wrapped with `sim-cards.grace-period` |
| `src/pages/api/providers/index.ts` | Wrapped with `providers.list` |
| `src/pages/api/providers/[id].ts` | Wrapped with `providers.detail` |
| `src/pages/api/providers/[id]/toggle-status.ts` | Wrapped with `providers.toggle` |
| `src/pages/api/devices/index.ts` | Wrapped with `devices.list` |
| `src/pages/api/calculations/daily-burden.ts` | Wrapped with `calculations.burden` |
| `src/pages/api/calculations/burden-logs.ts` | Wrapped with `calculations.logs` |
| `src/pages/api/hello.ts` | Wrapped with `hello` |

---

## Adding a New Endpoint

1. Add a new key to `apiRegistry` in `src/lib/apiGate.ts`:
   ```ts
   "my-feature.action": { enabled: false, description: "POST /api/my-feature/action" },
   ```
2. In the new route file, use the wrapper:
   ```ts
   import { withApiGate } from "@/lib/apiGate";

   async function handler(req, res) {
     // your logic
   }

   export default withApiGate("my-feature.action", handler);
   ```
3. Add a row to the registry table in this file.

---

> This gate is an **interim security measure**. The next step is to replace or supplement it with proper authentication middleware.
