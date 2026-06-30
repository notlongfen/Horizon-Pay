import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { success: false, error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    const prisma = getPrismaClient();
    const profile = await prisma.investorProfile.findUnique({
      where: { walletAddress },
      include: {
        verificationDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
