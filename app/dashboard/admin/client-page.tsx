"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardOperationsClientSection } from "../dashboard-operations-client-section";
import { Card, MetricCard, EmptyState, StatusBadge, ArrowGlyph } from "../../components/ui";
import { titleCase, getVerificationStatusColor } from "@/lib/utils";
import { useWallet } from "../../components/wallet-provider";
import { useAdminDashboard, useWorkspaceData } from "@/lib/hooks";
import { MetricCardsSkeleton } from "@/lib/utils/loading";
import type { WorkspaceData } from "@/lib/workspace/workspace-types";

interface AdminDashboardClientPageProps {
  initialWallet?: string;
}





function AdminMetrics({ data }: { data: any }) {
  const totalBusinesses = data.businesses.length;
  const totalDebtors = data.debtors.length;
  const totalInvestors = data.investors.length;
  const totalOffers = data.offers.length;
  const pendingReviews = data.adminReviews.filter(
    (r: any) => r.status === "PENDING"
  ).length;
  const activeOffers = data.offers.filter(
    (o: any) => o.status === "ACTIVE" || o.status === "LISTED" || o.status === "FUNDED"
  ).length;

  return (
    <Card padding="none">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Verified Businesses"
          value={totalBusinesses}
          description="KYB approved"
        />
        <MetricCard
          label="Verified Users"
          value={totalDebtors + totalInvestors}
          description={`${totalDebtors} debtors + ${totalInvestors} investors`}
        />
        <MetricCard
          label="Active Offers"
          value={activeOffers}
          description="In marketplace"
        />
        <MetricCard
          label="Pending Reviews"
          value={pendingReviews}
          description="Needs your attention"
          color="lime"
        />
      </div>
    </Card>
  );
}

