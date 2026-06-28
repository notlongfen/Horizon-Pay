"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ContractOperationView,
  RoleWorkspace,
  WorkspaceData,
  WorkspaceRole,
} from "@/lib/workspace/workspace-types";
import { useWallet, NetworkBadge } from "../components/wallet-provider";
import { formatStellarAddress } from "@/lib/utils";
import { BorderGlow } from "../components/border-glow";
import { OfferDetailsPanel } from "../workspace/components/offer-details";
import { OperationPanel } from "../workspace/components/operation-panel";
import type {
  OfferDisplayStatus,
  OfferRow,
  WorkspaceAction,
} from "../workspace/components/types";
import { getStatusVariant } from "../workspace/components/types";

type DashboardOperationsClientProps = {
  data: WorkspaceData;
  role: WorkspaceRole;
  initialOfferId?: string;
  initialAction?: string;
  reviewId?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
};

const roleActions: Record<WorkspaceRole, WorkspaceAction[]> = {
  business: ["List Offer"],
  debtor: ["Acknowledge", "Repay Full", "Open Dispute"],
  investor: ["Fund Offer"],
  admin: ["Freeze Offer", "Verify Business", "Verify Debtor", "Verify Investor"],
};

function displayStatus(status: string): OfferDisplayStatus {
  const normalized = status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  if (normalized === "Pending Debtor Acknowledgement") {
    return "Pending Debtor Acknowledgement";
  }

  const supported: OfferDisplayStatus[] = [
    "Draft",
    "Acknowledged",
    "Active",
    "Listed",
    "Funded",
    "Partially Repaid",
    "Settled",
    "Repaid",
    "Overdue",
    "Defaulted",
    "Disputed",
    "Frozen",
    "Cancelled",
  ];

  return supported.includes(normalized as OfferDisplayStatus)
    ? (normalized as OfferDisplayStatus)
    : "Draft";
}

function toOfferRow(offer: RoleWorkspace["offers"][number]): OfferRow {
  const status = displayStatus(offer.status);

  return {
    id: offer.id,
    title: offer.title,
    counterparty: offer.counterparty,
    category: offer.category,
    amount: offer.amount,
    fundingPrice: offer.fundingPrice,
    status,
    statusVariant: getStatusVariant(status),
    onchainOfferId: offer.onchainOfferId,
    dueDate: offer.due,
  };
}

function actionCopy(action: WorkspaceAction) {
  const labels: Record<WorkspaceAction, string> = {
    "Create Offer": "Create Offer",
    "List Offer": "List Offer",
    Acknowledge: "Acknowledge",
    "Fund Offer": "Request Allocation",
    Repay: "Repay",
    "Repay Full": "Repay in Full",
    "Open Dispute": "Open Dispute",
    "Cancel Offer": "Cancel Offer",
    "Freeze Offer": "Freeze Offer",
    "Verify Business": "Verify Business",
    "Verify Debtor": "Verify Debtor",
    "Verify Investor": "Verify Investor",
    "Enable Asset": "Enable Asset",
  };

  return labels[action] ?? action;
}

function canRunAction(action: WorkspaceAction, offer: OfferRow | null) {
  if (["Verify Business", "Verify Debtor", "Verify Investor"].includes(action)) {
    return true;
  }

  if (!offer) return false;

  if (["List Offer", "Fund Offer", "Repay", "Repay Full", "Freeze Offer"].includes(action)) {
    return Boolean(offer.onchainOfferId);
  }

  return true;
}

function actionFields(action: WorkspaceAction) {
  if (["Verify Business", "Verify Debtor", "Verify Investor"].includes(action)) {
    const targetWallet = window.prompt("Wallet address to verify");
    return targetWallet ? { targetWallet } : null;
  }

  if (action === "Repay") {
    const repaymentAmount = window.prompt("Repayment amount in USD");
    return repaymentAmount ? { repaymentAmount } : null;
  }

  if (action === "Open Dispute") {
    const disputeReason = window.prompt("Dispute reason", "Terms require review");
    return disputeReason ? { disputeReason } : null;
  }

  return {};
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(
      payload?.error?.message ?? payload?.message ?? "The operation could not be completed.",
    );
  }

  return payload.data;
}

