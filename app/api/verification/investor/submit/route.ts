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
  investorInfo: Record<string, string>;
  documents: DocumentData[];
}

export async function POST(request: Request) {
  try {
    const { walletAddress, investorInfo, documents }: VerificationSubmission = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Check if investor profile exists
    let investorProfile = await prisma.investorProfile.findUnique({
      where: { walletAddress },
    });

    if (!investorProfile) {
      // Create new investor profile
      investorProfile = await prisma.investorProfile.create({
        data: {
          walletAddress,
          verificationStatus: VerificationStatus.SUBMITTED,
          name: investorInfo.fullName || investorInfo.name || `Investor-${walletAddress.slice(0, 6)}`,
        },
      });
    } else {
      // Update existing profile status
      await prisma.investorProfile.update({
        where: { walletAddress },
        data: { verificationStatus: VerificationStatus.SUBMITTED },
      });
    }

    // Process each document
    for (const doc of documents) {
      if (doc.documentId) {
        // Document was already created by upload API
        await prisma.verificationDocument.update({
          where: { id: doc.documentId },
          data: {
            investorId: investorProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record
        await prisma.verificationDocument.create({
          data: {
            investorId: investorProfile.id,
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

    // Update investor profile with additional info
    await prisma.investorProfile.update({
      where: { walletAddress },
      data: {
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
      },
    });

    return NextResponse.json({ success: true, profile: investorProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit verification" },
      { status: 500 }
    );
  }
}
