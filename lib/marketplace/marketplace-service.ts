import { getPrismaClient } from "@/lib/db/prisma";
import { getHorizonPayContracts } from "@/lib/contracts/horizonpay-contracts";
import { fallbackMarketplaceOffers } from "./fallback-offers";
import type { MarketplaceOffer, MarketplaceStats } from "./marketplace-types";
import {
  formatCents,
  titleCase,
  daysUntil,
  formatShortDate,
} from "@/lib/utils";

type DbOffer = Awaited<ReturnType<typeof queryOffersFromDatabase>>[number];

function statusLabel(status: string) {
  return titleCase(status);
}

function riskLabel(risk: string): MarketplaceOffer["risk"] {
  if (risk === "LOW") return "Low";
  if (risk === "ELEVATED") return "Elevated";
  return "Moderate";
}

function verificationLabel(status: string) {
  if (status === "KYB_VERIFIED") return "KYB verified";
  if (status === "SUSPENDED") return "Verification suspended";
  return "Verification pending";
}

async function queryOffersFromDatabase() {
  const prisma = getPrismaClient();

  return prisma.offer.findMany({
    where: {
      status: {
        in: ["ACKNOWLEDGED", "LISTED", "FUNDED"],
      },
    },
    orderBy: [{ status: "desc" }, { dueDate: "asc" }],
    include: {
      business: true,
      debtor: true,
      notes: { orderBy: { sortOrder: "asc" } },
      proofItems: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function mapDbOfferToMarketplaceOffer(offer: DbOffer): MarketplaceOffer {
  const dueInDays = daysUntil(offer.dueDate);

  return {
    id: offer.publicId,
    business: offer.business.name,
    debtor: offer.debtor.name,
    category: offer.category,
    summary: offer.summary,
    amount: formatCents(offer.principalAmountCents),
    fundingPrice: formatCents(offer.fundingPriceCents),
    expectedRepayment: formatCents(offer.expectedRepaymentCents),
    due: formatShortDate(offer.dueDate),
    term: `${dueInDays} days`,
    risk: riskLabel(offer.risk),
    repaymentAsset: offer.repaymentAsset,
    status: statusLabel(offer.status),
    verification: verificationLabel(offer.business.verificationStatus),
    acknowledgement:
      offer.status === "DRAFT" ? "Awaiting debtor" : "Debtor acknowledged",
    industry: offer.business.industry,
    dueInDays: `${dueInDays} days`,
    fundedShare: `${(offer.fundedBasisPoints / 100).toFixed(1)}%`,
    contractId: offer.marketplaceContract ?? undefined,
    onchainOfferId: offer.onchainOfferId ?? undefined,
    metadataHash: offer.metadataHash,
    lastIndexedAt: offer.lastIndexedAt?.toISOString(),
    notes: offer.notes.map((note) => note.body),
    proof: offer.proofItems.map((item) => item.label),
    timeline: offer.timeline.map((item) => ({
      label: item.label,
      value: item.value,
    })),
  };
}

function buildStats(offers: MarketplaceOffer[]): MarketplaceStats {
  const listedOffers = offers.filter((offer) => offer.status === "Listed");
  const value = offers.reduce((total, offer) => {
    const numeric = Number(offer.amount.replace(/[$,]/g, ""));
    return total + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);
  const dueWindows = offers
    .map((offer) => Number.parseInt(offer.dueInDays, 10))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const medianDue =
    dueWindows.length === 0
      ? 0
      : dueWindows[Math.floor((dueWindows.length - 1) / 2)];

  return {
    listedOffers: listedOffers.length.toString(),
    receivablesValue: formatCents(BigInt(Math.round(value * 100))),
    medianDueWindow: `${medianDue}d`,
    acknowledged: offers.length > 0 ? "100%" : "0%",
  };
}

export async function getMarketplaceData() {
  const contracts = getHorizonPayContracts();

  if (!process.env.DATABASE_URL) {
    const offers = fallbackMarketplaceOffers.map((offer) => ({
      ...offer,
      contractId: contracts.marketplace,
    }));

    return {
      offers,
      stats: buildStats(offers),
      contracts,
      source: "fallback" as const,
    };
  }

  try {
    const dbOffers = await queryOffersFromDatabase();
    const offers = dbOffers.map(mapDbOfferToMarketplaceOffer);

    return {
      offers,
      stats: buildStats(offers),
      contracts,
      source: "database" as const,
    };
  } catch (error) {
    console.error("Failed to read marketplace offers from Prisma", error);

    const offers = fallbackMarketplaceOffers.map((offer) => ({
      ...offer,
      contractId: contracts.marketplace,
    }));

    return {
      offers,
      stats: buildStats(offers),
      contracts,
      source: "fallback" as const,
    };
  }
}