export function DashboardOperationsClient({
  data,
  role,
  initialOfferId,
  initialAction,
  reviewId,
}: DashboardOperationsClientProps) {
  // Wallet from context
  const { 
    address: walletAddress, 
    network: walletNetwork, 
    connect: handleConnectWallet, 
    disconnect: handleDisconnectWallet,
    signTransaction,
  } = useWallet();

  const workspace = useMemo(
    () => data.roles.find((item) => item.role === role) ?? data.roles[0],
    [data.roles, role],
  );
  const offers = useMemo(() => workspace.offers.map(toOfferRow), [workspace.offers]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(
    initialOfferId ?? offers[0]?.id,
  );
  const [operation, setOperation] = useState<ContractOperationView | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    initialAction ? `${initialAction} is ready to prepare.` : null,
  );

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

  async function prepareOperation(action: WorkspaceAction, offerId?: string) {
    setError(null);
    setNotice(null);

    if (!walletAddress) {
      setError("Connect your wallet before preparing this action.");
      return;
    }

    const offer = offers.find((item) => item.id === offerId) ?? selectedOffer;
    if (!canRunAction(action, offer)) {
      setError(
        offer
          ? "This Offer must be on-chain before that action can be prepared."
          : "Select an Offer before preparing this action.",
      );
      return;
    }

    const fields = actionFields(action);
    if (fields === null) return;

    setIsPreparing(true);

    try {
      const prepared = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          action,
          offerId: offer?.id,
          walletAddress,
          fields,
        }),
      }).then((response) => readApiResponse<ContractOperationView>(response));

      setOperation(prepared);
      setNotice(`${actionCopy(action)} is prepared.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare operation.");
    } finally {
      setIsPreparing(false);
    }
  }

  async function executeOperation(preparedOperation: ContractOperationView) {
    setError(null);
    setNotice(null);

    if (!walletAddress) {
      setError("Connect your wallet before signing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const built = await fetch("/api/operations/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: preparedOperation.id,
          walletAddress,
        }),
      }).then(
        (response) =>
          readApiResponse<
            ContractOperationView & {
              unsignedXdr?: string;
              networkPassphrase?: string;
            }
          >(response),
      );

      if (!built.unsignedXdr || !built.networkPassphrase) {
        throw new Error("The prepared transaction is missing signing data.");
      }

      const signedResult = await signTransaction({
        xdr: built.unsignedXdr,
        networkPassphrase: built.networkPassphrase,
      });

      const submitted = await fetch("/api/operations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: preparedOperation.id,
          signedXdr: signedResult.signedTxXdr,
        }),
      }).then((response) => readApiResponse<ContractOperationView>(response));

      setOperation(submitted);
      setNotice("Transaction submitted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const actions = roleActions[role];

  return (
    <section id="operations" className="mx-auto max-w-7xl px-5 py-8">
      <BorderGlow className="glass-panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
              Operations
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {workspace.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">
              {workspace.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {walletAddress ? (
              <>
                <NetworkBadge network={walletNetwork || "unknown"} />
                <span className="font-mono text-sm">{formatStellarAddress(walletAddress)}</span>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectWallet}
                className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {walletNetwork && !walletNetwork.includes("test") ? (
          <div className="mt-5 rounded-2xl border border-lime-200/12 bg-lime-200/5 px-4 py-3 text-sm text-lime-50/70">
            Wallet network is {walletNetwork}. Switch to Stellar Testnet before signing.
          </div>
        ) : null}

        {reviewId ? (
          <div className="mt-5 rounded-2xl border border-cyan-200/12 bg-cyan-200/5 px-4 py-3 text-sm text-cyan-50/70">
            Review selected: <span className="font-mono">{reviewId}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mt-5 rounded-2xl border border-cyan-200/12 bg-cyan-200/5 px-4 py-3 text-sm text-cyan-50/70">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/20">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <h3 className="font-semibold text-white">Role Offers</h3>
              <span className="text-sm text-white/46">{offers.length} total</span>
            </div>

            {offers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="px-4 py-3 font-semibold text-white/70">Offer</th>
                      <th className="px-4 py-3 font-semibold text-white/70">Counterparty</th>
                      <th className="px-4 py-3 font-semibold text-white/70">Amount</th>
                      <th className="px-4 py-3 font-semibold text-white/70">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr
                        key={offer.id}
                        className={`cursor-pointer border-b border-white/8 transition hover:bg-white/8 ${
                          offer.id === selectedOffer?.id ? "bg-cyan-200/8" : ""
                        }`}
                        onClick={() => setSelectedOfferId(offer.id)}
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{offer.id}</p>
                          <p className="mt-1 text-xs text-white/46">{offer.category}</p>
                        </td>
                        <td className="px-4 py-4 text-white/76">{offer.counterparty}</td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{offer.amount}</p>
                          <p className="mt-1 text-xs text-white/46">{offer.fundingPrice}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                            {offer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-white/56">
                No Offers are available for this role yet.
              </div>
            )}
          </div>

          <div className="space-y-5">
            <OfferDetailsPanel
              offer={selectedOffer}
              liveState={null}
              isLoading={false}
            />

            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Available Actions</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {role === "business" ? (
                  <a
                    href="/offers/create"
                    className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
                  >
                    Create Offer
                  </a>
                ) : null}

                {actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={isPreparing || !canRunAction(action, selectedOffer)}
                    onClick={() => prepareOperation(action, selectedOffer?.id)}
                    className="inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isPreparing ? "Preparing..." : actionCopy(action)}
                  </button>
                ))}
              </div>
            </div>

            <OperationPanel
              operation={operation}
              onExecute={executeOperation}
              onDismiss={() => setOperation(null)}
              isPending={isSubmitting}
            />
          </div>
        </div>

        <details className="mt-6 border-t border-white/8 pt-5">
          <summary className="cursor-pointer text-sm font-medium text-white/60 hover:text-white">
            Contract details
          </summary>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Network</p>
              <p className="mt-2 font-mono text-white/76">{data.contracts.network}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Offer Registry</p>
              <p className="mt-2 truncate font-mono text-white/76">{data.contracts.offerRegistry}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Marketplace</p>
              <p className="mt-2 truncate font-mono text-white/76">{data.contracts.marketplace}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Settlement</p>
              <p className="mt-2 truncate font-mono text-white/76">{data.contracts.settlement}</p>
            </div>
          </div>
        </details>
      </BorderGlow>
    </section>
  );
}
