"use client";

import { useEffect, useState } from "react";
import type { WorkspaceRole } from "@/lib/workspace/workspace-types";
import type { WorkspaceData } from "@/lib/workspace/workspace-types";
import { DashboardOperationsClient } from "./dashboard-operations-client";

type DashboardOperationsSectionProps = {
  role: WorkspaceRole;
  offerId?: string;
  action?: string;
  reviewId?: string;
};

export function DashboardOperationsSection({
  role,
  offerId,
  action,
  reviewId,
}: DashboardOperationsSectionProps) {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);

  // Fetch workspace data client-side
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const response = await fetch("/api/workspace");
        const result = await response.json();
        if (result.success && result.data) {
          setWorkspaceData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch workspace data:", error);
      }
    };

    fetchWorkspaceData();
  }, []);

  if (!workspaceData) {
    return null; // or loading spinner
  }

  return (
    <DashboardOperationsClient
      data={workspaceData}
      role={role}
      initialOfferId={offerId}
      initialAction={action}
      reviewId={reviewId}
    />
  );
}
