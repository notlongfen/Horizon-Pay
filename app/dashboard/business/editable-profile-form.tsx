"use client";

import { useState, useEffect } from "react";
import { Card, StatusBadge } from "@/app/components/ui";
import {
  getVerificationLabel,
  getVerificationStatusColor,
  isVerificationApproved,
} from "@/lib/utils";
import { useWallet } from "@/app/components/wallet-provider";

export default function EditableBusinessProfileForm({
  initialProfile,
}: {
  initialProfile: any;
}) {
  const { address: walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialProfile && !!walletAddress);
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch profile client-side if not provided by server
  useEffect(() => {
    if (!initialProfile && walletAddress && !profile) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/verification/business/profile?walletAddress=${walletAddress}`);
          const data = await response.json();
          if (data.success) {
            setProfile(data.profile);
          }
        } catch (error) {
          console.error("Failed to fetch business profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [initialProfile, walletAddress, profile]);

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile?.walletAddress) {
      setSaveStatus({ success: false, message: "Wallet address is required" });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch(`/api/verification/business/save-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: profile.walletAddress,
          businessInfo: {
            name: profile.name,
            industry: profile.industry,
            description: profile.description,
            registrationNumber: profile.registrationNumber,
            taxId: profile.taxId,
            businessAddress: profile.businessAddress,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postalCode: profile.postalCode,
            website: profile.website,
            contactEmail: profile.contactEmail,
            contactPhone: profile.contactPhone,
            legalRepresentative: profile.legalRepresentative,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Profile saved successfully:", data.profile);
        setProfile(data.profile || profile);
        setIsEditing(false);
        setSaveStatus({
          success: true,
          message: "Profile saved successfully!",
        });

        // Refresh the profile data
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({
          success: false,
          message: data.error || "Failed to save profile",
        });
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSaveStatus({
        success: false,
        message: error.message || "Network error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
    setSaveStatus(null);
  };

  const handleSubmitVerification = async () => {
    if (!profile?.walletAddress) {
      setSaveStatus({ success: false, message: "Wallet address is required" });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch(`/api/verification/business/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: profile.walletAddress,
          businessInfo: {
            name: profile.name,
            industry: profile.industry,
            registrationNumber: profile.registrationNumber,
            taxId: profile.taxId,
            businessAddress: profile.businessAddress,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postalCode: profile.postalCode,
            website: profile.website,
            contactEmail: profile.contactEmail,
            contactPhone: profile.contactPhone,
            legalRepresentative: profile.legalRepresentative,
          },
          documents: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile || profile);
        setIsEditing(false);
        setSaveStatus({
          success: true,
          message: "Verification submitted! Pending review.",
        });
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({
          success: false,
          message: data.error || "Failed to submit verification",
        });
      }
    } catch (error: any) {
      setSaveStatus({
        success: false,
        message: error.message || "Network error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-center p-8">
          <p className="text-white/76">Loading profile...</p>
        </div>
      </Card>
    );
  }

  if (!profile) {
    // No profile exists yet - show empty form for new user to start KYB
    const emptyProfile = {
      walletAddress: walletAddress || "",
      name: "",
      industry: "",
      description: "",
      registrationNumber: "",
      taxId: "",
      businessAddress: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      website: "",
      contactEmail: "",
      contactPhone: "",
      legalRepresentative: "",
      verificationStatus: "PENDING",
    };
    return (
      <Card padding="md">
        <div className="p-4 rounded-xl border border-rose-400/30 bg-rose-400/5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full border border-rose-400/40 bg-rose-400/10 flex items-center justify-center">
                <span className="text-rose-400 text-lg">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-rose-400">
                Action Required: Start KYB Verification
              </h4>
              <p className="mt-1 text-sm text-rose-400/80">
                Create your business profile and verify your business to unlock
                Offer creation and full platform access.
              </p>
              <button
                onClick={() => {
                  setProfile(emptyProfile);
                  setIsEditing(true);
                }}
                className="star-button mt-3 inline-flex min-h-10 items-center rounded-full bg-rose-200 px-5 text-sm font-semibold text-rose-950 transition hover:bg-rose-300"
              >
                Start KYB Verification
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const isVerified = isVerificationApproved(profile.verificationStatus);

  return (
    <Card padding="md">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Business Name"
              />
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={profile.industry || ""}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Industry"
                />
              </div>
              <textarea
                value={profile.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="mt-3 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                placeholder="Business Description"
                rows={3}
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-white">
                {profile.name || "Business Profile"}
              </h3>
              <p className="mt-1 text-sm text-white/76">
                {profile.industry || "Not specified"}
              </p>
              {profile.description && (
                <p className="mt-3 leading-6 text-white/64">
                  {profile.description}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex-shrink-0">
          <div
            className={`rounded-full border-2 px-5 py-2 text-center ${
              isVerified
                ? "border-emerald-400/30 bg-emerald-400/10"
                : "border-rose-400/30 bg-rose-400/10"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Verification
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isVerified ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {getVerificationLabel(profile.verificationStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Wallet Address
          </p>
          {isEditing ? (
            <input
              type="text"
              value={profile.walletAddress || ""}
              onChange={(e) =>
                handleInputChange("walletAddress", e.target.value)
              }
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 font-mono"
              placeholder="Wallet Address"
            />
          ) : (
            <p className="mt-2 font-mono text-sm text-white/76 truncate">
              {profile.walletAddress || "Not connected"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registration Number
          </p>
          {isEditing ? (
            <input
              type="text"
              value={profile.registrationNumber || ""}
              onChange={(e) =>
                handleInputChange("registrationNumber", e.target.value)
              }
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Registration Number"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.registrationNumber || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Tax ID
          </p>
          {isEditing ? (
            <input
              type="text"
              value={profile.taxId || ""}
              onChange={(e) => handleInputChange("taxId", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 font-mono"
              placeholder="Tax ID"
            />
          ) : (
            <p className="mt-2 font-mono text-sm text-white/76">
              {profile.taxId || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Email
          </p>
          {isEditing ? (
            <input
              type="email"
              value={profile.contactEmail || ""}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Contact Email"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76 truncate">
              {profile.contactEmail || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Phone
          </p>
          {isEditing ? (
            <input
              type="tel"
              value={profile.contactPhone || ""}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Contact Phone"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.contactPhone || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Website
          </p>
          {isEditing ? (
            <input
              type="url"
              value={profile.website || ""}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Website URL"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76 truncate">
              {profile.website || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Legal Representative
          </p>
          {isEditing ? (
            <input
              type="text"
              value={profile.legalRepresentative || ""}
              onChange={(e) =>
                handleInputChange("legalRepresentative", e.target.value)
              }
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Legal Representative"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.legalRepresentative || "N/A"}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Business Address
          </p>
          {isEditing ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={profile.businessAddress || ""}
                onChange={(e) =>
                  handleInputChange("businessAddress", e.target.value)
                }
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="City"
              />
              <input
                type="text"
                value={profile.state || ""}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="State/Province"
              />
              <input
                type="text"
                value={profile.postalCode || ""}
                onChange={(e) =>
                  handleInputChange("postalCode", e.target.value)
                }
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Postal Code"
              />
              <input
                type="text"
                value={profile.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="sm:col-span-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Country"
              />
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.businessAddress}{" "}
              {profile.city && profile.state && profile.country
                ? `, ${profile.city}, ${profile.state}, ${profile.country}`
                : (profile.city ? `, ${profile.city}` : "") +
                  (profile.state ? `, ${profile.state}` : "") +
                  (profile.country ? `, ${profile.country}` : "")}
              {profile.postalCode && `, ${profile.postalCode}`}
              {!profile.businessAddress &&
                !profile.city &&
                !profile.state &&
                !profile.country &&
                !profile.postalCode &&
                "N/A"}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Registered Since
          </p>
          <p className="mt-2 text-sm text-white/76">
            {profile.createdAt
              ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Verification Status
          </p>
          <StatusBadge
            status={getVerificationStatusColor(profile.verificationStatus)}
          />
          <span className="ml-2 text-sm text-white/76">
            {getVerificationLabel(profile.verificationStatus)}
          </span>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p
            className={`text-sm ${saveStatus.success ? "text-emerald-400" : "text-rose-400"}`}
          >
            {saveStatus.message}
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-3">
        {!isEditing ? (
          <>
            {!isVerified ? (
              <button
                onClick={() => setIsEditing(true)}
                className="star-button inline-flex min-h-9 items-center rounded-full bg-rose-200 px-4 text-sm font-semibold text-rose-950 transition hover:bg-rose-300"
              >
                Start KYB Verification
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="glass-button inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium text-white/70 transition hover:text-white"
              >
                Edit Profile
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex min-h-9 items-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/64 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            {isVerified ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="star-button inline-flex min-h-9 items-center rounded-full bg-cyan-200 px-4 text-sm font-semibold text-cyan-950 transition hover:bg-lime-200 disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                onClick={handleSubmitVerification}
                disabled={isSaving}
                className="star-button inline-flex min-h-9 items-center rounded-full bg-rose-200 px-4 text-sm font-semibold text-rose-950 transition hover:bg-rose-300 disabled:opacity-70"
              >
                {isSaving ? "Submitting..." : "Submit for KYB Verification"}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
