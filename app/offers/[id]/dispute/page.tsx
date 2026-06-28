import { redirect } from "next/navigation";

// Sends user to the debtor dashboard with pre-selected offer and dispute action.
export default function DisputePage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/debtor?offer=${params.id}&action=Open+Dispute#operations`);
}
