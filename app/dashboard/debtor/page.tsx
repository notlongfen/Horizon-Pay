import type { Metadata } from "next";
import Link from "next/link";
import { getPrismaClient } from "@/lib/db/prisma";
import { DashboardOperationsSection } from "../dashboard-operations-section";
import { Card, MetricCard, EmptyState, StatusBadge } from "../../components/ui";
import { formatCents, titleCase, daysUntil, formatShortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Debtor Dashboard | HorizonPay",
  description:
    "View and manage your payment obligations, acknowledge Funding Offers, and track repayment status.",
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

async function getDebtorData(walletAddress?: string) {
  const prisma = getPrismaClient();

  try {
    const whereClause = walletAddress 
      ? {
          debtor: {
            walletAddress: walletAddress,
          },
        }
      : {
          debtorId: "current-debtor-id", // Fallback for demo mode
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
      orderBy: [{ dueDate: "asc" }, { status: "desc" }],
    });

    const debtor = walletAddress
      ? await prisma.debtorProfile.findFirst({
          where: { walletAddress },
        })
      : await prisma.debtorProfile.findFirst({
          where: { id: "current-debtor-id" },
        });

    return { offers, debtor };
  } catch (error) {
    console.error("Failed to fetch debtor data:", error);
    return { offers: [], debtor: null };
  }
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

function DebtorProfileCard({ debtor }: { debtor: any }) {
  if (!debtor) return null;

  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{debtor.name}</h3>
          <p className="mt-1 text-sm text-white/76">Payment Obligor</p>
          <p className="mt-3 leading-6 text-white/64">{debtor.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="rounded-full border-2 border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-100">
              {debtor.verificationStatus === "KYC_VERIFIED" ? "KYC Verified" : "Pending"}
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
            {debtor.walletAddress}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registered
          </p>
          <p className="mt-2 text-sm text-white/76">
            {debtor.createdAt ? formatShortDate(new Date(debtor.createdAt)) : "N/A"}
          </p>
        </div>
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

export default async function DebtorDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ wallet?: string; offer?: string; offerId?: string; action?: string }>;
}) {
  const params = await searchParams;
  const { offers, debtor } = await getDebtorData(params?.wallet);
  const selectedOfferId = params?.offer ?? params?.offerId;

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-12">
        <DebtorMetrics offers={offers} debtor={debtor} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <PendingAcknowledgements offers={offers} />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <DebtorProfileCard debtor={debtor} />
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
        action={params?.action}
      />
    </>
  );
}
