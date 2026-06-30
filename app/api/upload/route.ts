import { NextResponse } from "next/server";
import path from "path";
import { getPrismaClient } from "@/lib/db/prisma";
import { VerificationDocumentType } from "@/app/generated/prisma/enums";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");

// Allowed MIME types
const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024; // 10MB

interface UploadResult {
  success: boolean;
  error?: string;
  fileUrl?: string;
  documentId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const walletAddress = formData.get("walletAddress") as string;
    const docType = formData.get("docType") as string;
    const role = formData.get("role") as string; // 'business', 'investor', 'debtor'
    const file = formData.get("file") as File;

    // Validate inputs
    if (!walletAddress || !docType || !file) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: walletAddress, docType, or file" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size: ${maxFileSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Create role-specific subdirectory
    const roleDir = path.join(uploadsDir, role, walletAddress);
    
    // In production, you would save to a proper storage service
    // For development, we'll create a simple file structure
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "bin";
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filePath = path.join(roleDir, fileName);
    
    // For now, we'll just store the file metadata in the database
    // without actually saving the file (demo mode)
    const prisma = getPrismaClient();
    
    // Determine which profile to attach to based on role
    let profileId: string | undefined;
    let profileField: string;
    
    if (role === "business") {
      let business = await prisma.businessProfile.findUnique({
        where: { walletAddress }
      });
      
      // If business profile doesn't exist, create a basic one
      if (!business) {
        business = await prisma.businessProfile.create({
          data: {
            walletAddress,
            name: `Business-${walletAddress.slice(0, 6)}`,
            industry: "General",
            verificationStatus: "PENDING",
          },
        });
      }
      
      profileId = business.id;
      profileField = "businessId";
    } else if (role === "investor") {
      let investor = await prisma.investorProfile.findUnique({
        where: { walletAddress }
      });
      
      // If investor profile doesn't exist, create a basic one
      if (!investor) {
        investor = await prisma.investorProfile.create({
          data: {
            walletAddress,
            name: `Investor-${walletAddress.slice(0, 6)}`,
            verificationStatus: "PENDING",
            investorType: "INDIVIDUAL",
          },
        });
      }
      
      profileId = investor.id;
      profileField = "investorId";
    } else if (role === "debtor") {
      let debtor = await prisma.debtorProfile.findUnique({
        where: { walletAddress }
      });
      
      // If debtor profile doesn't exist, create a basic one
      if (!debtor) {
        debtor = await prisma.debtorProfile.create({
          data: {
            walletAddress,
            name: `Debtor-${walletAddress.slice(0, 6)}`,
            verificationStatus: "PENDING",
          },
        });
      }
      
      profileId = debtor.id;
      profileField = "debtorId";
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be 'business', 'investor', or 'debtor'" },
        { status: 400 }
      );
    }

    // Create verification document record
    const document = await prisma.verificationDocument.create({
      data: {
        [profileField]: profileId,
        documentType: docType as VerificationDocumentType,
        documentName: docType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileUrl: `/uploads/${role}/${walletAddress}/${fileName}`,
        uploadStatus: "UPLOADED",
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      documentId: document.id,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      fileUrl: document.fileUrl,
    });

  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}