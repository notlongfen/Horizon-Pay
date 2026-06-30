"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BorderGlow } from "@/app/components/border-glow";
import { Particles } from "@/app/components/particles";
import { ScrollParallax } from "@/app/components/scroll-parallax";
import { SiteNav } from "@/app/components/site-nav";
import { Card, SectionLabel, ArrowGlyph } from "@/app/components/ui";
import { useWallet } from "@/app/components/wallet-provider";
import { useDebtorVerificationStatus, useSubmitDebtorVerification } from "@/lib/hooks";
import { MetricCardsSkeleton } from "@/lib/utils/loading";



const documentTypes = [
  {
    type: "GOVERNMENT_ID",
    label: "Government ID",
    description: "Passport, driver's license, or national ID",
    required: true,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  {
    type: "BUSINESS_REGISTRATION",
    label: "Business Registration",
    description: "Proof of business registration (if applicable)",
    required: false,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
  {
    type: "PROOF_OF_ADDRESS",
    label: "Proof of Address",
    description: "Recent utility bill or bank statement",
    required: true,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
  {
    type: "TAX_ID",
    label: "Tax Identification",
    description: "Tax ID or business number",
    required: false,
    acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
    maxSize: 10 * 1024 * 1024,
  },
];

const debtorInfoFields = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full legal name",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "your@email.com",
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+1 (555) 123-4567",
    required: false,
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "Street address",
    required: true,
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "City",
    required: true,
  },
  {
    name: "state",
    label: "State / Province",
    type: "text",
    placeholder: "State or Province",
    required: false,
  },
  {
    name: "country",
    label: "Country",
    type: "text",
    placeholder: "Country",
    required: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    type: "text",
    placeholder: "Postal Code",
    required: false,
  },
  {
    name: "businessName",
    label: "Business Name",
    type: "text",
    placeholder: "If representing a business, enter business name",
    required: false,
  },
  {
    name: "businessType",
    label: "Business Type",
    type: "text",
    placeholder: "Type of business entity",
    required: false,
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function FileUploadZone({
  docType,
  label,
  description,
  required,
  onFileSelect,
  uploadedFile,
  error,
}: {
  docType: string;
  label: string;
  description: string;
  required: boolean;
  onFileSelect: (docType: string, file: File) => void;
  uploadedFile?: { name: string; size: number; type: string };
  error?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docConfig = documentTypes.find((d) => d.type === docType);
  
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && docConfig) {
        if (!docConfig.acceptedTypes.includes(file.type)) {
          setLocalError(
            `Invalid file type. Accepted: ${docConfig.acceptedTypes.join(", ")}`
          );
          return;
        }
        if (file.size > docConfig.maxSize) {
          setLocalError(
            `File too large. Maximum size: ${formatFileSize(docConfig.maxSize)}`
          );
          return;
        }
        setLocalError(undefined);
        onFileSelect(docType, file);
      }
    },
    [docConfig, onFileSelect, docType]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && docConfig) {
        if (!docConfig.acceptedTypes.includes(file.type)) {
          setLocalError(
            `Invalid file type. Accepted: ${docConfig.acceptedTypes.join(", ")}`
          );
          return;
        }
        if (file.size > docConfig.maxSize) {
          setLocalError(
            `File too large. Maximum size: ${formatFileSize(docConfig.maxSize)}`
          );
          return;
        }
        setLocalError(undefined);
        onFileSelect(docType, file);
      }
    },
    [docConfig, onFileSelect, docType]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <Card
      padding="sm"
      className={`border-dashed border-2 ${
        isDragging
          ? "border-cyan-400 bg-cyan-400/5"
          : uploadedFile
          ? "border-emerald-400/40"
          : "border-white/20"
      }`}
    >
      <div
        className="flex flex-col items-center gap-4 py-4"
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          id={`file-upload-${docType}`}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={docConfig?.acceptedTypes.join(",")}
        />
        
        <label
          htmlFor={`file-upload-${docType}`}
          className="cursor-pointer w-full text-center pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            triggerFileInput();
          }}
        >
          <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/[0.04] flex items-center justify-center mx-auto">
            {uploadedFile ? (
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white/64"
                fill="none"
                viewBox="0 0 24 24"
              >
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
          
          <h4 className="font-semibold text-white mt-2">{label}</h4>
          <p className="text-sm text-white/64">{description}</p>
          
          {uploadedFile && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-400/15 flex items-center justify-center text-emerald-400 text-xs font-bold">
                ✓
              </span>
              <span className="text-sm text-emerald-400">{uploadedFile.name}</span>
              <span className="text-xs text-white/52">
                ({formatFileSize(uploadedFile.size)})
              </span>
            </div>
          )}
          
          {localError && (
            <p className="mt-2 text-xs text-rose-400">{localError}</p>
          )}
        </label>

        {required && !uploadedFile && (
          <span className="mt-2 text-xs text-rose-400 font-medium">
            Required
          </span>
        )}
      </div>
    </Card>
  );
}

