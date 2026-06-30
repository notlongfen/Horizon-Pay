import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Fetch business profile by wallet address
    const profile = await prisma.businessProfile.findFirst({
      where: { walletAddress },
    });

    if (!profile) {
      return NextResponse.json(
        { success: true, profile: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
