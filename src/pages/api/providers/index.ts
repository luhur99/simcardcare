import type { NextApiRequest, NextApiResponse } from "next";
import { providerService } from "@/services/providerService";
import { withApiGate } from "@/lib/apiGate";
import { withAuth } from "@/lib/withAuth";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET - Get all providers
    if (req.method === "GET") {
      const providers = await providerService.getAllProviders();
      return res.status(200).json({
        success: true,
        data: providers,
        count: providers.length
      });
    }

    // POST - Create new provider
    if (req.method === "POST") {
      const providerData = req.body;
      
      // Validation
      if (!providerData.name) {
        return res.status(400).json({
          success: false,
          error: "Provider name is required"
        });
      }

      const newProvider = await providerService.createProvider(providerData);
      
      return res.status(201).json({
        success: true,
        data: newProvider,
        message: "Provider created successfully"
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

export default withApiGate("providers.list", withAuth()(handler));