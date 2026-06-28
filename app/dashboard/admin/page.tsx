import type { Metadata } from "next";
import Link from "next/link";
import { BorderGlow } from "../../components/border-glow";
import { getPrismaClient } from "@/lib/db/prisma";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | HorizonPay",
  description:
    "Monitor platform activity, review verifications, manage compliance, and handle disputes for HorizonPay.",
};

function statusLabel(status: string) {
  return titleCase(status);
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

async function getAdminData(_walletAddress?: string) {
  const prisma = getPrismaClient();

  try {
    const [
      businesses,
      debtors,
      investors,
      offers,
      adminReviews,
    ] = await Promise.all([
      prisma.businessProfile.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
      prisma.debtorProfile.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
      prisma.investorProfile.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
      prisma.offer.findMany({
        include: {
          business: true,
          debtor: true,
        },
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
      prisma.adminReview.findMany({
        orderBy: [{ createdAt: "desc" }],
        take: 10,
      }),
    ]);

    return {
      businesses,
      debtors,
      investors,
      offers,
      adminReviews,
    };
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    return {
      businesses: [],
      debtors: [],
      investors: [],
      offers: [],
      adminReviews: [],
    };
  }
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
    (o: any) => o.status === "ACKNOWLEDGED" || o.status === "LISTED" || o.status === "FUNDED"
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BorderGlow className="glass-panel p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
          Verified Businesses
        </p>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {totalBusinesses}
        </p>
        <p className="mt-2 text-xs text-white/46">KYB approved</p>
      </BorderGlow>

      <BorderGlow className="glass-panel p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
          Verified Users
        </p>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {totalDebtors + totalInvestors}
        </p>
        <p className="mt-2 text-xs text-white/46">
          {totalDebtors} debtors + {totalInvestors} investors
        </p>
      </BorderGlow>

      <BorderGlow className="glass-panel p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
          Active Offers
        </p>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
          {activeOffers}
        </p>
        <p className="mt-2 text-xs text-white/46">In marketplace</p>
      </BorderGlow>

      <BorderGlow className="glass-panel p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
          Pending Reviews
        </p>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-lime-100">
          {pendingReviews}
        </p>
        <p className="mt-2 text-xs text-lime-100/60">
          Needs your attention
        </p>
      </BorderGlow>
    </div>
  );
}

function ReviewQueue({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) {
    return (
      <BorderGlow className="glass-panel p-6 text-center">
        <p className="text-lg text-white/64">No pending reviews</p>
        <p className="mt-2 text-sm text-white/46">
          All compliance items are up to date
        </p>
      </BorderGlow>
    );
  }

  return (
    <BorderGlow className="glass-panel p-6">
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
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-medium ${
                  review.severity === "HIGH"
                    ? "border border-red-400/30 bg-red-400/10 text-red-100"
                    : review.severity === "MEDIUM"
                    ? "border border-lime-400/30 bg-lime-400/10 text-lime-100"
                    : "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                }`}
              >
                {statusLabel(review.status)}
              </span>
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
    </BorderGlow>
  );
}

function PlatformOverview({ data }: { data: any }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <BorderGlow className="glass-panel p-6">
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  b.verificationStatus === "KYB_VERIFIED"
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border border-white/10 bg-white/5 text-white/46"
                }`}
              >
                {b.verificationStatus === "KYB_VERIFIED" ? "Verified" : "Pending"}
              </span>
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
      </BorderGlow>

      <BorderGlow className="glass-panel p-6">
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  o.status === "FUNDED"
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : o.status === "ACKNOWLEDGED"
                    ? "border border-lime-400/30 bg-lime-400/10 text-lime-100"
                    : "border border-white/10 bg-white/5 text-white/46"
                }`}
              >
                {statusLabel(o.status)}
              </span>
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
      </BorderGlow>

      <BorderGlow className="glass-panel p-6">
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  d.verificationStatus === "KYC_VERIFIED"
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border border-white/10 bg-white/5 text-white/46"
                }`}
              >
                {d.verificationStatus === "KYC_VERIFIED" ? "Verified" : "Pending"}
              </span>
            </div>
          ))}
          {data.investors.slice(0, 2).map((i: any) => (
            <div key={i.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{i.name}</p>
                <p className="text-xs text-white/46">Investor</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i.verificationStatus === "KYC_VERIFIED"
                    ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border border-white/10 bg-white/5 text-white/46"
                }`}
              >
                {i.verificationStatus === "KYC_VERIFIED" ? "Verified" : "Pending"}
              </span>
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
      </BorderGlow>
    </div>
  );
}

function AdminQuickActions() {
  return (
    <BorderGlow className="glass-panel p-6">
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
          href="/onboarding"
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
    </BorderGlow>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string; reviewId?: string }>;
}) {
  const params = await searchParams;
  const data = await getAdminData(params?.wallet);
  const selectedOfferId = params?.offer ?? params?.offerId;

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

      <DashboardOperationsSection
        role="admin"
        offerId={selectedOfferId}
        action={params?.action}
        reviewId={params?.reviewId}
      />
    </>
  );
}
