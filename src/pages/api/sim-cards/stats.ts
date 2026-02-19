import type { NextApiRequest, NextApiResponse } from "next";
import { simService, getOverdueGracePeriodSims } from "@/services/simService";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    const [stats, overdueSims] = await Promise.all([
      simService.getStats(),
      getOverdueGracePeriodSims()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...stats,
        overdueGracePeriod: overdueSims.length,
        overdueSims: overdueSims
      }
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}

export default withApiGate("sim-cards.stats", withAuth()(handler));