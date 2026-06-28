import { redirect } from "next/navigation";
import type { WorkspaceRole } from "@/lib/workspace/workspace-types";

const roles = new Set<WorkspaceRole>(["business", "debtor", "investor", "admin"]);

export default async function WorkspaceRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const rawRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const role: WorkspaceRole = rawRole && roles.has(rawRole as WorkspaceRole)
    ? (rawRole as WorkspaceRole)
    : "business";
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "role" || value === undefined) continue;
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) nextParams.set(key, firstValue);
  }

  const query = nextParams.toString();
  redirect(`/dashboard/${role}${query ? `?${query}` : ""}`);
}
