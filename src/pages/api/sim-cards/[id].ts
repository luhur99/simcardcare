import type { NextApiRequest, NextApiResponse } from "next";
import { simService } from "@/services/simService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid SIM card ID"
    });
  }

  try {
    // GET - Get SIM card by ID
    if (req.method === "GET") {
      const simCard = await simService.getSimCardById(id);
      
      if (!simCard) {
        return res.status(404).json({
          success: false,
          error: "SIM card not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: simCard
      });
    }

    // PUT - Update SIM card
    if (req.method === "PUT") {
      const updates = req.body;
      
      const updatedSimCard = await simService.updateSimCard(id, updates);
      
      return res.status(200).json({
        success: true,
        data: updatedSimCard,
        message: "SIM card updated successfully"
      });
    }

    // DELETE - Delete SIM card (deactivate)
    if (req.method === "DELETE") {
      const { deactivation_date, reason } = req.body;
      
      if (!deactivation_date) {
        return res.status(400).json({
          success: false,
          error: "Deactivation date is required"
        });
      }

      const deactivatedSim = await simService.deactivateSimCard(
        id,
        deactivation_date,
        reason
      );
      
      return res.status(200).json({
        success: true,
        data: deactivatedSim,
        message: "SIM card deactivated successfully"
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}