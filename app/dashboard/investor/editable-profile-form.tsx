"use client";

import { useState, useEffect } from "react";
import { Card, StatusBadge } from "@/app/components/ui";
import { getVerificationLabel, getVerificationStatusColor, isVerificationApproved } from "@/lib/utils";
import { useWallet } from "@/app/components/wallet-provider";

export default function EditableInvestorProfileForm({ initialProfile }: { initialProfile: any }) {
  const { address: walletAddress } = useWallet();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialProfile && !!walletAddress);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch profile client-side if not provided by server
  useEffect(() => {
    if (!initialProfile && walletAddress && !profile) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/verification/investor/profile?walletAddress=${walletAddress}`);
          const data = await response.json();
          if (data.success) {
            setProfile(data.profile);
          }
        } catch (error) {
          console.error("Failed to fetch investor profile:", error);
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
      const response = await fetch(`/api/verification/investor/save-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: profile.walletAddress,
          investorInfo: {
            name: profile.name,
            investorType: profile.investorType,
            institutionName: profile.institutionName,
            description: profile.description,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postalCode: profile.postalCode,
            email: profile.email,
            phone: profile.phone,
            accreditationStatus: profile.accreditationStatus,
            accreditationDocument: profile.accreditationDocument,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile || profile);
        setIsEditing(false);
        setSaveStatus({ success: true, message: "Profile saved successfully!" });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to save profile" });
      }
    } catch (error: any) {
      setSaveStatus({ success: false, message: error.message || "Network error" });
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
      const response = await fetch(`/api/verification/investor/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: profile.walletAddress,
          investorInfo: {
            name: profile.name,
            investorType: profile.investorType,
            institutionName: profile.institutionName,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            postalCode: profile.postalCode,
            email: profile.email,
            phone: profile.phone,
            accreditationStatus: profile.accreditationStatus,
            accreditationDocument: profile.accreditationDocument,
          },
          documents: [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile || profile);
        setIsEditing(false);
        setSaveStatus({ success: true, message: "Verification submitted! Pending review." });
        setTimeout(() => setSaveStatus(null), 5000);
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to submit verification" });
      }
    } catch (error: any) {
      setSaveStatus({ success: false, message: error.message || "Network error" });
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
    // No profile exists yet - show call to action for new user to start KYC
    const emptyProfile = {
      walletAddress: walletAddress || "",
      name: "",
      investorType: "INDIVIDUAL",
      accreditationStatus: "",
      institutionName: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
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
              <h4 className="font-semibold text-rose-400">Action Required: Start KYC Verification</h4>
              <p className="mt-1 text-sm text-rose-400/80">
                Create your investor profile and verify your identity to unlock full platform access.
              </p>
              <button
                onClick={() => {
                  setProfile(emptyProfile);
                  setIsEditing(true);
                }}
                className="star-button mt-3 inline-flex min-h-10 items-center rounded-full bg-rose-200 px-5 text-sm font-semibold text-rose-950 transition hover:bg-rose-300"
              >
                Start KYC Verification
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const isVerified = isVerificationApproved(profile.verificationStatus);
  const isInstitution = profile.investorType === "INSTITUTION" || profile.investorType === "FUND";

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
                placeholder="Investor Name"
              />
              <div className="mt-3 flex gap-2">
                <select
                  value={profile.investorType || "INDIVIDUAL"}
                  onChange={(e) => handleInputChange("investorType", e.target.value)}
                  className="bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="INSTITUTION">Institution</option>
                  <option value="FUND">Fund</option>
                </select>
                {profile.investorType === "INSTITUTION" && (
                  <input
                    type="text"
                    value={profile.institutionName || ""}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Institution Name"
                  />
                )}
              </div>
              <textarea
                value={profile.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-3 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                placeholder="Investor Description"
                rows={3}
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-white">{profile.name || "Investor Profile"}</h3>
              <p className="mt-1 text-sm text-white/76">
                {isInstitution ? profile.institutionName || "Institutional Investor" : "Individual Investor"}
              </p>
              {profile.description && (
                <p className="mt-3 leading-6 text-white/64">{profile.description}</p>
              )}
            </>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className={`rounded-full border-2 px-5 py-2 text-center ${
            isVerified 
              ? "border-emerald-400/30 bg-emerald-400/10" 
              : "border-rose-400/30 bg-rose-400/10"
          }`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Verification
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className={`text-sm font-semibold ${
                isVerified 
                  ? "text-emerald-400" 
                  : "text-rose-400"
              }`}>
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
              onChange={(e) => handleInputChange("walletAddress", e.target.value)}
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
            Investor Type
          </p>
          {isEditing ? (
            <select
              value={profile.investorType || "INDIVIDUAL"}
              onChange={(e) => handleInputChange("investorType", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            >
              <option value="INDIVIDUAL">Individual</option>
              <option value="INSTITUTION">Institution</option>
              <option value="FUND">Fund</option>
            </select>
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.investorType || "Individual"}
            </p>
          )}
        </div>

        {profile.investorType === "INSTITUTION" && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
              Institution Name
            </p>
            {isEditing ? (
              <input
                type="text"
                value={profile.institutionName || ""}
                onChange={(e) => handleInputChange("institutionName", e.target.value)}
                className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Institution Name"
              />
            ) : (
              <p className="mt-2 text-sm text-white/76">
                {profile.institutionName || "N/A"}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Email
          </p>
          {isEditing ? (
            <input
              type="email"
              value={profile.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Email Address"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76 truncate">
              {profile.email || "N/A"}
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
              value={profile.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Phone Number"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.phone || "N/A"}
            </p>
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Accreditation Status
          </p>
          {isEditing ? (
            <input
              type="text"
              value={profile.accreditationStatus || ""}
              onChange={(e) => handleInputChange("accreditationStatus", e.target.value)}
              className="mt-2 w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              placeholder="Accreditation Status"
            />
          ) : (
            <p className="mt-2 text-sm text-white/76">
              {profile.accreditationStatus || "N/A"}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Address
          </p>
          {isEditing ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={profile.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
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
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
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
              {profile.address} {profile.city && profile.state && profile.country ? 
                `, ${profile.city}, ${profile.state}, ${profile.country}` : 
                (profile.city ? `, ${profile.city}` : '') + 
                (profile.state ? `, ${profile.state}` : '') + 
                (profile.country ? `, ${profile.country}` : '')}
              {profile.postalCode && `, ${profile.postalCode}`}
              {(!profile.address && !profile.city && !profile.state && !profile.country && !profile.postalCode) && "N/A"}
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
            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { 
              year: "numeric", month: "short", day: "numeric" 
            }) : "N/A"}
          </p>
        </div>
        
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/60">
            Verification Status
          </p>
          <StatusBadge status={getVerificationStatusColor(profile.verificationStatus)} />
          <span className="ml-2 text-sm text-white/76">
            {getVerificationLabel(profile.verificationStatus)}
          </span>
        </div>
      </div>
      
      {saveStatus && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className={`text-sm ${saveStatus.success ? "text-emerald-400" : "text-rose-400"}`}>
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
                Start KYC Verification
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
                {isSaving ? "Submitting..." : "Submit for KYC Verification"}
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
