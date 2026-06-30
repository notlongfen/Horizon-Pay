"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { saveBusinessDraft } from "@/lib/verification/verification-service";
import { BorderGlow } from "@/app/components/border-glow";
import { Card, SectionLabel, ArrowGlyph } from "@/app/components/ui";

const businessInfoFields = [
  {
    name: "industry",
    label: "Industry",
    type: "text",
    placeholder: "e.g., Healthcare, Education, Retail, Technology",
    required: true,
  },
  {
    name: "registrationNumber",
    label: "Business Registration Number",
    type: "text",
    placeholder: "Enter your business registration number",
    required: true,
  },
  {
    name: "taxId",
    label: "Tax ID / EIN",
    type: "text",
    placeholder: "Enter your tax identification number",
    required: true,
  },
  {
    name: "businessAddress",
    label: "Business Address",
    type: "text",
    placeholder: "Enter your business address",
    required: true,
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "Enter city",
    required: true,
  },
  {
    name: "state",
    label: "State / Province",
    type: "text",
    placeholder: "Enter state or province",
    required: false,
  },
  {
    name: "country",
    label: "Country",
    type: "text",
    placeholder: "Enter country",
    required: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    type: "text",
    placeholder: "Enter postal code",
    required: false,
  },
  {
    name: "website",
    label: "Website",
    type: "url",
    placeholder: "https://yourbusiness.com",
    required: false,
  },
  {
    name: "contactEmail",
    label: "Contact Email",
    type: "email",
    placeholder: "contact@yourbusiness.com",
    required: true,
  },
  {
    name: "contactPhone",
    label: "Contact Phone",
    type: "tel",
    placeholder: "+1 (555) 123-4567",
    required: false,
  },
  {
    name: "legalRepresentative",
    label: "Legal Representative",
    type: "text",
    placeholder: "Name of authorized legal representative",
    required: true,
  },
];

