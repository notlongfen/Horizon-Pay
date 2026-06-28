import { redirect } from "next/navigation";

// Sends user to the debtor dashboard with pre-selected offer and acknowledge action.
export default function AcknowledgeConfirmPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/dashboard/debtor?offer=${params.id}&action=Acknowledge#operations`);
}
