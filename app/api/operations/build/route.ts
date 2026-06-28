import { buildPreparedContractTransaction } from "@/lib/workspace/workspace-service";

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { operationId?: string; walletAddress?: string }
    | null;

  if (!body?.operationId) return badRequest("Operation id is required.");
  if (!body.walletAddress) return badRequest("Wallet address is required.");

  try {
    const operation = await buildPreparedContractTransaction({
      operationId: body.operationId,
      walletAddress: body.walletAddress,
    });

    return Response.json({
      success: true,
      data: operation,
      message: "Soroban transaction is ready for wallet signature.",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: "BUILD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Could not build Soroban transaction.",
        },
      },
      { status: 400 },
    );
  }
}
