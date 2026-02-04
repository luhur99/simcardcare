import type { NextApiRequest, NextApiResponse } from "next";
import { providerService } from "@/services/providerService";

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

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Invalid provider ID"
    });
  }

  try {
    const updatedProvider = await providerService.toggleProviderStatus(id);

    return res.status(200).json({
      success: true,
      data: updatedProvider,
      message: `Provider ${updatedProvider.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
}