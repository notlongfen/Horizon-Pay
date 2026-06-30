import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const { walletAddress, investorInfo } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Upsert investor profile with draft data
    const profile = await prisma.investorProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        name: investorInfo.fullName || investorInfo.name,
        email: investorInfo.email,
        phone: investorInfo.phone,
        address: investorInfo.address,
        city: investorInfo.city,
        state: investorInfo.state,
        country: investorInfo.country,
        postalCode: investorInfo.postalCode,
        investorType: investorInfo.investorType,
        institutionName: investorInfo.institutionName,
        accreditationStatus: investorInfo.accreditationStatus,
        accreditationDocument: investorInfo.accreditationDocument,
        verificationStatus: "PENDING",
      },
      update: {
        name: investorInfo.fullName || investorInfo.name,
        email: investorInfo.email,
        phone: investorInfo.phone,
        address: investorInfo.address,
        city: investorInfo.city,
        state: investorInfo.state,
        country: investorInfo.country,
        postalCode: investorInfo.postalCode,
        investorType: investorInfo.investorType,
        institutionName: investorInfo.institutionName,
        accreditationStatus: investorInfo.accreditationStatus,
        accreditationDocument: investorInfo.accreditationDocument,
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
