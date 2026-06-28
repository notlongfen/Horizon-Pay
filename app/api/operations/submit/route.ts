import { submitSignedContractTransaction } from "@/lib/workspace/workspace-service";

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
    | { operationId?: string; signedXdr?: string }
    | null;

  if (!body?.operationId) return badRequest("Operation id is required.");
  if (!body.signedXdr) return badRequest("Signed transaction XDR is required.");

  const operation = await submitSignedContractTransaction({
    operationId: body.operationId,
    signedXdr: body.signedXdr,
  });

  return Response.json({
    success: operation.status !== "Failed",
    data: operation,
    message:
      operation.status === "Confirmed"
        ? "Contract operation confirmed."
        : "Contract operation submitted.",
  });
}
