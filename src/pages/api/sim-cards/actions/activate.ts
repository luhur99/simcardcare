import type { NextApiRequest, NextApiResponse } from "next";
import { simService } from "@/services/simService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { id, activation_date } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "SIM card ID is required"
      });
    }

    if (!activation_date) {
      return res.status(400).json({
        success: false,
        error: "Activation date is required"
      });
    }

    const activatedSim = await simService.activateSimCard(id, activation_date);

    return res.status(200).json({
      success: true,
      data: activatedSim,
      message: "SIM card activated successfully"
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}