"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BusinessProfileSummary = {
  name: string;
  industry: string | null;
  walletAddress: string | null;
};

type FormData = {
  // Business info
  businessName: string;
  businessIndustry: string;
  businessWallet: string;

  // Offer details
  productOrServiceName: string;
  category: string;
  description: string;

  // Debtor info
  debtorName: string;
  debtorWallet: string;
  debtorEmail: string;

  // Financial terms
  principalAmount: string;
  fundingPrice: string;
  repaymentAsset: string;
  dueDate: string;

  // Metadata
  proofItems: string[];
  metadataHash: string;
};

type CreateOfferFormProps = {
  businessProfile: BusinessProfileSummary | null;
  defaultRepaymentAsset: string;
  categories: readonly string[];
  industries: readonly string[];
};

const initialFormData: FormData = {
  businessName: "",
  businessIndustry: "",
  businessWallet: "",
  productOrServiceName: "",
  category: "",
  description: "",
  debtorName: "",
  debtorWallet: "",
  debtorEmail: "",
  principalAmount: "",
  fundingPrice: "",
  repaymentAsset: "",
  dueDate: "",
  proofItems: [""],
  metadataHash: "",
};

// Generate a metadata hash from form data
function generateMetadataHash(data: Partial<FormData>): string {
  const relevant = {
    name: data.productOrServiceName,
    category: data.category,
    description: data.description,
    business: data.businessName,
    debtor: data.debtorName,
    debtorWallet: data.debtorWallet,
    principal: data.principalAmount,
    fundingPrice: data.fundingPrice,
    asset: data.repaymentAsset,
    due: data.dueDate,
    proof: data.proofItems?.join(","),
  };
  const str = JSON.stringify(relevant);
  // Simple hash for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hp_meta_${Math.abs(hash).toString(16).slice(0, 12)}`;
}

// Validate form data
function validateForm(data: FormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Business info
  if (!data.businessName.trim()) {
    errors.businessName = "Business name is required";
  }
  if (!data.businessIndustry) {
    errors.businessIndustry = "Industry is required";
  }
  if (!data.businessWallet.trim()) {
    errors.businessWallet = "Business wallet is required";
  } else if (!data.businessWallet.startsWith("G") || data.businessWallet.length !== 56) {
    errors.businessWallet = "Invalid Stellar wallet address";
  }

  // Offer details
  if (!data.productOrServiceName.trim()) {
    errors.productOrServiceName = "Product or service name is required";
  }
  if (!data.category) {
    errors.category = "Category is required";
  }
  if (!data.description.trim()) {
    errors.description = "Description is required";
  } else if (data.description.length > 500) {
    errors.description = "Description must be 500 characters or less";
  }

  // Debtor info
  if (!data.debtorName.trim()) {
    errors.debtorName = "Debtor name is required";
  }
  if (!data.debtorWallet.trim()) {
    errors.debtorWallet = "Debtor wallet is required";
  } else if (!data.debtorWallet.startsWith("G") || data.debtorWallet.length !== 56) {
    errors.debtorWallet = "Invalid Stellar wallet address";
  }

  // Financial terms
  if (!data.principalAmount.trim()) {
    errors.principalAmount = "Principal amount is required";
  } else {
    const principal = parseFloat(data.principalAmount);
    if (isNaN(principal) || principal <= 0) {
      errors.principalAmount = "Principal must be a positive number";
    }
  }

  if (!data.fundingPrice.trim()) {
    errors.fundingPrice = "Funding price is required";
  } else {
    const funding = parseFloat(data.fundingPrice);
    const principal = parseFloat(data.principalAmount) || 0;
    if (isNaN(funding) || funding <= 0) {
      errors.fundingPrice = "Funding price must be a positive number";
    } else if (funding > principal) {
      errors.fundingPrice = "Funding price cannot exceed principal amount";
    }
  }

  if (!data.repaymentAsset) {
    errors.repaymentAsset = "Repayment asset is required";
  }

  if (!data.dueDate) {
    errors.dueDate = "Due date is required";
  } else {
    const due = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due <= today) {
      errors.dueDate = "Due date must be in the future";
    }
  }

  // Proof items
  if (data.proofItems.some((item) => !item.trim())) {
    errors.proofItems = "All proof items must be filled or removed";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Format amount for display
function formatAmount(value: string): string {
  if (!value) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Calculate expected return percentage
function calculateReturn(principal: string, fundingPrice: string): string {
  const p = parseFloat(principal) || 0;
  const f = parseFloat(fundingPrice) || 0;
  if (p === 0) return "0%";
  const discount = p - f;
  const percentage = (discount / p) * 100;
  return `${percentage.toFixed(1)}%`;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate() + 1).padStart(2, "0"); // +1 day minimum
  return `${year}-${month}-${day}`;
}

// Get date 90 days from now
function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 90);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createInitialFormData(
  businessProfile: BusinessProfileSummary | null,
  defaultRepaymentAsset: string,
): FormData {
  return {
    ...initialFormData,
    businessName: businessProfile?.name ?? "",
    businessIndustry: businessProfile?.industry ?? "",
    businessWallet: businessProfile?.walletAddress ?? "",
    repaymentAsset: defaultRepaymentAsset,
    dueDate: getDefaultDueDate(),
  };
}

