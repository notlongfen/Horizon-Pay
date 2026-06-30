"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { Card, MetricCard, EmptyState, StatusBadge } from "../../components/ui";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";
import EditableInvestorProfileForm from "./editable-profile-form";
import { useWallet } from "@/app/components/wallet-provider";
import { useInvestorDashboard } from "@/lib/hooks";
import { MetricCardsSkeleton } from "@/lib/utils/loading";

interface InvestorDashboardClientPageProps {
  initialWallet?: string;
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

function InvestorMetrics({ positions, investor }: { positions: any[]; investor: any }) {
  const totalInvested = positions.reduce(
    (sum, position) => sum + Number(position.fundedAmountCents),
    0
  );
  const totalExpected = positions.reduce(
    (sum, position) => sum + Number(position.offer?.expectedRepaymentCents || 0),
    0
  );
  const activeInvestments = positions.filter(
    (p) => p.offer?.status !== "SETTLED" && p.offer?.status !== "DEFAULTED"
  ).length;
  const settledCount = positions.filter((p) => p.offer?.status === "SETTLED").length;

  const calculateROI = () => {
    if (totalInvested === 0) return "0%";
    const expectedReturn = totalExpected - totalInvested;
    const roi = (expectedReturn / totalInvested) * 100;
    return `${roi.toFixed(1)}%`;
  };

  return (
    <Card padding="sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Invested"
          value={formatCents(totalInvested)}
          description={`Across ${positions.length} positions`}
        />
        <MetricCard
          label="Expected Return"
          value={formatCents(totalExpected)}
          description="Estimated total repayment"
          color="lime"
        />
        <MetricCard
          label="Expected ROI"
          value={calculateROI()}
          description="Estimated return on investment"
        />
        <MetricCard
          label="Settled"
          value={settledCount}
          description="Completed investments"
          color="cyan"
        />
      </div>
    </Card>
  );
}

function PortfolioTable({ positions }: { positions: any[] }) {
  if (positions.length === 0) {
    return (
      <Card padding="lg" centered>
        <EmptyState
          title="No investments yet"
          description="Browse the marketplace to find your first receivable Offer"
          action={
            <Link
              href="/marketplace"
              className="star-button mt-6 inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
            >
              Browse Offers <ArrowGlyph />
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
            Your Portfolio
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Active Investments
          </h3>
        </div>
        <Link
          href="/marketplace"
          className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
        >
          Browse More <ArrowGlyph />
        </Link>
      </div>

      <div className="mt-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Offer</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Business</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Invested</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Expected</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Due</th>
              <th className="pb-3 px-4 pt-4 font-semibold text-white/80 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const offer = position.offer;
              if (!offer) return null;
              
              const dueInDays = daysUntil(offer.dueDate);
              const invested = formatCents(position.fundedAmountCents);
              const expected = formatCents(offer.expectedRepaymentCents);
              
              return (
                <tr key={position.id} className="border-b border-white/8 hover:bg-white/8 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{offer.publicId}</p>
                    <p className="text-xs text-white/46 truncate">{offer.summary}</p>
                    <p className="text-xs text-white/36 mt-1">{offer.category}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white/76">{offer.business?.name}</p>
                    <p className="text-xs text-white/46">
                      {offer.business?.industry}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-white">{invested}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-lime-100">{expected}</p>
                    <p className="text-xs text-lime-100/60">
                      {((Number(offer.expectedRepaymentCents) - Number(position.fundedAmountCents)) / Number(position.fundedAmountCents) * 100).toFixed(1)}% ROI
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

      <div className="mt-4 flex justify-end">
        <Link
          href="#operations"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
        >
          Manage Operations
        </Link>
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
          href="/marketplace"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">🔍</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Browse Offers</h4>
            <p className="text-xs text-white/46">Find new opportunities</p>
          </div>
        </Link>

        <Link
          href="/marketplace?filter=acknowledged"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-lime-400/30 hover:bg-lime-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-lime-400/30 bg-lime-400/10 flex items-center justify-center">
            <span className="text-lime-100">✓</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Acknowledged</h4>
            <p className="text-xs text-white/46">Debtor-verified Offers</p>
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
            <p className="text-xs text-white/46">Request and manage allocations</p>
          </div>
        </Link>
      </div>
    </Card>
  );
}

export function InvestorDashboardClientPage({
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
  const { data: dashboardData, isLoading, isError, error } = useInvestorDashboard(
    effectiveWalletAddress || ""
  );

  const positions = dashboardData?.offers || [];
  const investor = dashboardData?.investor || null;

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
        <InvestorMetrics positions={positions} investor={investor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <EditableInvestorProfileForm initialProfile={investor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <QuickActions />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <PortfolioTable positions={positions} />
      </div>

      <DashboardOperationsSection
        role="investor"
        offerId={selectedOfferId}
        action={action}
      />
    </>
  );
}

// Default export for backward compatibility
export default InvestorDashboardClientPage;
