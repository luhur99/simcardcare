import type { NextApiRequest, NextApiResponse } from "next";
import { providerService } from "@/services/providerService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid provider ID"
    });
  }

  try {
    // GET - Get provider by ID
    if (req.method === "GET") {
      const provider = await providerService.getProviderById(id);
      
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: "Provider not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: provider
      });
    }

    // PUT - Update provider
    if (req.method === "PUT") {
      const updates = req.body;
      
      const updatedProvider = await providerService.updateProvider(id, updates);
      
      return res.status(200).json({
        success: true,
        data: updatedProvider,
        message: "Provider updated successfully"
      });
    }

    // DELETE - Delete provider
    if (req.method === "DELETE") {
      await providerService.deleteProvider(id);
      
      return res.status(200).json({
        success: true,
        message: "Provider deleted successfully"
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