"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { Card, MetricCard, EmptyState, StatusBadge } from "../../components/ui";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";
import EditableDebtorProfileForm from "./editable-profile-form";
import { useWallet } from "@/app/components/wallet-provider";
import { useDebtorDashboard } from "@/lib/hooks";
import { MetricCardsSkeleton } from "@/lib/utils/loading";

interface DebtorDashboardClientPageProps {
  initialWallet?: string;
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

function DebtorMetrics({ offers, debtor }: { offers: any[]; debtor: any }) {
  const totalObligation = offers.reduce(
    (sum, offer) => sum + Number(offer.principalAmountCents),
    0
  );
  const totalRemaining = offers.reduce(
    (sum, offer) => {
      if (offer.status !== "SETTLED") {
        return sum + Number(offer.principalAmountCents);
      }
      return sum;
    },
    0
  );
  const pendingAck = offers.filter((o) => o.status === "DRAFT" || o.status === "PENDING_DEBTOR_ACKNOWLEDGEMENT").length;
  const overdue = offers.filter((o) => {
    const days = daysUntil(o.dueDate);
    return days < 0 && o.status !== "SETTLED";
  }).length;

  return (
    <Card padding="sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Obligation"
          value={formatCents(totalObligation)}
          description={`Across ${offers.length} Offers`}
        />
        <MetricCard
          label="Remaining Balance"
          value={formatCents(totalRemaining)}
          description="Not yet settled"
        />
        <MetricCard
          label="Pending ACK"
          value={pendingAck}
          description="Needs your acknowledgement"
        />
        <MetricCard
          label="Overdue"
          value={overdue}
          description="Past due date"
          color="lime"
        />
      </div>
    </Card>
  );
}


function ObligationsTable({ offers }: { offers: any[] }) {
  if (offers.length === 0) {
    return (
      <Card padding="lg" centered>
        <EmptyState
          title="No obligations yet"
          description="You have no pending payment obligations"
        />
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Your Obligations
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Payment Portfolio
          </h3>
        </div>
      </div>

      <div className="mt-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Offer</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Business</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Amount</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Due</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Status</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const dueInDays = daysUntil(offer.dueDate);
              return (
                <tr key={offer.id} className="border-b border-white/8 hover:bg-white/8 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{offer.publicId}</p>
                    <p className="text-xs text-white/46 truncate">{offer.summary}</p>
                    <p className="text-xs text-white/36 mt-1">{offer.category}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white/76">{offer.business?.name}</p>
                    <p className="text-xs text-white/46 truncate">{offer.business?.walletAddress}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">
                      {formatCents(offer.principalAmountCents)}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white/76">
                      {formatShortDate(offer.dueDate)}
                    </p>
                    <p className="text-xs text-white/46">
                      {dueInDays > 0 ? `In ${dueInDays}d` : dueInDays === 0 ? "Due today" : "Overdue"}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={offer.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {offer.status === "DRAFT" || offer.status === "PENDING_DEBTOR_ACKNOWLEDGEMENT" ? (
                        <Link
                          href={`/offers/${offer.publicId}/acknowledge`}
                          className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                        >
                          Acknowledge
                        </Link>
                      ) : null}
                      {(offer.status === "ACKNOWLEDGED" || offer.status === "LISTED" || offer.status === "FUNDED") && (
                        <Link
                          href={`/dashboard/debtor?offer=${offer.publicId}#operations`}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/76 transition hover:bg-white/10"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card padding="md">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        Quick Actions
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="#operations"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100 text-xs font-semibold">OP</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Operations</h4>
            <p className="text-xs text-white/46">Review and sign actions</p>
          </div>
        </Link>

        <Link
          href="/marketplace"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">📊</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Marketplace</h4>
            <p className="text-xs text-white/46">Browse Offers</p>
          </div>
        </Link>

        <Link
          href="/onboarding"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">✓</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Verification</h4>
            <p className="text-xs text-white/46">Complete KYC</p>
          </div>
        </Link>
      </div>
    </Card>
  );
}

function PendingAcknowledgements({ offers }: { offers: any[] }) {
  const pending = offers.filter(
    (o) => o.status === "DRAFT" || o.status === "PENDING_DEBTOR_ACKNOWLEDGEMENT"
  );

  if (pending.length === 0) return null;

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Needs Attention
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Pending Your Acknowledgement
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {pending.map((offer) => (
          <Link
            key={offer.id}
            href={`/offers/${offer.publicId}/acknowledge`}
            className="group flex items-center justify-between rounded-2xl border border-cyan-400/30 bg-black/25 p-4 transition hover:border-cyan-400/50 hover:bg-cyan-400/5"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
                <span className="text-cyan-100">ACK</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">{offer.publicId}</h4>
                <p className="text-xs text-white/46">
                  {offer.business?.name} - {formatCents(offer.principalAmountCents)}
                </p>
                <p className="text-xs text-white/36 mt-1">
                  Due: {formatShortDate(offer.dueDate)}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-100">
                Review Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function DebtorDashboardClientPage({
  searchParams,
  initialWallet,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
  initialWallet?: string;
}) {
  const { address: walletAddress } = useWallet();
  const searchParamsSync = useSearchParams();

  // Use wallet from URL params first, then fall back to connected wallet or initial wallet
  const effectiveWalletAddress = searchParamsSync.get("wallet") || walletAddress || initialWallet;

  // Use custom hooks for data fetching
  const { data: dashboardData, isLoading, isError, error } = useDebtorDashboard(
    effectiveWalletAddress || ""
  );

  const offers = dashboardData?.offers || [];
  const debtor = dashboardData?.debtor || null;

  const selectedOfferId = (searchParamsSync.get("offer") ?? searchParamsSync.get("offerId") ?? undefined) as string | undefined;
  const action = searchParamsSync.get("action") ?? undefined;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12">
        <MetricCardsSkeleton count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-12">
        <Card padding="md">
          <EmptyState
            title="Failed to load dashboard"
            description={error?.message || "An error occurred"}
            action={
              <button
                onClick={() => window.location.reload()}
                className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950"
              >
                Retry
              </button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <DebtorMetrics offers={offers} debtor={debtor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <PendingAcknowledgements offers={offers} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <EditableDebtorProfileForm initialProfile={debtor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <QuickActions />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <ObligationsTable offers={offers} />
      </div>

      <DashboardOperationsSection
        role="debtor"
        offerId={selectedOfferId}
        action={action}
      />
    </>
  );
}

// Default export for backward compatibility
export default DebtorDashboardClientPage;
