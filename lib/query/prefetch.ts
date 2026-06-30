import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getMarketplaceData } from "@/lib/marketplace/marketplace-service";
import { getWorkspaceData } from "@/lib/workspace/workspace-service";
import { getPrismaClient } from "@/lib/db/prisma";
import { queryKeys } from "./keys";
import { apiClient } from "@/lib/api/client";

export async function prefetchMarketplaceData() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.marketplace.all(),
    queryFn: getMarketplaceData,
  });

  return dehydrate(queryClient);
}

export async function prefetchWorkspaceData() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.workspace.data(),
    queryFn: getWorkspaceData,
  });

  return dehydrate(queryClient);
}

export async function prefetchBusinessDashboard(wallet: string) {
  const queryClient = new QueryClient();
  const prisma = getPrismaClient();

  const offers = await prisma.offer.findMany({
    where: {
      business: {
        walletAddress: wallet,
      },
    },
    include: {
      business: true,
      debtor: true,
      notes: { orderBy: { sortOrder: "asc" } },
      proofItems: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ status: "desc" }, { dueDate: "asc" }],
  });

  const business = await prisma.businessProfile.findFirst({
    where: { walletAddress: wallet },
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.business.dashboard(wallet),
    queryFn: () => ({ offers, business, timestamp: new Date().toISOString() }),
  });

  return dehydrate(queryClient);
}

export async function prefetchDebtorDashboard(wallet: string) {
  const queryClient = new QueryClient();
  const prisma = getPrismaClient();

  const offers = await prisma.offer.findMany({
    where: {
      debtor: {
        walletAddress: wallet,
      },
    },
    include: {
      business: true,
      debtor: true,
      notes: { orderBy: { sortOrder: "asc" } },
      proofItems: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ status: "desc" }, { dueDate: "asc" }],
  });

  const debtor = await prisma.debtorProfile.findFirst({
    where: { walletAddress: wallet },
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.debtor.dashboard(wallet),
    queryFn: () => ({ offers, debtor, timestamp: new Date().toISOString() }),
  });

  return dehydrate(queryClient);
}

export async function prefetchInvestorDashboard(wallet: string) {
  const queryClient = new QueryClient();
  const prisma = getPrismaClient();

  const offers = await prisma.offer.findMany({
    where: {
      status: { in: ["LISTED", "FUNDED", "PARTIALLY_REPAID"] },
    },
    include: {
      business: true,
      debtor: true,
      fundingPositions: true,
      repayments: true,
    },
    orderBy: [{ status: "desc" }, { dueDate: "asc" }],
  });

  const investor = await prisma.investorProfile.findFirst({
    where: { walletAddress: wallet },
    include: { positions: true },
  });

  await queryClient.prefetchQuery({
    queryKey: queryKeys.investor.dashboard(wallet),
    queryFn: () => ({ offers, investor, timestamp: new Date().toISOString() }),
  });

  return dehydrate(queryClient);
}

export async function prefetchOfferData(id: string) {
  const queryClient = new QueryClient();
  const prisma = getPrismaClient();

  const offer = await prisma.offer.findUnique({
    where: { publicId: id },
    include: {
      business: true,
      debtor: true,
      notes: { orderBy: { sortOrder: "asc" } },
      proofItems: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: { sortOrder: "asc" } },
      fundingPositions: true,
      repayments: true,
    },
  });

  if (!offer) {
    return dehydrate(queryClient);
  }

  await queryClient.prefetchQuery({
    queryKey: queryKeys.offers.byId(id),
    queryFn: () => ({
      offer,
      business: offer.business,
      debtor: offer.debtor,
    }),
  });

  return dehydrate(queryClient);
}

// Admin Dashboard
export async function prefetchAdminDashboard() {
  const queryClient = new QueryClient();
  const prisma = getPrismaClient();

  const [businesses, debtors, investors, offers, adminReviews] = await Promise.all([
    prisma.businessProfile.findMany({ include: { verificationDocuments: true } }),
    prisma.debtorProfile.findMany({ include: { verificationDocuments: true } }),
    prisma.investorProfile.findMany({ include: { verificationDocuments: true, positions: true } }),
    prisma.offer.findMany({
      include: { business: true, debtor: true, fundingPositions: true, repayments: true },
      orderBy: [{ status: "desc" }, { dueDate: "asc" }],
    }),
    prisma.adminReview.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => ({ businesses, debtors, investors, offers, adminReviews, timestamp: new Date().toISOString() }),
  });

  return dehydrate(queryClient);
}

// Verification Status
export async function prefetchBusinessVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.business.all(),
    queryFn: () => apiClient.getBusinessVerificationStatus(wallet),
  });

  return dehydrate(queryClient);
}

export async function prefetchDebtorVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.debtor.all(),
    queryFn: () => apiClient.getDebtorVerificationStatus(wallet),
  });

  return dehydrate(queryClient);
}

export async function prefetchInvestorVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.investor.all(),
    queryFn: () => apiClient.getInvestorVerificationStatus(wallet),
  });

  return dehydrate(queryClient);
}
