import { getContractReadiness } from "@/lib/contracts/contract-readiness";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get("wallet") || undefined;
  const repaymentAsset = url.searchParams.get("asset") || undefined;

  const readiness = await getContractReadiness({
    walletAddress,
    repaymentAsset,
  });

  return Response.json({
    success: true,
    data: readiness,
  });
}