function ReviewQueue({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) {
    return (
      <Card padding="md" centered>
        <EmptyState
          title="No pending reviews"
          description="All compliance items are up to date"
        />
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Compliance Queue
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Pending Reviews
          </h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/dashboard/admin?reviewId=${review.id}#operations`}
            className={`group flex items-center justify-between rounded-2xl border p-4 transition ${
              review.severity === "HIGH"
                ? "border-red-400/30 bg-red-400/5 hover:border-red-400/50 hover:bg-red-400/10"
                : review.severity === "MEDIUM"
                ? "border-lime-400/30 bg-lime-400/5 hover:border-lime-400/50 hover:bg-lime-400/10"
                : "border-cyan-400/30 bg-cyan-400/5 hover:border-cyan-400/50 hover:bg-cyan-400/10"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  review.severity === "HIGH"
                    ? "bg-red-400/10 border border-red-400/30"
                    : review.severity === "MEDIUM"
                    ? "bg-lime-400/10 border border-lime-400/30"
                    : "bg-cyan-400/10 border border-cyan-400/30"
                }`}
              >
                <span
                  className={`font-semibold ${
                    review.severity === "HIGH"
                      ? "text-red-100"
                      : review.severity === "MEDIUM"
                      ? "text-lime-100"
                      : "text-cyan-100"
                  }`}
                >
                  {review.severity.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-white">{review.subject}</h4>
                <p className="text-xs text-white/46 mt-1">{review.reason}</p>
                <p className="text-xs text-white/36 mt-1">
                  {review.offerId ? `Offer: ${review.offerId}` : "General review"}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={review.status} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="#operations"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
        >
          All Reviews
        </Link>
      </div>
    </Card>
  );
}

function PlatformOverview({ data }: { data: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card padding="md">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
          Recent Businesses
        </p>
        <div className="mt-4 grid gap-3">
          {data.businesses.slice(0, 5).map((b: any) => (
            <div key={b.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{b.name}</p>
                <p className="text-xs text-white/46">{b.industry}</p>
              </div>
              <StatusBadge status={getVerificationStatusColor(b.verificationStatus)} />
            </div>
          ))}
        </div>
        {data.businesses.length > 5 && (
          <Link
            href="#operations"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
          >
            View All
          </Link>
        )}
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
          Recent Offers
        </p>
        <div className="mt-4 grid gap-3">
          {data.offers.slice(0, 5).map((o: any) => (
            <div key={o.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{o.publicId}</p>
                <p className="text-xs text-white/46">{o.business?.name}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
        {data.offers.length > 5 && (
          <Link
            href="#operations"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
          >
            View All
          </Link>
        )}
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
          Recent Users
        </p>
        <div className="mt-4 grid gap-3">
          {data.debtors.slice(0, 3).map((d: any) => (
            <div key={d.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{d.name}</p>
                <p className="text-xs text-white/46">Debtor</p>
              </div>
              <StatusBadge status={getVerificationStatusColor(d.verificationStatus)} />
            </div>
          ))}
          {data.investors.slice(0, 2).map((i: any) => (
            <div key={i.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{i.name}</p>
                <p className="text-xs text-white/46">Investor</p>
              </div>
              <StatusBadge status={getVerificationStatusColor(i.verificationStatus)} />
            </div>
          ))}
        </div>
        {(data.debtors.length + data.investors.length) > 5 && (
          <Link
            href="#operations"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white"
          >
            View All
          </Link>
        )}
      </Card>
    </div>
  );
}

function AdminQuickActions() {
  return (
    <Card padding="md">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        Admin Actions
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
            <p className="text-xs text-white/46">Contract operations</p>
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
            <p className="text-xs text-white/46">View all Offers</p>
          </div>
        </Link>

        <Link
          href="/verification/admin"
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <div className="h-10 w-10 rounded-xl border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
            <span className="text-cyan-100">✓</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Verification</h4>
            <p className="text-xs text-white/46">Manage KYB/KYC</p>
          </div>
        </Link>
      </div>
    </Card>
  );
}

// Client component that uses wallet context for consistency
export function AdminDashboardClientPage({ initialWallet }: AdminDashboardClientPageProps = {}) {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<{
    wallet?: string;
    offer?: string;
    offerId?: string;
    action?: string;
    reviewId?: string;
  }>({});
  
  // Use custom hooks for data fetching
  const { data: adminData, isLoading: isAdminLoading, isError: isAdminError, error: adminError } = useAdminDashboard();
  const { data: workspaceData, isLoading: isWorkspaceLoading, isError: isWorkspaceError, error: workspaceError } = useWorkspaceData();

  const isLoading = isAdminLoading || isWorkspaceLoading;
  const isError = isAdminError || isWorkspaceError;
  const error = adminError || workspaceError;

  // Map admin data to expected structure
  const data = {
    businesses: adminData?.businesses || [],
    debtors: adminData?.debtors || [],
    investors: adminData?.investors || [],
    offers: adminData?.offers || [],
    adminReviews: adminData?.adminReviews || [],
  };

  // Parse URL search params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const parsedParams = {
        wallet: urlSearchParams.get("wallet") || undefined,
        offer: urlSearchParams.get("offer") || undefined,
        offerId: urlSearchParams.get("offerId") || undefined,
        action: urlSearchParams.get("action") || undefined,
        reviewId: urlSearchParams.get("reviewId") || undefined,
      };
      setSearchParams(parsedParams);
    }
  }, []);

  // Keep URL in sync with connected wallet
  useEffect(() => {
    if (address && isConnected) {
      const url = new URL(window.location.href);
      const currentWalletParam = url.searchParams.get("wallet");
      if (currentWalletParam !== address) {
        url.searchParams.set("wallet", address);
        router.replace(url.toString());
      }
    } else if (!address && searchParams.wallet) {
      const url = new URL(window.location.href);
      url.searchParams.delete("wallet");
      router.replace(url.toString());
    }
  }, [address, isConnected, router, searchParams.wallet]);

  const selectedOfferId = searchParams?.offer ?? searchParams?.offerId;

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
        <Card padding="lg" centered>
          <EmptyState
            title="Failed to load dashboard"
            description={error?.message || "An error occurred"}
            action={
              <button onClick={() => window.location.reload()} className="star-button inline-flex min-h-10 items-center rounded-full bg-cyan-200 px-5 text-sm font-semibold text-cyan-950">
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
        <AdminMetrics data={data} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <ReviewQueue reviews={data.adminReviews} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <AdminQuickActions />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <PlatformOverview data={data} />
      </div>

      {workspaceData && (
        <DashboardOperationsClientSection
          data={workspaceData}
          role="admin"
          offerId={selectedOfferId}
          action={searchParams?.action}
          reviewId={searchParams?.reviewId}
        />
      )}
    </>
  );
}

// Default export for backward compatibility
export default AdminDashboardClientPage;