function InfoField({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/88">{label}</span>
        {required && (
          <span className="text-xs text-rose-400 font-medium">Required</span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.12] px-4 py-3 text-white placeholder:text-white/52 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-transparent cursor-text transition-colors ${
          error ? "border-rose-400 bg-rose-400/10" : ""
        }`}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

export default function DebtorVerificationSubmitPage() {
  const router = useRouter();
  const { address: walletAddress, isConnected } = useWallet();

  // Use TanStack Query hooks
  const { data: verificationData, isLoading: isProfileLoading } = useDebtorVerificationStatus(
    walletAddress || ""
  );
  const { mutate: submitVerification } = useSubmitDebtorVerification();

  const [files, setFiles] = useState<Record<string, File>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileSelect = useCallback((docType: string, file: File) => {
    setFiles((prev) => ({ ...prev, [docType]: file }));
  }, []);

  const handleInfoChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRemoveFile = useCallback((docType: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[docType];
      return newFiles;
    });
  }, []);

  // Redirect to onboarding if wallet not connected
  useEffect(() => {
    if (!isConnected && !walletAddress) {
      router.push("/onboarding");
    }
  }, [walletAddress, isConnected, router]);

  // Load existing profile data when verification data loads
  useEffect(() => {
    if (verificationData?.profile) {
      const profile = verificationData.profile;
      // Pre-populate form data
      const initialFormData: Record<string, string> = {};
      debtorInfoFields.forEach((field) => {
        if (profile[field.name as keyof typeof profile]) {
          initialFormData[field.name] = profile[field.name as keyof typeof profile] as string;
        }
      });
      setFormData(initialFormData);
    }
  }, [verificationData]);

  // Combine loading states
  const isLoading = isProfileLoading || !walletAddress;

  // Save draft handler
  const handleSaveDraft = async () => {
    if (!walletAddress) {
      setSaveMessage({ type: "error", text: "Wallet address is required" });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/verification/debtor/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, debtorInfo: formData }),
      });
      
      const result = await response.json();

      if (result.success) {
        setSaveMessage({ type: "success", text: "Draft saved successfully!" });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: "error", text: result.error || "Failed to save draft" });
      }
    } catch (error: any) {
      setSaveMessage({ type: "error", text: error.message || "Failed to save draft" });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form handler
  const handleReset = () => {
    setFiles({});
    setFormData({});
    setSubmitError(undefined);
    setSubmitSuccess(false);
    setSaveMessage(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      // Validate required documents
      const requiredDocs = documentTypes.filter((d) => d.required);
      for (const doc of requiredDocs) {
        if (!files[doc.type]) {
          throw new Error(`Required document ${doc.label} is missing`);
        }
      }

      // Validate required fields
      const requiredFields = debtorInfoFields.filter((f) => f.required);
      for (const field of requiredFields) {
        if (!formData[field.name]?.trim()) {
          throw new Error(`Required field ${field.label} is missing`);
        }
      }

      // Upload files individually to the API endpoint
      const uploadedDocuments = [];
      
      for (const [docType, file] of Object.entries(files)) {
        const formDataForUpload = new FormData();
        formDataForUpload.append("walletAddress", walletAddress);
        formDataForUpload.append("docType", docType);
        formDataForUpload.append("role", "debtor");
        formDataForUpload.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataForUpload,
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || `Failed to upload ${docType}`);
        }

        uploadedDocuments.push({
          docType,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          fileUrl: uploadResult.fileUrl,
          documentId: uploadResult.documentId,
        });
      }

      // Prepare data for submission (without File objects)
      const submissionData = {
        walletAddress,
        debtorInfo: formData,
        documents: uploadedDocuments.map(doc => ({
          docType: doc.docType,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          fileUrl: doc.fileUrl,
          documentId: doc.documentId,
        })),
      };

      // Submit using TanStack Query mutation
      await submitVerification(submissionData);
      
      setSubmitSuccess(true);
      // Redirect to verification page after a brief delay
      setTimeout(() => {
        router.push("/verification/debtor");
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred while submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredDocs = documentTypes.filter((d) => d.required);
    const hasAllRequiredDocs = requiredDocs.every((d) => files[d.type]);
    const requiredFields = debtorInfoFields.filter((f) => f.required);
    const hasAllRequiredFields = requiredFields.every((f) => 
      formData[f.name]?.trim()
    );
    return hasAllRequiredDocs && hasAllRequiredFields && !isSubmitting;
  };

  if (submitSuccess) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#020504] text-white">
        <div className="galaxy-field" aria-hidden="true" />
        <div className="aurora-field" aria-hidden="true" />
        <div
          className="stellar-grid"
          data-parallax
          data-parallax-speed="0.035"
          aria-hidden="true"
        />
        <ScrollParallax />
        <Particles
          className="fixed inset-0 z-[1]"
          particleColors={["#ffffff", "#5cf6ff", "#d8ff8f"]}
          particleCount={220}
          particleSpread={10}
          speed={0.16}
          particleBaseSize={1.05}
          moveParticlesOnHover={false}
          alphaParticles
        />

        <SiteNav activeRoute="onboarding" />

        <section className="parallax-section mx-auto max-w-4xl px-5 pb-20 pt-32">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-semibold text-white">
              Documents Submitted Successfully
            </h1>
            <p className="mt-4 text-lg text-white/64">
              Your debtor verification documents have been submitted for review.
              You will be notified once the verification is complete.
            </p>
            <div className="mt-8">
              <Link
                href="/verification/debtor"
                className="star-button inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
              >
                View Verification Status <ArrowGlyph />
              </Link>
            </div>
          </div>
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
                <Link href="/dashboard/debtor" className="hover:text-white">
                  Dashboard
                </Link>
              </div>
            </footer>
          </BorderGlow>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020504] text-white">
      <div className="galaxy-field" aria-hidden="true" />
      <div className="aurora-field" aria-hidden="true" />
      <div
        className="stellar-grid"
        data-parallax
        data-parallax-speed="0.035"
        aria-hidden="true"
      />
      <ScrollParallax />
      <Particles
        className="fixed inset-0 z-[1]"
        particleColors={["#ffffff", "#5cf6ff", "#d8ff8f"]}
        particleCount={220}
        particleSpread={10}
        speed={0.16}
        particleBaseSize={1.05}
        moveParticlesOnHover={false}
        alphaParticles
      />

      <SiteNav activeRoute="onboarding" />

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-20 pt-32">
        <div className="max-w-4xl mx-auto">
          <SectionLabel>Debtor Verification Submission</SectionLabel>
          <h1 className="text-balance text-4xl font-semibold leading-[0.96] tracking-tight sm:text-5xl">
            Upload your debtor documents
          </h1>
          <p className="mt-4 text-lg text-white/64">
            Provide the required information and documents to complete your
            debtor verification.
          </p>
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-16">
        <BorderGlow className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Debtor Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {debtorInfoFields.map((field) => (
              <InfoField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleInfoChange}
                required={field.required}
              />
            ))}
          </div>
        </BorderGlow>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-16">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div>
            <SectionLabel>Verification Documents</SectionLabel>
            <h2 className="text-2xl font-semibold text-white">
              Upload Required Documents
            </h2>
            <p className="mt-2 text-white/64">
              Drag and drop or click to upload each document.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {documentTypes.map((docType) => (
            <FileUploadZone
              key={docType.type}
              docType={docType.type}
              label={docType.label}
              description={docType.description}
              required={docType.required}
              onFileSelect={handleFileSelect}
              uploadedFile={
                files[docType.type] ? {
                  name: files[docType.type].name,
                  size: files[docType.type].size,
                  "type": files[docType.type].type,
                } : undefined
              }
            />
          ))}
        </div>
      </section>

      <section className="parallax-section mx-auto max-w-7xl px-5 pb-20">
        <BorderGlow className="glass-panel p-6">
          {submitError && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4">
              <svg
                className="w-5 h-5 text-rose-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-rose-400">{submitError}</p>
            </div>
          )}
          
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

          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Submit</h3>
              <p className="mt-2 text-white/64">
                {isLoading ? "Loading your saved data..." : 
                 "Review all information and upload all required documents before submitting."}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                disabled={isSubmitting || isSaving}
                className="glass-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white/70 transition hover:text-white disabled:opacity-50"
              >
                Reset
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSaving}
                className="inline-flex min-h-11 items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-5 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <Link
                href="/verification/debtor"
                className="glass-button inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white transition"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="star-button inline-flex min-h-12 items-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-950"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for Verification <ArrowGlyph />
                  </>
                )}
              </button>
            </div>
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
              <Link href="/dashboard/debtor" className="hover:text-white">
                Dashboard
              </Link>
            </div>
          </footer>
        </BorderGlow>
      </section>
    </main>
  );
}