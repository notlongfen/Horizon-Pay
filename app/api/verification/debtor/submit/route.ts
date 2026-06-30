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
  debtorInfo: Record<string, string>;
  documents: DocumentData[];
}

export async function POST(request: Request) {
  try {
    const { walletAddress, debtorInfo, documents }: VerificationSubmission = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    // Check if debtor profile exists
    let debtorProfile = await prisma.debtorProfile.findUnique({
      where: { walletAddress },
    });

    if (!debtorProfile) {
      // Create new debtor profile
      debtorProfile = await prisma.debtorProfile.create({
        data: {
          walletAddress,
          verificationStatus: VerificationStatus.SUBMITTED,
          name: debtorInfo.name || `Debtor-${walletAddress.slice(0, 6)}`,
        },
      });
    } else {
      // Update existing profile status
      await prisma.debtorProfile.update({
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
            debtorId: debtorProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record
        await prisma.verificationDocument.create({
          data: {
            debtorId: debtorProfile.id,
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

    // Update debtor profile with additional info
    await prisma.debtorProfile.update({
      where: { walletAddress },
      data: {
        name: debtorInfo.name,
        email: debtorInfo.email,
        phone: debtorInfo.phone,
        address: debtorInfo.address,
        city: debtorInfo.city,
        state: debtorInfo.state,
        country: debtorInfo.country,
        postalCode: debtorInfo.postalCode,
      },
    });

    return NextResponse.json({ success: true, profile: debtorProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit verification" },
      { status: 500 }
    );
  }
}
