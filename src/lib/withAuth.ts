import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

/**
 * API Authentication Middleware
 *
 * Validates the Bearer token from the Authorization header.
 * Attaches req.user and req.userRole for downstream handlers.
 *
 * Usage:
 *   withAuth()(handler)           — any authenticated user
 *   withAuth('admin')(handler)    — admin only
 *   withAuth('support')(handler)  — support or admin
 */
export function withAuth(requiredRole?: "admin" | "support") {
  return (handler: NextApiHandler): NextApiHandler =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ success: false, error: "Unauthorized – no token provided" });
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ success: false, error: "Unauthorized – invalid or expired token" });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role as "admin" | "support" | undefined;

      if (requiredRole === "admin" && userRole !== "admin") {
        return res.status(403).json({ success: false, error: "Forbidden – admin access required" });
      }

      // Attach to request for use in handler
      (req as any).user     = user;
      (req as any).userRole = userRole;

      return handler(req, res);
    };
}