export function CreateOfferForm({
  businessProfile,
  defaultRepaymentAsset,
  categories,
  industries,
}: CreateOfferFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(() =>
    createInitialFormData(businessProfile, defaultRepaymentAsset),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);

  // Validate on change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Handle proof item change
  const handleProofItemChange = useCallback(
    (index: number, value: string) => {
      setFormData((prev) => {
        const newItems = [...prev.proofItems];
        newItems[index] = value;
        return { ...prev, proofItems: newItems };
      });
    },
    []
  );

  // Add proof item
  const addProofItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      proofItems: [...prev.proofItems, ""],
    }));
  }, []);

  // Remove proof item
  const removeProofItem = useCallback((index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.proofItems];
      newItems.splice(index, 1);
      return { ...prev, proofItems: newItems };
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFiles = e.target.files;
      if (!uploadedFiles || uploadedFiles.length === 0) return;

      // Convert to array and add to existing files
      const newFiles = Array.from(uploadedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
      
      // Clear the input so the same file can be selected again
      e.target.value = "";
    },
    []
  );

  // Remove file
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  // Generate hash whenever form changes
  const metadataHash = useMemo(() => {
    return generateMetadataHash(formData);
  }, [formData]);

  const validation = useMemo(
    () => validateForm({ ...formData, metadataHash }),
    [formData, metadataHash],
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      const result = validateForm(formData);
      if (!result.valid) {
        // Scroll to first error
        const firstErrorKey = Object.keys(result.errors)[0];
        if (firstErrorKey) {
          const element = document.querySelector<HTMLElement>(`[name="${firstErrorKey}"]`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
          element?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await fetch("/api/operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "business",
            action: "Create Offer",
            walletAddress: formData.businessWallet,
            fields: {
              businessName: formData.businessName,
              category: formData.category,
              debtorName: formData.debtorName,
              debtorWallet: formData.debtorWallet,
              principalAmount: formData.principalAmount,
              fundingPrice: formData.fundingPrice || formData.principalAmount,
              repaymentAsset: formData.repaymentAsset,
              dueDate: formData.dueDate,
              metadataHash,
              proofLabel: formData.proofItems.filter(Boolean).join(", "),
              summary: formData.description,
            },
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "Failed to create Offer operation");
        }

        // Success!
        setSubmitSuccess(true);
        setOfferId(payload.data?.args?.offer_id ?? payload.data?.id ?? "prepared");
        setOperationId(payload.data?.id);  // Store operation ID for signing flow
        
        // Scroll to success message
        setTimeout(() => {
          const successSection = document.getElementById("success-section");
          successSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to create Offer. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, metadataHash]
  );

  // Check if form has unsaved changes
  const hasChanges = useMemo(() => {
    return (
      formData.productOrServiceName !== "" ||
      formData.category !== "" ||
      formData.description !== "" ||
      formData.debtorName !== "" ||
      formData.debtorWallet !== "" ||
      formData.principalAmount !== "" ||
      files.length > 0
    );
  }, [formData, files]);

  // Calculate return percentage
  const returnPercentage = useMemo(() => {
    return calculateReturn(formData.principalAmount, formData.fundingPrice);
  }, [formData.principalAmount, formData.fundingPrice]);

  // Show success state
  if (submitSuccess && offerId) {
    return (
      <div className="offer-create-success" id="success-section">
        <div className="offer-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="offer-success-title">Offer Created Successfully!</h2>
        <p className="offer-success-text">
          Your Funding Offer has been created with ID <strong className="font-mono">{offerId}</strong>.
          It&apos;s currently in draft status pending debtor acknowledgement.
        </p>
        
        <div className="offer-success-details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt>Product/Service</dt>
              <dd>{formData.productOrServiceName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{formData.category}</dd>
            </div>
            <div>
              <dt>Principal Amount</dt>
              <dd>{formatAmount(formData.principalAmount)}</dd>
            </div>
            <div>
              <dt>Funding Price</dt>
              <dd>{formatAmount(formData.fundingPrice)}</dd>
            </div>
            <div>
              <dt>Debtor</dt>
              <dd>{formData.debtorName}</dd>
            </div>
            <div>
              <dt>Due Date</dt>
              <dd>{new Date(formData.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</dd>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <dt>Metadata Hash</dt>
            <dd className="font-mono text-xs">{metadataHash}</dd>
          </div>
        </div>

        <p className="offer-success-text mt-6">
          <strong>Next steps:</strong>
          <br />
          {operationId ? (
            <>
              Your Offer has been prepared for blockchain submission. 
              Use Complete Signing in Dashboard to connect your wallet and submit the transaction.
              <br /><br />
            </>
          ) : null}
          Send this Offer to your debtor for acknowledgement.
          Once acknowledged, you can list it in the marketplace for funding.
        </p>

        <div className="offer-success-actions">
          {operationId && (
            <button
              type="button"
              className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-6 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200"
              onClick={() => router.push(`/dashboard/business?offer=${offerId}&action=Create+Offer#operations`)}
            >
              Complete Signing in Dashboard
            </button>
          )}
          <button
            type="button"
            className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition"
            onClick={() => router.push("/dashboard/business")}
          >
            View in Dashboard
          </button>
          <button
            type="button"
            className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition"
            onClick={() => {
              // Reset and create another
              setFormData(createInitialFormData(businessProfile, defaultRepaymentAsset));
              setFiles([]);
              setSubmitSuccess(false);
              setOfferId(null);
              setOperationId(null);
            }}
          >
            Create Another Offer
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="offer-create-form">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="flex items-center gap-4">
          <div className="progress-step is-active">
            <span className="step-number">1</span>
            <span>Details</span>
          </div>
          <div className="progress-connector is-active" />
          <div className="progress-step">
            <span className="step-number">2</span>
            <span>Review</span>
          </div>
          <div className="progress-connector" />
          <div className="progress-step">
            <span className="step-number">3</span>
            <span>Submit</span>
          </div>
        </div>
      </div>

      {/* Business Section */}
      <div className="offer-form-section">
        <div className="offer-form-section-title">
          <h3>Business Information</h3>
          <span>Verify your business details</span>
        </div>
        <div className="offer-form-grid">
          <label className="offer-form-label">
            <span>Business Name</span>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Your business name"
              aria-describedby={validation.errors.businessName ? "businessName-error" : undefined}
            />
            {validation.errors.businessName && (
              <p id="businessName-error" className="offer-form-error">
                {validation.errors.businessName}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Industry</span>
            <select
              name="businessIndustry"
              value={formData.businessIndustry}
              onChange={handleChange}
              aria-describedby={validation.errors.businessIndustry ? "businessIndustry-error" : undefined}
            >
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            {validation.errors.businessIndustry && (
              <p id="businessIndustry-error" className="offer-form-error">
                {validation.errors.businessIndustry}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Business Wallet</span>
            <input
              type="text"
              name="businessWallet"
              value={formData.businessWallet}
              onChange={handleChange}
              placeholder="G... (Stellar wallet)"
              aria-describedby={validation.errors.businessWallet ? "businessWallet-error" : undefined}
            />
            {validation.errors.businessWallet && (
              <p id="businessWallet-error" className="offer-form-error">
                {validation.errors.businessWallet}
              </p>
            )}
          </label>
          <div />
        </div>
      </div>

      {/* Offer Details Section */}
      <div className="offer-form-section">
        <div className="offer-form-section-title">
          <h3>Offer Details</h3>
          <span>Describe the receivable</span>
        </div>
        <div className="offer-form-grid">
          <label className="offer-form-label is-full">
            <span>Product or Service Name</span>
            <input
              type="text"
              name="productOrServiceName"
              value={formData.productOrServiceName}
              onChange={handleChange}
              placeholder="What is the debtor paying for?"
              aria-describedby={validation.errors.productOrServiceName ? "productOrServiceName-error" : undefined}
            />
            {validation.errors.productOrServiceName && (
              <p id="productOrServiceName-error" className="offer-form-error">
                {validation.errors.productOrServiceName}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              aria-describedby={validation.errors.category ? "category-error" : undefined}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {validation.errors.category && (
              <p id="category-error" className="offer-form-error">
                {validation.errors.category}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Expected Return</span>
            <input
              type="text"
              value={returnPercentage}
              readOnly
              className="bg-transparent border-none p-0 text-lg font-semibold text-cyan-100 focus:ring-0"
            />
          </label>
          <label className="offer-form-label is-full">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the product, service, or invoice this Offer represents"
              maxLength={500}
              aria-describedby={validation.errors.description ? "description-error" : undefined}
            />
            <p className="offer-form-hint">
              {formData.description.length}/500 characters
            </p>
            {validation.errors.description && (
              <p id="description-error" className="offer-form-error">
                {validation.errors.description}
              </p>
            )}
          </label>
        </div>
      </div>

      {/* Debtor Section */}
      <div className="offer-form-section">
        <div className="offer-form-section-title">
          <h3>Debtor Information</h3>
          <span>The party who owes payment</span>
        </div>
        <div className="offer-form-grid">
          <label className="offer-form-label">
            <span>Debtor Name</span>
            <input
              type="text"
              name="debtorName"
              value={formData.debtorName}
              onChange={handleChange}
              placeholder="Individual or business name"
              aria-describedby={validation.errors.debtorName ? "debtorName-error" : undefined}
            />
            {validation.errors.debtorName && (
              <p id="debtorName-error" className="offer-form-error">
                {validation.errors.debtorName}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Debtor Email</span>
            <input
              type="email"
              name="debtorEmail"
              value={formData.debtorEmail}
              onChange={handleChange}
              placeholder="Optional: for notifications"
            />
          </label>
          <label className="offer-form-label is-full">
            <span>Debtor Wallet Address</span>
            <input
              type="text"
              name="debtorWallet"
              value={formData.debtorWallet}
              onChange={handleChange}
              placeholder="G... (Stellar wallet address)"
              aria-describedby={validation.errors.debtorWallet ? "debtorWallet-error" : undefined}
            />
            {validation.errors.debtorWallet && (
              <p id="debtorWallet-error" className="offer-form-error">
                {validation.errors.debtorWallet}
              </p>
            )}
          </label>
        </div>
      </div>

      {/* Financial Terms Section */}
      <div className="offer-form-section">
        <div className="offer-form-section-title">
          <h3>Financial Terms</h3>
          <span>Amount, pricing, and repayment</span>
        </div>
        <div className="offer-form-grid">
          <label className="offer-form-label">
            <span>Principal Amount ($)</span>
            <input
              type="text"
              name="principalAmount"
              value={formData.principalAmount}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="0"
              aria-describedby={validation.errors.principalAmount ? "principalAmount-error" : undefined}
            />
            {validation.errors.principalAmount && (
              <p id="principalAmount-error" className="offer-form-error">
                {validation.errors.principalAmount}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Funding Price ($)</span>
            <input
              type="text"
              name="fundingPrice"
              value={formData.fundingPrice}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="0"
              aria-describedby={validation.errors.fundingPrice ? "fundingPrice-error" : undefined}
            />
            {validation.errors.fundingPrice && (
              <p id="fundingPrice-error" className="offer-form-error">
                {validation.errors.fundingPrice}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Repayment Asset</span>
            <select
              name="repaymentAsset"
              value={formData.repaymentAsset}
              onChange={handleChange}
              aria-describedby={validation.errors.repaymentAsset ? "repaymentAsset-error" : undefined}
            >
              <option value="">Select asset</option>
              <option value={defaultRepaymentAsset}>
                USDC ({defaultRepaymentAsset.slice(0, 4)}...{defaultRepaymentAsset.slice(-4)})
              </option>
              <option value="native">XLM (Native Stellar Lumens)</option>
            </select>
            {validation.errors.repaymentAsset && (
              <p id="repaymentAsset-error" className="offer-form-error">
                {validation.errors.repaymentAsset}
              </p>
            )}
          </label>
          <label className="offer-form-label">
            <span>Due Date</span>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              min={getTodayDate()}
              max="2030-12-31"
              aria-describedby={validation.errors.dueDate ? "dueDate-error" : undefined}
            />
            {validation.errors.dueDate && (
              <p id="dueDate-error" className="offer-form-error">
                {validation.errors.dueDate}
              </p>
            )}
          </label>
        </div>
      </div>

      {/* Proof & Metadata Section */}
      <div className="offer-form-section">
        <div className="offer-form-section-title">
          <h3>Supporting Evidence</h3>
          <span>Upload documents and add proof items</span>
        </div>
        
        {/* File Upload */}
        <label className="offer-form-label is-full">
          <span>Upload Documents</span>
          <div className="file-upload-zone" onClick={() => document.getElementById("file-upload")?.click()}>
            <input
              id="file-upload"
              type="file"
              className="file-upload-input"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <div className="file-upload-label">
              <strong>Click to upload</strong> or drag and drop
              <br />
              <span>PDF, JPG, PNG, DOCX (Max 10MB each, 5 files max)</span>
            </div>
          </div>
          {files.length > 0 && (
            <div className="file-list">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.size}-${index}`} className="file-item">
                  <div className="file-item-info">
                    <span className="file-item-icon">DOC</span>
                    <span className="file-item-name">{file.name}</span>
                    <span className="file-item-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="file-item-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </label>

        {/* Proof Items */}
        <label className="offer-form-label is-full">
          <span>Proof Items</span>
          <p className="offer-form-hint">
            Add descriptions of supporting evidence, for example &quot;Signed invoice #12345&quot; or &quot;Service agreement&quot;.
          </p>
          <div className="proof-items-list">
            {formData.proofItems.map((item, index) => (
              <div key={index} className="proof-item-row">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleProofItemChange(index, e.target.value)}
                  placeholder={`Proof item ${index + 1}`}
                  className="flex-1"
                />
                {formData.proofItems.length > 1 && (
                  <button
                    type="button"
                    className="proof-item-remove"
                    onClick={() => removeProofItem(index)}
                    aria-label="Remove proof item"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-proof-button glass-button inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition mt-3"
            onClick={addProofItem}
          >
            + Add Proof Item
          </button>
          {validation.errors.proofItems && (
            <p className="offer-form-error">{validation.errors.proofItems}</p>
          )}
        </label>

        {/* Metadata Hash */}
        <label className="offer-form-label is-full">
          <span>Metadata Hash</span>
          <div className="metadata-hash-display">
            <code className="font-mono text-sm text-white/70">{metadataHash}</code>
          </div>
          <p className="offer-form-hint">
            Cryptographic hash of your Offer data. Generated automatically when you submit.
          </p>
        </label>
      </div>

      {/* Validation Summary */}
      {!validation.valid && hasChanges && (
        <div className="offer-form-validation">
          <p className="offer-form-validation-title">
            Please fix the following errors to continue:
          </p>
          <ul className="offer-form-validation-list">
            {Object.entries(validation.errors).map(([key, message]) => (
              <li key={key} className="offer-form-validation-item is-invalid">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <div className="offer-form-actions">
        {submitError && (
          <p className="offer-form-errorMessage">{submitError}</p>
        )}
        <button
          type="submit"
          className="star-button inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-200 px-8 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !validation.valid}
        >
          {isSubmitting ? "Creating Offer..." : "Create Offer Draft"}
        </button>
        <Link
          href="/dashboard/business"
          className="glass-button inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition"
        >
          Cancel
        </Link>
      </div>

      <p className="offer-form-hint mt-4 text-center">
        This creates a draft Offer. Your debtor must acknowledge it before it can be listed for funding.
      </p>
    </form>
  );
}
