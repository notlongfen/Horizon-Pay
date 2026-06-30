"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useWallet } from "../components/wallet-provider";

type RoleKey = "business" | "investor" | "debtor";

type RoleOption = {
  key: RoleKey;
  label: string;
  headline: string;
  description: string;
  verification: string;
  primaryAction: string;
  secondaryAction: string;
  primaryHref: string;
  secondaryHref: string;
  actions: string[];
};

const roleOptions: RoleOption[] = [
  {
    key: "business",
    label: "Business",
    headline: "Create receivable Offers after KYB approval.",
    description:
      "For clinics, agencies, suppliers, merchants, subscription companies, and other businesses that need liquidity from future payments.",
    verification: "Business KYB and receivable backing review",
    primaryAction: "Start KYB Verification",
    secondaryAction: "Create Offer after approval",
    primaryHref: "/verification/business",
    secondaryHref: "/offers/create",
    actions: [
      "Connect the wallet that will receive funded liquidity.",
      "Create a business profile and submit verification details.",
      "Prepare product, service, invoice, or agreement metadata.",
    ],
  },
  {
    key: "investor",
    label: "Investor",
    headline: "Review acknowledged Offers before funding.",
    description:
      "For verified funders comparing Offer backing, due dates, repayment asset, risk context, and debtor acknowledgement.",
    verification: "Investor eligibility and disclosure acceptance",
    primaryAction: "Start KYC Verification",
    secondaryAction: "Browse Offers",
    primaryHref: "/verification/investor",
    secondaryHref: "/marketplace",
    actions: [
      "Connect the wallet that will fund listed Offers.",
      "Complete investor verification and access checks.",
      "Browse acknowledged Offers with funding terms.",
    ],
  },
  {
    key: "debtor",
    label: "Debtor",
    headline: "Acknowledge or dispute payment obligations.",
    description:
      "For customers or counterparties reviewing the amount, backing, due date, and repayment status of an Offer created by a verified business.",
    verification: "Wallet ownership or invited account verification",
    primaryAction: "Start Verification",
    secondaryAction: "Review Offer details",
    primaryHref: "/verification/debtor",
    secondaryHref: "/dashboard/debtor#operations",
    actions: [
      "Connect or confirm the invited debtor wallet.",
      "Review business, backing, amount, and due date.",
      "Acknowledge valid Offers or dispute incorrect details.",
    ],
  },
];

export function RoleOnboardingPanel() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("business");
  const { address: walletAddress } = useWallet();

  const activeRole = useMemo(
    () => roleOptions.find((role) => role.key === selectedRole) ?? roleOptions[0],
    [selectedRole],
  );

  const primaryHrefWithWallet = activeRole.primaryHref;

  return (
    <div className="onboarding-role-panel">
      <div className="onboarding-role-tabs" role="tablist" aria-label="HorizonPay role">
        {roleOptions.map((role) => (
          <button
            key={role.key}
            type="button"
            role="tab"
            aria-selected={role.key === selectedRole}
            className={role.key === selectedRole ? "is-selected" : undefined}
            onClick={() => setSelectedRole(role.key)}
          >
            {role.label}
          </button>
        ))}
      </div>

      <div className="onboarding-role-detail" role="tabpanel">
        <p className="onboarding-kicker">Selected path</p>
        <h3>{activeRole.headline}</h3>
        <p>{activeRole.description}</p>

        <div className="onboarding-verification-strip">
          <span>Verification</span>
          <strong>{activeRole.verification}</strong>
        </div>

        <ol className="onboarding-action-list">
          {activeRole.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ol>

        <div className="onboarding-role-actions">
          <Link href={primaryHrefWithWallet} className="star-button">
            {activeRole.primaryAction}
          </Link>
          <Link href={activeRole.secondaryHref} className="glass-button">
            {activeRole.secondaryAction}
          </Link>
        </div>
      </div>
    </div>
  );
}
