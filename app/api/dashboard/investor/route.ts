import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";
import { jsonSafe } from "@/lib/server/json-safe";

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("wallet");
    const prisma = getPrismaClient();

    const whereClause = walletAddress 
      ? {
          investor: {
            walletAddress: walletAddress,
          },
        }
      : {};

    const fundingPositions = await prisma.fundingPosition.findMany({
      where: whereClause,
      include: {
        offer: {
          include: {
            business: true,
            debtor: true,
            notes: { orderBy: { sortOrder: "asc" } },
            proofItems: { orderBy: { sortOrder: "asc" } },
            timeline: { orderBy: { sortOrder: "asc" } },
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
      : null;

    return NextResponse.json(jsonSafe({ 
      fundingPositions, 
      investor,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch investor data:", error);
    return NextResponse.json(jsonSafe({ 
      fundingPositions: [], 
      investor: null,
      error: error instanceof Error ? error.message : "Failed to fetch data"
    }), { status: 500 });
  }
}
