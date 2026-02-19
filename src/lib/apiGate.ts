import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * API Quarantine Gate
 *
 * All endpoints are BLOCKED by default (enabled: false).
 * To open an endpoint, set its `enabled` flag to `true`.
 * To re-quarantine, set it back to `false`.
 *
 * Changes take effect immediately on the next request (hot-reload in dev,
 * redeploy in production).
 *
 * Note: Core business endpoints are now enabled=true because authentication
 * is enforced by the withAuth() middleware on each route.
 * See API_QUARANTINE.md for full documentation.
 */
export const apiRegistry = {
  // ── SIM Cards ─────────────────────────────────────────────────────────────
  "sim-cards.list":         { enabled: true, description: "GET/POST  /api/sim-cards" },
  "sim-cards.detail":       { enabled: true, description: "GET/PUT/DELETE /api/sim-cards/[id]" },
  "sim-cards.stats":        { enabled: true, description: "GET       /api/sim-cards/stats" },
  "sim-cards.activate":     { enabled: true, description: "POST      /api/sim-cards/actions/activate" },
  "sim-cards.install":      { enabled: true, description: "POST      /api/sim-cards/actions/install" },
  "sim-cards.grace-period": { enabled: true, description: "POST      /api/sim-cards/actions/grace-period" },

  // ── Providers ─────────────────────────────────────────────────────────────
  "providers.list":         { enabled: true, description: "GET/POST  /api/providers" },
  "providers.detail":       { enabled: true, description: "GET/PUT/DELETE /api/providers/[id]" },
  "providers.toggle":       { enabled: true, description: "POST      /api/providers/[id]/toggle-status" },

  // ── Devices ───────────────────────────────────────────────────────────────
  "devices.list":           { enabled: true, description: "GET/POST  /api/devices" },

  // ── Calculations ──────────────────────────────────────────────────────────
  "calculations.burden":    { enabled: true, description: "POST      /api/calculations/daily-burden" },
  "calculations.logs":      { enabled: true, description: "GET       /api/calculations/burden-logs" },

  // ── Auth ──────────────────────────────────────────────────────────────────
  "auth.me":                { enabled: true, description: "GET       /api/auth/me" },

  // ── User Management (admin only) ──────────────────────────────────────────
  "users.list":             { enabled: true, description: "GET/POST  /api/users" },
  "users.detail":           { enabled: true, description: "PUT/DELETE /api/users/[id]" },

  // ── Misc ──────────────────────────────────────────────────────────────────
  "hello":                  { enabled: false, description: "GET       /api/hello" },
} as const;

export type ApiKey = keyof typeof apiRegistry;

/**
 * Wraps a Next.js API handler with a quarantine check.
 *
 * Usage:
 *   export default withApiGate("sim-cards.list", withAuth()(handler));
 */
export function withApiGate(key: ApiKey, handler: NextApiHandler): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    if (!apiRegistry[key].enabled) {
      return res.status(503).json({
        success: false,
        error: "This API endpoint is currently quarantined.",
        endpoint: key,
        description: apiRegistry[key].description,
      });
    }
    return handler(req, res);
  };
}
