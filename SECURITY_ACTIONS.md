# Security Priority Action List

Tracked from the initial code audit. Update status as items are resolved.

---

## Status Key
- ✅ Done
- 🔒 Mitigated (partial / temporary)
- ⏳ In Progress
- ❌ Not Started

---

## Priority Actions

### CRITICAL

| # | Status | Item | Notes |
|---|--------|------|-------|
| 1 | 🔒 | **Rotate the Supabase anon key** in Supabase dashboard | Code fixed: `src/integrations/supabase/client.ts` now reads from env vars. `.env.local` created (git-ignored). **Key still needs to be rotated in Supabase dashboard** because the old key remains in git history. |
| 2 | 🔒 | **Add authentication middleware** to all API routes | All 13 endpoints are now quarantined by default (see [`API_QUARANTINE.md`](API_QUARANTINE.md) and [`src/lib/apiGate.ts`](src/lib/apiGate.ts)). This blocks unauthorized access temporarily. Replace with proper session-based or JWT auth before opening any endpoint in production. |

### HIGH

| # | Status | Item | Notes |
|---|--------|------|-------|
| 3 | ❌ | **Enable RLS (Row Level Security)** on all Supabase tables | Without RLS, anyone with the anon key has unrestricted DB access. Enable in Supabase dashboard → Table Editor → RLS for each table: `sim_cards`, `providers`, `devices`, `customers`, `installations`, `status_history`, `daily_burden_log`. |
| 4 | ❌ | **Validate all request bodies with `zod`** | `zod` is already a dependency. Routes that accept `req.body` directly without schema validation: `sim-cards/index.ts` (POST), `sim-cards/[id].ts` (PUT), `providers/index.ts` (POST), `providers/[id].ts` (PUT). |
| 5 | ❌ | **Replace `Math.random()` with `crypto.randomUUID()`** | Affects: `src/services/simService.ts`, `src/pages/customers/index.tsx`, `src/pages/devices/index.tsx`. |
| 6 | ❌ | **Wrap all `JSON.parse()` calls in try/catch** | Malformed localStorage data will crash the app. Affects: `src/services/simService.ts`, `src/services/providerService.ts`, `src/pages/customers/index.tsx`, `src/pages/devices/index.tsx`. |

### MEDIUM

| # | Status | Item | Notes |
|---|--------|------|-------|
| 7 | ❌ | **Add HTTP security headers** in `next.config.mjs` | Missing: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Referrer-Policy`, `Content-Security-Policy`. |
| 8 | ❌ | **Run `npm audit` and patch vulnerable dependencies** | `xlsx@0.18.5` has known CVEs (ReDoS, prototype pollution). Also check `stripe`, `next`, and `@supabase/supabase-js`. |
| 9 | ❌ | **Gate detailed error messages behind `NODE_ENV`** | API routes return raw `error.message` to clients in production. Wrap with: `...(process.env.NODE_ENV === 'development' && { details: error.message })`. |

### LOW

| # | Status | Item | Notes |
|---|--------|------|-------|
| 10 | ❌ | **Restrict image `remotePatterns`** in `next.config.mjs` | Currently allows `hostname: "**"` (any domain). Whitelist only needed hostnames. |
| 11 | ❌ | **Move `allowedDevOrigins` to env vars** | `*.daytona.work` and `*.softgen.dev` are hardcoded in `next.config.mjs`. |
| 12 | ❌ | **Replace `any` types** | `user_metadata?: any` in `src/services/authService.ts`, `data: any[]` in `src/pages/executive-summary.tsx`. |

---

## Completion Checklist

```
[~] 1. Credentials moved to .env.local ✓ — still need to ROTATE key in Supabase dashboard
[~] 2. Auth middleware — quarantine gate active, full auth still needed
[ ] 3. Enable RLS on all Supabase tables
[ ] 4. Add zod validation to all POST/PUT bodies
[ ] 5. Replace Math.random() with crypto.randomUUID()
[ ] 6. Wrap JSON.parse() calls in try/catch
[ ] 7. Add HTTP security headers to next.config.mjs
[ ] 8. Run npm audit + patch xlsx and other vulnerable packages
[ ] 9. Gate error.message behind NODE_ENV check
[ ] 10. Restrict image remotePatterns
[ ] 11. Move dev origins to env vars
[ ] 12. Replace any types
```

---

## Related Files

| File | Purpose |
|------|---------|
| [`API_QUARANTINE.md`](API_QUARANTINE.md) | How to open/close individual API endpoints |
| [`src/lib/apiGate.ts`](src/lib/apiGate.ts) | Quarantine gate registry and wrapper |
| [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts) | Now reads from env vars — no longer hardcoded |
| [`.env.local`](.env.local) | Local credentials file — git-ignored, never commit this |
| [`next.config.mjs`](next.config.mjs) | Security headers + image patterns — action items #7, #10, #11 |