const businessDocumentTypes = [
  {
    type: "BUSINESS_LICENSE",
    label: "Business License",
    description: "Valid business operating license",
    required: true,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "INCORPORATION_CERTIFICATE",
    label: "Certificate of Incorporation",
    description: "Official incorporation documents",
    required: true,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
  {
    type: "TAX_ID",
    label: "Tax Identification",
    description: "Tax ID or EIN number",
    required: true,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
  {
    type: "BANK_STATEMENT",
    label: "Bank Statement",
    description: "Recent bank statement (within 3 months)",
    required: false,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
] as const;

function DocumentStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: "Pending", color: "text-lime-400", bg: "bg-lime-400/15" },
    UPLOADED: { label: "Uploaded", color: "text-cyan-400", bg: "bg-cyan-400/15" },
    VERIFIED: { label: "Verified", color: "text-emerald-400", bg: "bg-emerald-400/15" },
    REJECTED: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-400/15" },
  };

  const config = (statusConfig as any)[status] || statusConfig.PENDING;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

function BusinessDocumentCard({
  docType,
  label,
  description,
  required,
  existingDoc,
  onFileSelect,
  acceptedTypes,
  maxSize,
  isUploading = false,
}: {
  docType: string;
  label: string;
  description: string;
  required: boolean;
  existingDoc?: any;
  onFileSelect?: (docType: string, file: File) => void;
  acceptedTypes?: readonly string[];
  maxSize?: number;
  isUploading?: boolean;
}) {
  const [uploadError, setUploadError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasDocument = !!existingDoc;
  const status = existingDoc?.verificationStatus || "PENDING";

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      // Validate file type
      if (acceptedTypes && !acceptedTypes.includes(file.type as any)) {
        setUploadError(`Invalid file type. Accepted: ${acceptedTypes.join(", ")}`);
        return;
      }
      // Validate file size
      if (maxSize && file.size > maxSize) {
        setUploadError(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
        return;
      }
      
      setUploadError(undefined);
      onFileSelect(docType, file);
    }
  }, [docType, onFileSelect, acceptedTypes, maxSize]);

  const handleCardClick = useCallback(() => {
    if (fileInputRef.current && onFileSelect && !hasDocument && !isUploading) {
      fileInputRef.current.click();
    }
  }, [onFileSelect, hasDocument, isUploading]);

  return (
    <Card padding="sm" className={onFileSelect && !hasDocument ? "cursor-pointer hover:bg-white/[0.02] transition-colors" : ""} onClick={handleCardClick}>
      <input
        type="file"
        id={`file-upload-${docType}`}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={acceptedTypes?.join(",")}
        disabled={isUploading || !onFileSelect}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{label}</h4>
            {required && (
              <span className="text-xs text-rose-400 font-medium">Required</span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/64">{description}</p>
          {hasDocument && (
            <div className="mt-3 flex items-center gap-3">
              <DocumentStatusBadge status={status} />
              <span className="text-xs text-white/52">
                {existingDoc.fileName}
              </span>
            </div>
          )}
          {uploadError && (
            <p className="mt-2 text-xs text-rose-400">{uploadError}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/[0.04] flex items-center justify-center">
            {hasDocument ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isUploading ? (
              <svg className="w-5 h-5 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white/64" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function VerificationStatusPanel({
  profile,
  documents,
}: {
  profile: any;
  documents: any[];
}) {
  const totalRequired = businessDocumentTypes.filter((d) => d.required).length;
  const uploadedRequired = documents.filter(
    (d) =>
      businessDocumentTypes.some(
        (docType) =>
          docType.type === d.documentType && docType.required && d.uploadStatus === "UPLOADED"
      )
  ).length;

  const completionPercentage = Math.round(
    (uploadedRequired / totalRequired) * 100
  );

  const verificationStatus = profile?.verificationStatus;

  const statusConfig = {
    PENDING: {
      label: "Not Started",
      description: "Submit your business documents to begin verification",
      color: "text-lime-400",
      progress: 0,
    },
    SUBMITTED: {
      label: "Submitted",
      description: "Your documents are being reviewed by our team",
      color: "text-cyan-400",
      progress: 50,
    },
    IN_REVIEW: {
      label: "In Review",
      description: "Our compliance team is verifying your documents",
      color: "text-cyan-400",
      progress: 75,
    },
    KYB_VERIFIED: {
      label: "Verified",
      description: "Your KYB verification is complete",
      color: "text-emerald-400",
      progress: 100,
    },
    REJECTED: {
      label: "Rejected",
      description: profile?.rejectionNotes || "Please resubmit your documents",
      color: "text-rose-400",
      progress: 0,
    },
    SUSPENDED: {
      label: "Suspended",
      description: "Your verification has been suspended",
      color: "text-amber-400",
      progress: 0,
    },
  };

  const currentStatus = (statusConfig as any)[verificationStatus] ||
    statusConfig.PENDING;

  return (
    <BorderGlow className="glass-panel p-6">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full border-4 border-cyan-400/20 bg-cyan-400/5 flex items-center justify-center relative">
          <svg
            className="w-12 h-12 text-cyan-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray={314}
              strokeDashoffset={314 - (314 * currentStatus.progress) / 100}
            />
          </svg>
          <div className="absolute text-lg font-semibold text-cyan-400">
            {currentStatus.progress}%
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className={`text-2xl font-semibold ${currentStatus.color}`}>
              {currentStatus.label}
            </h3>
          </div>
          <p className="mt-2 text-white/64">{currentStatus.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-medium">
              {uploadedRequired}/{totalRequired} Required Documents
            </span>
          </div>
        </div>
      </div>
    </BorderGlow>
  );
}

function EditableBusinessInfoField({
  field,
  value,
  onChange,
}: {
  field: any;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/88">{field.label}</span>
        {field.required && (
          <span className="text-xs text-rose-400 font-medium">Required</span>
        )}
      </label>
      <input
        type={field.type}
        name={field.name}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.12] px-4 py-3 text-white placeholder:text-white/52 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-transparent transition-colors cursor-text"
      />
    </div>
  );
}

function BusinessInfoFormSection({
  profile,
  formData,
  onFieldChange,
  onSaveDraft,
  onReset,
  isSaving,
  saveMessage,
}: {
  profile: any;
  formData: Record<string, string>;
  onFieldChange: (name: string, value: string) => void;
  onSaveDraft: () => void;
  onReset: () => void;
  isSaving: boolean;
  saveMessage: { type: "success" | "error"; text: string } | null;
}) {
  const fields = businessInfoFields;
  const completedFields = fields.filter(
    (f) => formData[f.name]?.trim()
  ).length;

  return (
    <BorderGlow className="glass-panel p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-semibold text-white">
          Business Information
        </h3>
        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={isSaving}
            className="glass-button inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium text-white/70 transition hover:text-white disabled:opacity-50"
          >
            Reset
          </button>
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="inline-flex min-h-9 items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>
      
      {saveMessage && (
        <div className={`mb-4 flex items-center gap-3 rounded-xl p-4 ${
          saveMessage.type === "success" 
            ? "border border-emerald-400/40 bg-emerald-400/10" 
            : "border border-rose-400/40 bg-rose-400/10"
        }`}>
          <svg
            className={`w-5 h-5 flex-shrink-0 ${
              saveMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={saveMessage.type === "success" ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
            />
          </svg>
          <p className={saveMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}>
            {saveMessage.text}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <EditableBusinessInfoField
            key={field.name}
            field={field}
            value={formData[field.name] || ""}
            onChange={onFieldChange}
          />
        ))}
      </div>
      <div className="mt-4 text-right">
        <span className="text-sm text-white/52">
          {completedFields}/{fields.length} fields complete
        </span>
      </div>
    </BorderGlow>
  );
}

export function BusinessKYBForm({
  walletAddress,
  initialProfile,
  initialDocuments,
}: {
  walletAddress: string;
  initialProfile: any;
  initialDocuments: any[];
}) {
  const [profile, setProfile] = useState<any>(initialProfile);
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize form data from profile
  useEffect(() => {
    const initialFormData: Record<string, string> = {};
    businessInfoFields.forEach((field) => {
      if (initialProfile?.[field.name as keyof typeof initialProfile]) {
        initialFormData[field.name] = initialProfile[field.name as keyof typeof initialProfile] as string;
      }
    });
    setFormData(initialFormData);
  }, [initialProfile]);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!walletAddress) {
      setSaveMessage({ type: "error", text: "Wallet address is required" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveBusinessDraft({
        walletAddress,
        businessInfo: formData,
      });

      if (result.success) {
        setSaveMessage({ type: "success", text: "Draft saved successfully!" });
        setProfile(result.profile);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save draft" });
      }
    } catch (error: any) {
      setSaveMessage({ type: "error", text: error.message || "Failed to save draft" });
    } finally {
      setIsSaving(false);
    }
  }, [walletAddress, formData]);

  const handleReset = useCallback(() => {
    // Reset form data to profile values
    const resetData: Record<string, string> = {};
    businessInfoFields.forEach((field) => {
      resetData[field.name] = profile?.[field.name as keyof typeof profile] || "";
    });
    setFormData(resetData);
    setSaveMessage(null);
  }, [profile]);

  const handleFileSelect = useCallback(async (docType: string, file: File) => {
    if (!walletAddress) {
      setUploadMessage({ type: "error", text: "Wallet address is required" });
      return;
    }

    setIsUploading(docType);
    setUploadMessage(null);

    try {
      const docConfig = businessDocumentTypes.find((d) => d.type === docType);
      
      // Validate file type
      if (docConfig?.acceptedTypes && !docConfig.acceptedTypes.includes(file.type as any)) {
        setUploadMessage({ type: "error", text: `Invalid file type for ${docConfig.label}. Accepted: ${docConfig.acceptedTypes.join(", ")}` });
        return;
      }
      
      // Validate file size
      if (docConfig?.maxSize && file.size > docConfig.maxSize) {
        setUploadMessage({ type: "error", text: `File too large for ${docConfig.label}. Maximum size: 10MB` });
        return;
      }

      // Upload the file
      const formDataForUpload = new FormData();
      formDataForUpload.append("walletAddress", walletAddress);
      formDataForUpload.append("docType", docType);
      formDataForUpload.append("role", "business");
      formDataForUpload.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formDataForUpload,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || `Failed to upload ${docType}`);
      }

      // Update files state
      setFiles((prev) => ({ ...prev, [docType]: file }));
      
      // Update documents state to show the uploaded file
      setDocuments((prev) => [
        ...prev.filter((d) => d.documentType !== docType),
        {
          documentType: docType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadStatus: "UPLOADED",
          verificationStatus: "PENDING",
        },
      ]);

      setUploadMessage({ type: "success", text: `${docConfig?.label || docType} uploaded successfully!` });
      setTimeout(() => setUploadMessage(null), 3000);

    } catch (error: any) {
      setUploadMessage({ type: "error", text: error.message || `Failed to upload ${docType}` });
    } finally {
      setIsUploading(null);
    }
  }, [walletAddress]);

  return (
    <>
      <section className="parallax-section mx-auto max-w-7xl px-5 pb-16">
        <VerificationStatusPanel profile={profile} documents={documents} />
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-16">
        <BusinessInfoFormSection
          profile={profile}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSaveDraft={handleSaveDraft}
          onReset={handleReset}
          isSaving={isSaving}
          saveMessage={saveMessage}
        />
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-20">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div>
            <SectionLabel>Required Documents</SectionLabel>
            <h2 className="text-2xl font-semibold text-white">
              Business Verification Documents
            </h2>
            <p className="mt-2 text-white/64">
              Upload the required documents to verify your business identity.
            </p>
          </div>
        </div>

        {uploadMessage && (
          <div className={`mb-4 flex items-center gap-3 rounded-xl p-4 ${
            uploadMessage.type === "success" 
              ? "border border-emerald-400/40 bg-emerald-400/10" 
              : "border border-rose-400/40 bg-rose-400/10"
          }`}>
            <svg
              className={`w-5 h-5 flex-shrink-0 ${
                uploadMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={uploadMessage.type === "success" ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
              />
            </svg>
            <p className={uploadMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}>
              {uploadMessage.text}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {businessDocumentTypes.map((docType) => {
            const existingDoc = documents.find(
              (d) => d.documentType === docType.type
            );
            return (
              <BusinessDocumentCard
                key={docType.type}
                docType={docType.type}
                label={docType.label}
                description={docType.description}
                required={docType.required}
                existingDoc={existingDoc}
                onFileSelect={handleFileSelect}
                acceptedTypes={docType.acceptedTypes}
                maxSize={docType.maxSize}
                isUploading={isUploading === docType.type}
              />
            );
          })}
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-20">
        <BorderGlow className="glass-panel p-6">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Next Steps</h3>
              <p className="mt-2 text-white/64">
                {profile?.verificationStatus === "PENDING" ||
                !profile?.verificationDocuments?.length
                  ? "Upload all required documents and submit for review"
                  : profile?.verificationStatus === "SUBMITTED" ||
                    profile?.verificationStatus === "IN_REVIEW"
                  ? "Your documents are being reviewed. You'll be notified once verification is complete."
                  : profile?.verificationStatus === "REJECTED"
                  ? "Please review the rejection notes and resubmit your documents."
                  : "Your business has been verified and you have full access."}
              </p>
            </div>
            {(profile?.verificationStatus === "PENDING" ||
              profile?.verificationStatus === "REJECTED") && (
              <Link
                href="/verification/business/submit"
                className="star-button inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 flex-shrink-0"
              >
                {profile?.verificationStatus === "REJECTED"
                  ? "Resubmit Documents"
                  : "Submit for Verification"}
                <ArrowGlyph />
              </Link>
            )}
          </div>
        </BorderGlow>
      </section>

      <section className="parallax-section px-5 pb-10 pt-20">
        <BorderGlow className="glass-panel mx-auto max-w-7xl overflow-hidden p-7 sm:p-10 lg:p-14">
          <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/46 sm:flex-row sm:items-center sm:justify-between">
            <p>HorizonPay. Verified receivables funding on Stellar.</p>
            <div className="flex gap-5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/marketplace" className="hover:text-white">
                Offers
              </Link>
              <Link href="/onboarding" className="hover:text-white">
                Get Started
              </Link>
              <Link href="/dashboard/business" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </>
  );
}