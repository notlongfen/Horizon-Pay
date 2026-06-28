import { getHorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";

export async function GET() {
  return Response.json({
    success: true,
    data: getHorizonPayContracts(),
  });
}
