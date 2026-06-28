import { getMarketplaceData } from "@/lib/marketplace/marketplace-service";

export async function GET() {
  const data = await getMarketplaceData();

  return Response.json({
    success: true,
    data,
  });
}
