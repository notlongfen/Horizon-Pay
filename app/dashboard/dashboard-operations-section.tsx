import { getWorkspaceData } from "@/lib/workspace/workspace-service";
import type { WorkspaceRole } from "@/lib/workspace/workspace-types";
import { DashboardOperationsClient } from "./dashboard-operations-client";

type DashboardOperationsSectionProps = {
  role: WorkspaceRole;
  offerId?: string;
  action?: string;
  reviewId?: string;
};

export async function DashboardOperationsSection({
  role,
  offerId,
  action,
  reviewId,
}: DashboardOperationsSectionProps) {
  const data = await getWorkspaceData();

  return (
    <DashboardOperationsClient
      data={data}
      role={role}
      initialOfferId={offerId}
      initialAction={action}
      reviewId={reviewId}
    />
  );
}
