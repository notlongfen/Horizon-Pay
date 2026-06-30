import { getMarketplaceData } from "@/lib/marketplace/marketplace-service";
import { getWorkspaceData } from "@/lib/workspace/workspace-service";
import { ApiResponse } from "./api-response";

// Cache configuration
const CACHE_TTL = {
  MARKETPLACE: 30, // 30 seconds
  WORKSPACE: 15, // 15 seconds
  BUSINESS: 15, // 15 seconds
  DEBTOR: 15, // 15 seconds
  INVESTOR: 15, // 15 seconds
} as const;

let marketplaceCache: { data: any; timestamp: number } | null = null;
let workspaceCache: { data: any; timestamp: number } | null = null;
let businessCache: Map<string, { data: any; timestamp: number }> = new Map();
let debtorCache: Map<string, { data: any; timestamp: number }> = new Map();
let investorCache: Map<string, { data: any; timestamp: number }> = new Map();

export async function cachedMarketplaceHandler() {
  const now = Date.now();

  // Return cached data if fresh
  if (marketplaceCache && now - marketplaceCache.timestamp < CACHE_TTL.MARKETPLACE * 1000) {
    return ApiResponse.success(marketplaceCache.data);
  }

  try {
    const data = await getMarketplaceData();
    marketplaceCache = { data, timestamp: now };
    return ApiResponse.success(data);
  } catch (error) {
    // Return stale cache if available
    if (marketplaceCache) {
      console.warn("Marketplace cache stale, returning old data");
      return ApiResponse.success(marketplaceCache.data);
    }
    return ApiResponse.serverError(error instanceof Error ? error : String(error));
  }
}

export async function cachedWorkspaceHandler() {
  const now = Date.now();

  // Return cached data if fresh
  if (workspaceCache && now - workspaceCache.timestamp < CACHE_TTL.WORKSPACE * 1000) {
    return ApiResponse.success(workspaceCache.data);
  }

  try {
    const data = await getWorkspaceData();
    workspaceCache = { data, timestamp: now };
    return ApiResponse.success(data);
  } catch (error) {
    // Return stale cache if available
    if (workspaceCache) {
      console.warn("Workspace cache stale, returning old data");
      return ApiResponse.success(workspaceCache.data);
    }
    return ApiResponse.serverError(error instanceof Error ? error : String(error));
  }
}

export async function cachedBusinessDashboardHandler(wallet: string) {
  const now = Date.now();
  const cacheKey = wallet;

  // Return cached data if fresh
  const cached = businessCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL.BUSINESS * 1000) {
    return ApiResponse.success(cached.data);
  }

  try {
    const { getPrismaClient } = await import("@/lib/db/prisma");
    const prisma = getPrismaClient();

    const [offers, business] = await Promise.all([
      prisma.offer.findMany({
        where: { business: { walletAddress: wallet } },
        include: {
          business: true,
          debtor: true,
          notes: { orderBy: { sortOrder: "asc" } },
          proofItems: { orderBy: { sortOrder: "asc" } },
          timeline: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ status: "desc" }, { dueDate: "asc" }],
      }),
      prisma.businessProfile.findFirst({ where: { walletAddress: wallet } }),
    ]);

    const data = { offers, business, timestamp: new Date().toISOString() };
    businessCache.set(cacheKey, { data, timestamp: now });
    return ApiResponse.success(data);
  } catch (error) {
    // Return stale cache if available
    const cached = businessCache.get(cacheKey);
    if (cached) {
      console.warn(`Business dashboard cache stale for ${wallet}, returning old data`);
      return ApiResponse.success(cached.data);
    }
    return ApiResponse.serverError(error instanceof Error ? error : String(error));
  }
}

export async function cachedDebtorDashboardHandler(wallet: string) {
  const now = Date.now();
  const cacheKey = wallet;

  // Return cached data if fresh
  const cached = debtorCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL.DEBTOR * 1000) {
    return ApiResponse.success(cached.data);
  }

  try {
    const { getPrismaClient } = await import("@/lib/db/prisma");
    const prisma = getPrismaClient();

    const [offers, debtor] = await Promise.all([
      prisma.offer.findMany({
        where: { debtor: { walletAddress: wallet } },
        include: {
          business: true,
          debtor: true,
          notes: { orderBy: { sortOrder: "asc" } },
          proofItems: { orderBy: { sortOrder: "asc" } },
          timeline: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: [{ status: "desc" }, { dueDate: "asc" }],
      }),
      prisma.debtorProfile.findFirst({ where: { walletAddress: wallet } }),
    ]);

    const data = { offers, debtor, timestamp: new Date().toISOString() };
    debtorCache.set(cacheKey, { data, timestamp: now });
    return ApiResponse.success(data);
  } catch (error) {
    // Return stale cache if available
    const cached = debtorCache.get(cacheKey);
    if (cached) {
      console.warn(`Debtor dashboard cache stale for ${wallet}, returning old data`);
      return ApiResponse.success(cached.data);
    }
    return ApiResponse.serverError(error instanceof Error ? error : String(error));
  }
}

export async function cachedInvestorDashboardHandler(wallet: string) {
  const now = Date.now();
  const cacheKey = wallet;

  // Return cached data if fresh
  const cached = investorCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL.INVESTOR * 1000) {
    return ApiResponse.success(cached.data);
  }

  try {
    const { getPrismaClient } = await import("@/lib/db/prisma");
    const prisma = getPrismaClient();

    const [offers, investor] = await Promise.all([
      prisma.offer.findMany({
        where: { status: { in: ["LISTED", "FUNDED", "PARTIALLY_REPAID"] } },
        include: {
          business: true,
          debtor: true,
          fundingPositions: true,
          repayments: true,
        },
        orderBy: [{ status: "desc" }, { dueDate: "asc" }],
      }),
      prisma.investorProfile.findFirst({
        where: { walletAddress: wallet },
        include: { positions: true },
      }),
    ]);

    const data = { offers, investor, timestamp: new Date().toISOString() };
    investorCache.set(cacheKey, { data, timestamp: now });
    return ApiResponse.success(data);
  } catch (error) {
    // Return stale cache if available
    const cached = investorCache.get(cacheKey);
    if (cached) {
      console.warn(`Investor dashboard cache stale for ${wallet}, returning old data`);
      return ApiResponse.success(cached.data);
    }
    return ApiResponse.serverError(error instanceof Error ? error : String(error));
  }
}

// Clear cache functions (useful for testing or after mutations)
export function clearMarketplaceCache() {
  marketplaceCache = null;
}

export function clearWorkspaceCache() {
  workspaceCache = null;
}

export function clearBusinessCache(wallet?: string) {
  if (wallet) {
    businessCache.delete(wallet);
  } else {
    businessCache.clear();
  }
}

export function clearDebtorCache(wallet?: string) {
  if (wallet) {
    debtorCache.delete(wallet);
  } else {
    debtorCache.clear();
  }
}

export function clearInvestorCache(wallet?: string) {
  if (wallet) {
    investorCache.delete(wallet);
  } else {
    investorCache.clear();
  }
}

export function clearAllCaches() {
  marketplaceCache = null;
  workspaceCache = null;
  businessCache.clear();
  debtorCache.clear();
  investorCache.clear();
}
