import type { NextApiRequest, NextApiResponse } from "next";
import { simService } from "@/services/simService";
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
    const {
      id,
      installation_date,
      imei,
      free_pulsa_months,
      use_installation_as_billing_cycle,
      custom_billing_day
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "SIM card ID is required"
      });
    }

    if (!installation_date) {
      return res.status(400).json({
        success: false,
        error: "Installation date is required"
      });
    }

    if (!imei) {
      return res.status(400).json({
        success: false,
        error: "IMEI is required"
      });
    }

    const installedSim = await simService.installSimCard(
      id,
      installation_date,
      imei,
      free_pulsa_months,
      use_installation_as_billing_cycle,
      custom_billing_day
    );

    return res.status(200).json({
      success: true,
      data: installedSim,
      message: "SIM card installed successfully"
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}

export default withApiGate("sim-cards.install", withAuth()(handler));