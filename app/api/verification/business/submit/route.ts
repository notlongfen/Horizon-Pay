import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db/prisma";
import { VerificationStatus } from "@/app/generated/prisma/enums";

interface DocumentData {
  docType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string;
  documentId?: string;
}

interface VerificationSubmission {
  walletAddress: string;
  businessInfo: Record<string, string>;
  documents: DocumentData[];
}

export async function POST(request: Request) {
  try {
    const { walletAddress, businessInfo, documents }: VerificationSubmission = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Check if business profile exists
    let businessProfile = await prisma.businessProfile.findUnique({
      where: { walletAddress },
    });

    if (!businessProfile) {
      // Create new business profile
      businessProfile = await prisma.businessProfile.create({
        data: {
          walletAddress,
          verificationStatus: VerificationStatus.SUBMITTED,
          name: businessInfo.registrationNumber || `Business-${walletAddress.slice(0, 6)}`,
          industry: businessInfo.industry || "General",
        },
      });
    } else {
      // Update existing profile status
      await prisma.businessProfile.update({
        where: { walletAddress },
        data: { verificationStatus: VerificationStatus.SUBMITTED },
      });
    }

    // Process each document
    for (const doc of documents) {
      if (doc.documentId) {
        // Document was already created by upload API, just update it
        await prisma.verificationDocument.update({
          where: { id: doc.documentId },
          data: {
            businessId: businessProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record
        await prisma.verificationDocument.create({
          data: {
            businessId: businessProfile.id,
            documentType: doc.docType as any,
            documentName: doc.fileName,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            fileUrl: doc.fileUrl || `/uploads/${walletAddress}/${Date.now()}-${doc.fileName}`,
            uploadStatus: "UPLOADED",
            verificationStatus: "PENDING",
          },
        });
      }
    }

    // Update business profile with additional info
    await prisma.businessProfile.update({
      where: { walletAddress },
      data: {
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
        industry: businessInfo.industry,
      },
    });

    return NextResponse.json({ success: true, profile: businessProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit verification" },
      { status: 500 }
    );
  }
}
