import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";
import { jsonSafe } from "@/lib/server/json-safe";

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("wallet");
    const prisma = getPrismaClient();

    const whereClause = walletAddress 
      ? {
          business: {
            walletAddress: walletAddress,
          },
        }
      : {};

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
      : null;

    return NextResponse.json(jsonSafe({ 
      offers, 
      business,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Failed to fetch business data:", error);
    return NextResponse.json(jsonSafe({ 
      offers: [], 
      business: null,
      error: error instanceof Error ? error.message : "Failed to fetch data"
    }), { status: 500 });
  }
}
