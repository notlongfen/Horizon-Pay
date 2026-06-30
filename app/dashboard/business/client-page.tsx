"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { Card, MetricCard, EmptyState, StatusBadge } from "../../components/ui";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";
import EditableBusinessProfileForm from "./editable-profile-form";
import { useWallet } from "@/app/components/wallet-provider";
import { useBusinessDashboard } from "@/lib/hooks";
import { MetricCardsSkeleton, CardSkeleton } from "@/lib/utils/loading";

interface BusinessDashboardClientPageProps {
  initialWallet?: string;
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

function BusinessMetrics({ offers, business }: { offers: any[]; business: any }) {
  const totalReceivables = offers.reduce(
    (sum, offer) => sum + Number(offer.principalAmountCents),
    0
  );
  const totalFunding = offers.reduce(
    (sum, offer) => sum + Number(offer.fundingPriceCents),
    0
  );
  const activeOffers = offers.filter(
    (o) => o.status === "ACKNOWLEDGED" || o.status === "LISTED"
  ).length;
  const fundedOffers = offers.filter((o) => o.status === "FUNDED").length;

  return (
    <Card padding="sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Receivables"
          value={formatCents(BigInt(totalReceivables))}
          description={`Across ${offers.length} Offers`}
        />
        <MetricCard
          label="Total Funding"
          value={formatCents(BigInt(totalFunding))}
          description="Liquidity received"
        />
        <MetricCard
          label="Active Offers"
          value={activeOffers}
          description="Ready for funding"
        />
        <MetricCard
          label="Funded Offers"
          value={fundedOffers}
          description="Investor funded"
        />
      </div>
    </Card>
  );
}

function OffersTable({ offers }: { offers: any[] }) {
  if (offers.length === 0) {
    return (
      <Card padding="lg" centered>
        <EmptyState
          title="No Offers yet"
          description="Create your first Funding Offer to unlock liquidity"
          action={
            <Link
              href="/offers/create"
              className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
            >
              Create Offer <ArrowGlyph />
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Your Offers
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Receivables Portfolio
          </h3>
        </div>
        <Link
          href="/offers/create"
          className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
        >
          Create Offer <ArrowGlyph />
        </Link>
      </div>

      <div className="mt-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Offer</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Debtor</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Amount</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Due</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Status</th>
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
                    <p className="text-white/76">{offer.debtor?.name}</p>
                    <p className="text-xs text-white/46 truncate">{offer.debtor?.walletAddress}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">
                      {formatCents(offer.principalAmountCents)}
                    </p>
                    <p className="text-xs text-white/46">
                      Funds: {formatCents(offer.fundingPriceCents)}
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
          href="/offers/create"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">+</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Create Offer</h4>
            <p className="text-xs text-white/46">Draft a new Funding Offer</p>
          </div>
        </Link>

        <Link
          href="#operations"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100 text-xs font-semibold">OP</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Operations</h4>
            <p className="text-xs text-white/46">Prepare and sign Offer actions</p>
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
            <p className="text-xs text-white/46">Browse listed Offers</p>
          </div>
        </Link>
      </div>
    </Card>
  );
}

export function BusinessDashboardClientPage({
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
  const { data: dashboardData, isLoading, isError, error } = useBusinessDashboard(
    effectiveWalletAddress || ""
  );

  const offers = dashboardData?.offers || [];
  const business = dashboardData?.business || null;

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
        <BusinessMetrics offers={offers} business={business} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <EditableBusinessProfileForm initialProfile={business} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <QuickActions />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <OffersTable offers={offers} />
      </div>

      <DashboardOperationsSection
        role="business"
        offerId={selectedOfferId}
        action={action}
      />
    </>
  );
}

// Default export for backward compatibility
export default BusinessDashboardClientPage;
