import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./components/wallet-provider";
import { QueryProvider } from "./components/providers/query-provider";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700", "800"],
});

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
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </QueryProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
