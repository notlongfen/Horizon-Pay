import type { Metadata } from "next";
import Link from "next/link";
import { getPrismaClient } from "@/lib/db/prisma";
import { Card, MetricCard, EmptyState, StatusBadge } from "../../components/ui";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Investor Dashboard | HorizonPay",
  description:
    "Browse, fund, and track your receivables investment portfolio with transparent terms and risk context.",
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

async function getInvestorData(walletAddress?: string) {
  const prisma = getPrismaClient();

  try {
    const whereClause = walletAddress 
      ? {
          investor: {
            walletAddress: walletAddress,
          },
        }
      : {
          investorId: "current-investor-id", // Fallback for demo mode
        };

    const fundingPositions = await prisma.fundingPosition.findMany({
      where: whereClause,
      include: {
        offer: {
          include: {
            business: true,
            debtor: true,
            notes: { orderBy: { sortOrder: "asc" } },
            proofItems: { orderBy: { sortOrder: "asc" } },
          },
        },
        investor: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const investor = walletAddress
      ? await prisma.investorProfile.findFirst({
          where: { walletAddress },
        })
      : await prisma.investorProfile.findFirst({
          where: { id: "current-investor-id" },
        });

    return { positions: fundingPositions, investor };
  } catch (error) {
    console.error("Failed to fetch investor data:", error);
    return { positions: [], investor: null };
  }
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

function InvestorProfileCard({ investor }: { investor: any }) {
  if (!investor) return null;

  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{investor.name}</h3>
          <p className="mt-1 text-sm text-white/76">Verified Investor</p>
          <p className="mt-3 leading-6 text-white/64">{investor.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">
              {investor.verificationStatus === "KYC_VERIFIED" ? "KYC Verified" : "Pending"}
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
            {investor.walletAddress}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registered
          </p>
          <p className="mt-2 text-sm text-white/76">
            {investor.createdAt ? formatShortDate(new Date(investor.createdAt)) : "N/A"}
          </p>
        </div>
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

export default async function InvestorDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const params = await searchParams;
  const { positions, investor } = await getInvestorData(params?.wallet);
  const selectedOfferId = params?.offer ?? params?.offerId;

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <InvestorMetrics positions={positions} investor={investor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <InvestorProfileCard investor={investor} />
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
        action={params?.action}
      />
    </>
  );
}
