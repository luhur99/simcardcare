import type { NextApiRequest, NextApiResponse } from "next";
import { simService } from "@/services/simService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { sim_card_id } = req.query;

    if (!sim_card_id || typeof sim_card_id !== "string") {
      return res.status(400).json({
        success: false,
        error: "SIM card ID is required"
      });
    }

    const logs = await simService.getDailyBurdenLogs(sim_card_id);

    return res.status(200).json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}