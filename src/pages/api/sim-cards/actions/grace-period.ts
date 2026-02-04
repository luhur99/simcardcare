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
    const { id, grace_period_start_date, due_date, action } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "SIM card ID is required"
      });
    }

    // Enter grace period
    if (action === "enter") {
      if (!grace_period_start_date) {
        return res.status(400).json({
          success: false,
          error: "Grace period start date is required"
        });
      }

      const sim = await simService.enterGracePeriod(
        id,
        grace_period_start_date,
        due_date
      );

      return res.status(200).json({
        success: true,
        data: sim,
        message: "SIM card entered grace period"
      });
    }

    // Reactivate from grace period
    if (action === "reactivate") {
      const activation_date = req.body.activation_date || new Date().toISOString().split('T')[0];

      const sim = await simService.reactivateFromGracePeriod(
        id,
        activation_date
      );

      return res.status(200).json({
        success: true,
        data: sim,
        message: "SIM card reactivated from grace period"
      });
    }

    return res.status(400).json({
      success: false,
      error: "Invalid action. Use 'enter' or 'reactivate'"
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}