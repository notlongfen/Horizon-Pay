import { prepareContractOperation } from "@/lib/workspace/workspace-service";
import type { PrepareOperationInput, WorkspaceRole } from "@/lib/workspace/workspace-types";

const roles = new Set<WorkspaceRole>(["business", "debtor", "investor", "admin"]);
const allowedActions = new Set([
  "Create Offer",
  "Request Acknowledgement",
  "Acknowledge",
  "List Offer",
  "Fund Offer",
  "Repay Full",
  "Repay",
  "Open Dispute",
  "Cancel Offer",
  "Freeze Offer",
  "Approve KYB",
  "Verify Business",
  "Verify Debtor",
  "Verify Investor",
  "Enable Asset",
]);

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
  const body = (await request.json().catch(() => null)) as Partial<PrepareOperationInput> | null;

  if (!body) return badRequest("Request body must be valid JSON.");
  if (!body.role || !roles.has(body.role)) return badRequest("A valid role is required.");
  if (!body.action || !allowedActions.has(body.action)) {
    return badRequest("A supported operation action is required.");
  }

  try {
    const operation = await prepareContractOperation({
      role: body.role,
      action: body.action,
      offerId: body.offerId,
      walletAddress: body.walletAddress,
      fields: body.fields,
    });

    return Response.json({
      success: true,
      data: operation,
      message: "Contract operation prepared.",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: "PREPARE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Contract operation could not be prepared.",
        },
      },
      { status: 400 },
    );
  }
}
