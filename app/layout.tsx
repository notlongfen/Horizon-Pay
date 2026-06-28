import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "./components/wallet-provider";

export const metadata: Metadata = {
  title: "HorizonPay | Verified receivables funding on Stellar",
  description:
    "HorizonPay helps verified businesses create Funding Offers backed by real receivables so investors can fund cash flow with transparent terms.",
  keywords: [
    "HorizonPay",
    "PayFi",
    "Stellar",
    "Soroban",
    "receivables financing",
    "real-world assets",
    "invoice financing",
  ],
  openGraph: {
    title: "HorizonPay | Verified receivables funding on Stellar",
    description:
      "Verified businesses create debtor-acknowledged Funding Offers from invoices, services, subscriptions, products, and pay-later agreements.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HorizonPay | Verified receivables funding on Stellar",
    description:
      "A Stellar-native marketplace for verified receivable Offers, investor funding, debtor acknowledgement, and structured repayment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
