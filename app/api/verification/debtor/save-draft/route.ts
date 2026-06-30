import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const { walletAddress, debtorInfo } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Upsert debtor profile with draft data
    const profile = await prisma.debtorProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        name: debtorInfo.name,
        email: debtorInfo.email,
        phone: debtorInfo.phone,
        address: debtorInfo.address,
        city: debtorInfo.city,
        state: debtorInfo.state,
        country: debtorInfo.country,
        postalCode: debtorInfo.postalCode,
        verificationStatus: "PENDING",
      },
      update: {
        name: debtorInfo.name,
        email: debtorInfo.email,
        phone: debtorInfo.phone,
        address: debtorInfo.address,
        city: debtorInfo.city,
        state: debtorInfo.state,
        country: debtorInfo.country,
        postalCode: debtorInfo.postalCode,
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}
