import { redirect } from "next/navigation";

/**
 * Dashboard landing page - redirects to the workspace
 * Wallet connection is handled client-side in workspace
 */
export default async function DashboardRedirectPage() {
  // Redirect directly to workspace where wallet connection is handled client-side
  redirect("/workspace");
}