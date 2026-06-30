"use server";

import { getPrismaClient } from "../db/prisma";
import { VerificationDocumentType, VerificationStatus } from "../../app/generated/prisma/enums";

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

interface VerificationResult {
  success: boolean;
  error?: string;
  profile?: any;
}

/**
 * Upload and process verification documents for business KYB
 */
export async function uploadVerificationDocument(
  submission: VerificationSubmission
): Promise<VerificationResult> {
  try {
    const { walletAddress, businessInfo, documents } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
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
          // Set basic info from submission
          name: businessInfo.registrationNumber || `Business-${walletAddress.slice(0, 6)}`,
          industry: "General",
        },
      });
    } else {
      // Update existing profile status
      await prisma.businessProfile.update({
        where: { walletAddress },
        data: { verificationStatus: VerificationStatus.SUBMITTED },
      });
    }

    // Process each document - if documentId exists (from upload API), update it to associate with business
    for (const doc of documents) {
      if (doc.documentId) {
        // Document was already created by upload API, just update it to associate with business
        await prisma.verificationDocument.update({
          where: { id: doc.documentId },
          data: {
            businessId: businessProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record (for backward compatibility)
        await prisma.verificationDocument.create({
          data: {
            businessId: businessProfile.id,
            documentType: doc.docType as VerificationDocumentType,
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
      },
    });

    const updatedProfile = await prisma.businessProfile.findUnique({
      where: { walletAddress },
      include: {
        verificationDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return {
      success: true,
      profile: updatedProfile,
    };
  } catch (error: any) {
    console.error("Verification submission error:", error);
    return {
      success: false,
      error: error.message || "Failed to process verification documents",
    };
  }
}

/**
 * Get verification status and data for a business
 */
export async function getBusinessVerificationStatus(walletAddress: string) {
  const prisma = getPrismaClient();
  
  const profile = await prisma.businessProfile.findUnique({
    where: { walletAddress },
    include: {
      verificationDocuments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return profile;
}

/**
 * Get verification status and data for an investor
 */
export async function getInvestorVerificationStatus(walletAddress: string) {
  const prisma = getPrismaClient();
  
  const profile = await prisma.investorProfile.findUnique({
    where: { walletAddress },
    include: {
      verificationDocuments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return profile;
}

/**
 * Get verification status and data for a debtor
 */
export async function getDebtorVerificationStatus(walletAddress: string) {
  const prisma = getPrismaClient();
  
  const profile = await prisma.debtorProfile.findUnique({
    where: { walletAddress },
    include: {
      verificationDocuments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return profile;
}

/**
 * Submit investor KYC verification
 */
export async function uploadInvestorVerification(
  submission: {
    walletAddress: string;
    investorInfo: Record<string, string>;
    documents: DocumentData[];
  }
): Promise<VerificationResult> {
  try {
    const { walletAddress, investorInfo, documents } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
    }

    const prisma = getPrismaClient();

    // Check if investor profile exists
    let investorProfile = await prisma.investorProfile.findUnique({
      where: { walletAddress },
    });

    if (!investorProfile) {
      investorProfile = await prisma.investorProfile.create({
        data: {
          name: investorInfo.name || "Investor",
          walletAddress,
          verificationStatus: VerificationStatus.SUBMITTED,
          investorType: investorInfo.investorType || "INDIVIDUAL",
          institutionName: investorInfo.institutionName || null,
        },
      });
    } else {
      await prisma.investorProfile.update({
        where: { walletAddress },
        data: { verificationStatus: VerificationStatus.SUBMITTED },
      });
    }

    // Process documents - if documentId exists (from upload API), update it to associate with investor
    for (const doc of documents) {
      if (doc.documentId) {
        // Document was already created by upload API, just update it to associate with investor
        await prisma.verificationDocument.update({
          where: { id: doc.documentId },
          data: {
            investorId: investorProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record (for backward compatibility)
        await prisma.verificationDocument.create({
          data: {
            investorId: investorProfile.id,
            documentType: doc.docType as VerificationDocumentType,
            documentName: doc.fileName,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            fileUrl: doc.fileUrl || `/uploads/investors/${walletAddress}/${Date.now()}-${doc.fileName}`,
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
        investorType: investorInfo.investorType,
        institutionName: investorInfo.institutionName,
        accreditationStatus: investorInfo.accreditationStatus,
        accreditationDocument: investorInfo.accreditationDocument,
      },
    });

    const updatedProfile = await prisma.investorProfile.findUnique({
      where: { walletAddress },
      include: {
        verificationDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return {
      success: true,
      profile: updatedProfile,
    };
  } catch (error: any) {
    console.error("Investor verification error:", error);
    return {
      success: false,
      error: error.message || "Failed to process investor verification",
    };
  }
}

/**
 * Submit debtor verification
 */
export async function uploadDebtorVerification(
  submission: {
    walletAddress: string;
    debtorInfo: Record<string, string>;
    documents: DocumentData[];
  }
): Promise<VerificationResult> {
  try {
    const { walletAddress, debtorInfo, documents } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
    }

    const prisma = getPrismaClient();

    // Check if debtor profile exists
    let debtorProfile = await prisma.debtorProfile.findUnique({
      where: { walletAddress },
    });

    if (!debtorProfile) {
      debtorProfile = await prisma.debtorProfile.create({
        data: {
          name: debtorInfo.name || "Debtor",
          walletAddress,
          verificationStatus: VerificationStatus.SUBMITTED,
        },
      });
    } else {
      await prisma.debtorProfile.update({
        where: { walletAddress },
        data: { verificationStatus: VerificationStatus.SUBMITTED },
      });
    }

    // Process documents - if documentId exists (from upload API), update it to associate with debtor
    for (const doc of documents) {
      if (doc.documentId) {
        // Document was already created by upload API, just update it to associate with debtor
        await prisma.verificationDocument.update({
          where: { id: doc.documentId },
          data: {
            debtorId: debtorProfile.id,
            documentName: doc.fileName,
            verificationStatus: "PENDING",
          },
        });
      } else {
        // Fallback: create document record (for backward compatibility)
        await prisma.verificationDocument.create({
          data: {
            debtorId: debtorProfile.id,
            documentType: doc.docType as VerificationDocumentType,
            documentName: doc.fileName,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            fileUrl: doc.fileUrl || `/uploads/debtors/${walletAddress}/${Date.now()}-${doc.fileName}`,
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

    const updatedProfile = await prisma.debtorProfile.findUnique({
      where: { walletAddress },
      include: {
        verificationDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return {
      success: true,
      profile: updatedProfile,
    };
  } catch (error: any) {
    console.error("Debtor verification error:", error);
    return {
      success: false,
      error: error.message || "Failed to process debtor verification",
    };
  }
}

// =============================================================================
// DRAFT SAVE FUNCTIONS
// These save data without submitting for verification (status remains PENDING)
// =============================================================================

/**
 * Save business profile as draft (does not submit for verification)
 */
export async function saveBusinessDraft(
  submission: {
    walletAddress: string;
    businessInfo: Record<string, string>;
  }
): Promise<VerificationResult> {
  try {
    const { walletAddress, businessInfo } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
    }

    const prisma = getPrismaClient();

    // Upsert business profile with draft data
    const profile = await prisma.businessProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        verificationStatus: VerificationStatus.PENDING,
        name: businessInfo.registrationNumber || "Business",
        industry: businessInfo.industry || "Other",
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
      },
      update: {
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
      },
    });

    return {
      success: true,
      profile,
    };
  } catch (error: any) {
    console.error("Business draft save error:", error);
    return {
      success: false,
      error: error.message || "Failed to save business draft",
    };
  }
}

/**
 * Save investor profile as draft
 */
export async function saveInvestorDraft(
  submission: {
    walletAddress: string;
    investorInfo: Record<string, string>;
  }
): Promise<VerificationResult> {
  try {
    const { walletAddress, investorInfo } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
    }

    const prisma = getPrismaClient();

    const profile = await prisma.investorProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        verificationStatus: VerificationStatus.PENDING,
        name: investorInfo.name || "Investor",
        investorType: investorInfo.investorType || "INDIVIDUAL",
        institutionName: investorInfo.institutionName,
        address: investorInfo.address,
        city: investorInfo.city,
        state: investorInfo.state,
        country: investorInfo.country,
        postalCode: investorInfo.postalCode,
        email: investorInfo.email,
        phone: investorInfo.phone,
        accreditationStatus: investorInfo.accreditationStatus,
        accreditationDocument: investorInfo.accreditationDocument,
      },
      update: {
        name: investorInfo.name,
        investorType: investorInfo.investorType,
        institutionName: investorInfo.institutionName,
        address: investorInfo.address,
        city: investorInfo.city,
        state: investorInfo.state,
        country: investorInfo.country,
        postalCode: investorInfo.postalCode,
        email: investorInfo.email,
        phone: investorInfo.phone,
        accreditationStatus: investorInfo.accreditationStatus,
        accreditationDocument: investorInfo.accreditationDocument,
      },
    });

    return {
      success: true,
      profile,
    };
  } catch (error: any) {
    console.error("Investor draft save error:", error);
    return {
      success: false,
      error: error.message || "Failed to save investor draft",
    };
  }
}

/**
 * Save debtor profile as draft
 */
export async function saveDebtorDraft(
  submission: {
    walletAddress: string;
    debtorInfo: Record<string, string>;
  }
): Promise<VerificationResult> {
  try {
    const { walletAddress, debtorInfo } = submission;

    if (!walletAddress) {
      return { success: false, error: "Wallet address is required" };
    }

    const prisma = getPrismaClient();

    const profile = await prisma.debtorProfile.upsert({
      where: { walletAddress },
      create: {
        walletAddress,
        verificationStatus: VerificationStatus.PENDING,
        name: debtorInfo.name || "Debtor",
        address: debtorInfo.address,
        city: debtorInfo.city,
        state: debtorInfo.state,
        country: debtorInfo.country,
        postalCode: debtorInfo.postalCode,
        email: debtorInfo.email,
        phone: debtorInfo.phone,
        dateOfBirth: debtorInfo.dateOfBirth ? new Date(debtorInfo.dateOfBirth) : null,
      },
      update: {
        name: debtorInfo.name,
        address: debtorInfo.address,
        city: debtorInfo.city,
        state: debtorInfo.state,
        country: debtorInfo.country,
        postalCode: debtorInfo.postalCode,
        email: debtorInfo.email,
        phone: debtorInfo.phone,
        dateOfBirth: debtorInfo.dateOfBirth ? new Date(debtorInfo.dateOfBirth) : undefined,
      },
    });

    return {
      success: true,
      profile,
    };
  } catch (error: any) {
    console.error("Debtor draft save error:", error);
    return {
      success: false,
      error: error.message || "Failed to save debtor draft",
    };
  }
}