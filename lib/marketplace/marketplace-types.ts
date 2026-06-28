export type MarketplaceOffer = {
  id: string;
  business: string;
  debtor: string;
  category: string;
  summary: string;
  amount: string;
  fundingPrice: string;
  expectedRepayment: string;
  due: string;
  term: string;
  risk: "Low" | "Moderate" | "Elevated";
  repaymentAsset: string;
  status: string;
  verification: string;
  acknowledgement: string;
  industry: string;
  dueInDays: string;
  fundedShare: string;
  contractId?: string;
  onchainOfferId?: string;
  metadataHash?: string;
  lastIndexedAt?: string;
  notes: string[];
  proof: string[];
  timeline: { label: string; value: string }[];
};

export type MarketplaceStats = {
  listedOffers: string;
  receivablesValue: string;
  medianDueWindow: string;
  acknowledged: string;
};
