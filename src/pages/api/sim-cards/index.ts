import type { NextApiRequest, NextApiResponse } from "next";
import { simService } from "@/services/simService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET - Get all SIM cards
    if (req.method === "GET") {
      const simCards = await simService.getSimCards();
      return res.status(200).json({
        success: true,
        data: simCards,
        count: simCards.length
      });
    }

    // POST - Create new SIM card
    if (req.method === "POST") {
      const simData = req.body;
      
      // Validation
      if (!simData.phone_number) {
        return res.status(400).json({
          success: false,
          error: "Phone number is required"
        });
      }

      if (!simData.provider) {
        return res.status(400).json({
          success: false,
          error: "Provider is required"
        });
      }

      const newSimCard = await simService.createSimCard(simData);
      
      return res.status(201).json({
        success: true,
        data: newSimCard,
        message: "SIM card created successfully"
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