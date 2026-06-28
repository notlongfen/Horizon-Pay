import { getOfferLiveState } from "@/lib/contracts/offer-live-state";

function badRequest(message: string) {
  return Response.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    },
    { status: 400 },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offerId = url.searchParams.get("offerId");
  const sourceAddress = url.searchParams.get("source") || undefined;

  if (!offerId) return badRequest("offerId is required.");

  const state = await getOfferLiveState({
    offerId,
    sourceAddress,
  });

  return Response.json({
    success: true,
    data: state,
  });
}
