"use client";

import type { WorkspaceData, WorkspaceRole } from "@/lib/workspace/workspace-types";
import { DashboardOperationsClient } from "./dashboard-operations-client";

type DashboardOperationsClientSectionProps = {
  data: WorkspaceData;
  role: WorkspaceRole;
  offerId?: string;
  action?: string;
  reviewId?: string;
};

export function DashboardOperationsClientSection({
  data,
  role,
  offerId,
  action,
  reviewId,
}: DashboardOperationsClientSectionProps) {
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
