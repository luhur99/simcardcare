import type { NextApiRequest, NextApiResponse } from "next";
import { simService, calculateDailyBurden, calculateGracePeriodCost, calculateFreePulsaCost } from "@/services/simService";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(
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
    const { sim_card_id, calculation_type } = req.body;

    if (!sim_card_id) {
      return res.status(400).json({
        success: false,
        error: "SIM card ID is required"
      });
    }

    const simCard = await simService.getSimCardById(sim_card_id);

    if (!simCard) {
      return res.status(404).json({
        success: false,
        error: "SIM card not found"
      });
    }

    let result;

    switch (calculation_type) {
      case "daily_burden":
        result = calculateDailyBurden(simCard);
        break;
      case "grace_period":
        result = calculateGracePeriodCost(simCard);
        break;
      case "free_pulsa":
        result = calculateFreePulsaCost(simCard);
        break;
      case "all":
        result = {
          daily_burden: calculateDailyBurden(simCard),
          grace_period: calculateGracePeriodCost(simCard),
          free_pulsa: calculateFreePulsaCost(simCard)
        };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid calculation type. Use: daily_burden, grace_period, free_pulsa, or all"
        });
    }

    return res.status(200).json({
      success: true,
      data: result,
      sim_card: simCard
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}

export default withApiGate("calculations.burden", withAuth()(handler));