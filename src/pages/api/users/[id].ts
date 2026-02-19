import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Invalid user ID" });
  }

  // Prevent admin from demoting or deleting themselves
  const currentUser = (req as any).user;
  if (currentUser?.id === id && req.method === "DELETE") {
    return res.status(400).json({ success: false, error: "Cannot delete your own account" });
  }

  try {
    // PUT — update role
    if (req.method === "PUT") {
      const { role } = req.body;

      if (!["admin", "support"].includes(role)) {
        return res.status(400).json({ success: false, error: "Role must be 'admin' or 'support'" });
      }

      if (currentUser?.id === id && role !== "admin") {
        return res.status(400).json({ success: false, error: "Cannot remove your own admin role" });
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("id, email, full_name, role")
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, error: "User not found" });

      return res.status(200).json({
        success: true,
        data,
        message: "User role updated successfully",
      });
    }

    // DELETE — remove user
    if (req.method === "DELETE") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
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

export default withApiGate("users.detail", withAuth("admin")(handler));
