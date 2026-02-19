import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET — list all users (profiles)
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data ?? [],
        count: data?.length ?? 0,
      });
    }

    // POST — create a new user with email + password
    if (req.method === "POST") {
      const { email, password, role = "support" } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
      }

      if (!["admin", "support"].includes(role)) {
        return res.status(400).json({ success: false, error: "Role must be 'admin' or 'support'" });
      }

      // Create user directly — no email required
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        return res.status(400).json({ success: false, error: authError.message });
      }

      // Upsert profile with correct role
      if (authData?.user?.id) {
        await supabase
          .from("profiles")
          .upsert({ id: authData.user.id, email, role });
      }

      return res.status(201).json({
        success: true,
        message: `User ${email} created successfully`,
        data: { id: authData?.user?.id, email, role },
      });
    }

    return res.status(405).json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export default withApiGate("users.list", withAuth("admin")(handler));
