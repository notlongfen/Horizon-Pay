import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";
import { jsonSafe } from "@/lib/server/json-safe";

export async function GET(request: NextRequest) {
  try {
    // Admin dashboard doesn't filter by wallet, but we accept it for consistency
    const walletAddress = request.nextUrl.searchParams.get("wallet");
    const prisma = getPrismaClient();

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

    return NextResponse.json(jsonSafe({ 
      businesses,
      debtors,
      investors,
      offers,
      adminReviews,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    return NextResponse.json(jsonSafe({ 
      businesses: [],
      debtors: [],
      investors: [],
      offers: [],
      adminReviews: [],
      error: error instanceof Error ? error.message : "Failed to fetch data"
    }), { status: 500 });
  }
}
