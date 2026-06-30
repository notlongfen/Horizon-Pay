import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const { walletAddress, businessInfo } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Upsert business profile with draft data
    const profile = await prisma.businessProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        name: businessInfo.name || businessInfo.registrationNumber,
        industry: businessInfo.industry,
        registrationNumber: businessInfo.registrationNumber,
        taxId: businessInfo.taxId,
        businessAddress: businessInfo.businessAddress,
        city: businessInfo.city,
        state: businessInfo.state,
        country: businessInfo.country,
        postalCode: businessInfo.postalCode,
        website: businessInfo.website,
        contactEmail: businessInfo.contactEmail,
        contactPhone: businessInfo.contactPhone,
        legalRepresentative: businessInfo.legalRepresentative,
        verificationStatus: "PENDING",
      },
      update: {
        name: businessInfo.name || businessInfo.registrationNumber,
        industry: businessInfo.industry,
        registrationNumber: businessInfo.registrationNumber,
        taxId: businessInfo.taxId,
        businessAddress: businessInfo.businessAddress,
        city: businessInfo.city,
        state: businessInfo.state,
        country: businessInfo.country,
        postalCode: businessInfo.postalCode,
        website: businessInfo.website,
        contactEmail: businessInfo.contactEmail,
        contactPhone: businessInfo.contactPhone,
        legalRepresentative: businessInfo.legalRepresentative,
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
