// Re-export all wallet-related functions to ensure proper module resolution
export {
  getWalletKit,
  signStellarTransaction,
  getSelectedWalletNetwork,
  connectWallet,
  getWalletAddress,
  disconnectWallet,
  formatStellarAddress,
} from './stellar-wallet-kit';
