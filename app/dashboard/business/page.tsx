import type { Metadata } from "next";
import Link from "next/link";
import { getPrismaClient } from "@/lib/db/prisma";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { Card, MetricCard, SectionLabel, EmptyState, StatusBadge } from "../../components/ui";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business Dashboard | HorizonPay",
  description:
    "Manage your receivables, create Funding Offers, and track liquidity from verified invoices and services.",
};

function statusLabel(status: string) {
  return titleCase(status);
}

function riskLabel(risk: string) {
  if (risk === "LOW") return "Low";
  if (risk === "ELEVATED") return "Elevated";
  return "Moderate";
}

function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-cyan-950">
      -&gt;
    </span>
  );
}

async function getBusinessData(walletAddress?: string) {
  const prisma = getPrismaClient();

  try {
    const whereClause = walletAddress 
      ? {
          business: {
            walletAddress: walletAddress,
          },
        }
      : {
          businessId: "current-business-id", // Fallback for demo mode
        };

    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        business: true,
        debtor: true,
        notes: { orderBy: { sortOrder: "asc" } },
        proofItems: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ status: "desc" }, { dueDate: "asc" }],
    });

    const business = walletAddress
      ? await prisma.businessProfile.findFirst({
          where: { walletAddress },
        })
      : await prisma.businessProfile.findFirst({
          where: { id: "current-business-id" },
        });

    return { offers, business };
  } catch (error) {
    console.error("Failed to fetch business data:", error);
    return { offers: [], business: null };
  }
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

function BusinessProfileCard({ business }: { business: any }) {
  if (!business) return null;

  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{business.name}</h3>
          <p className="mt-1 text-sm text-white/76">{business.industry}</p>
          <p className="mt-3 leading-6 text-white/64">{business.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">
              {business.verificationStatus === "KYB_VERIFIED" ? "KYB Verified" : "Pending"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Wallet
          </p>
          <p className="mt-2 font-mono text-sm text-white/76 truncate">
            {business.walletAddress}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registered
          </p>
          <p className="mt-2 text-sm text-white/76">
            {business.createdAt ? formatShortDate(new Date(business.createdAt)) : "N/A"}
          </p>
        </div>
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

export default async function BusinessDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const params = await searchParams;
  const { offers, business } = await getBusinessData(params?.wallet);
  const selectedOfferId = params?.offer ?? params?.offerId;

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <BusinessMetrics offers={offers} business={business} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <BusinessProfileCard business={business} />
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
        action={params?.action}
      />
    </>
  );
}
