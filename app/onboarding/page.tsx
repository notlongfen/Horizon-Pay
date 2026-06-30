import { redirect } from "next/navigation";

// Onboarding functionality moved to dashboard
// Wallet connection is available via SiteNav's WalletConnectButton
// Role selection is available via Dashboard's RoleSwitcher
// Verification buttons moved to respective dashboard pages
export default function OnboardingPage() {
  redirect("/dashboard");
}
