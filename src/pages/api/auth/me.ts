import type { NextApiRequest, NextApiResponse } from "next";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user     = (req as any).user;
  const userRole = (req as any).userRole;

  return res.status(200).json({
    success: true,
    data: {
      id:    user.id,
      email: user.email,
      role:  userRole ?? "support",
    },
  });
}

export default withApiGate("auth.me", withAuth()(handler));
