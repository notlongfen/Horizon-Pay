// Query key factory for type-safe keys
// This provides consistent query keys with auto-completion support
export const queryKeys = {
  // Marketplace
  marketplace: {
    all: () => ["marketplace"] as const,
    offers: () => ["marketplace", "offers"] as const,
    stats: () => ["marketplace", "stats"] as const,
    contracts: () => ["marketplace", "contracts"] as const,
    offer: (id: string) => ["marketplace", "offer", id] as const,
  },

  // Dashboard/Workspace
  workspace: {
    all: () => ["workspace"] as const,
    data: () => ["workspace", "data"] as const,
    roles: () => ["workspace", "roles"] as const,
    reviews: () => ["workspace", "reviews"] as const,
  },

  // Business Dashboard
  business: {
    all: () => ["business"] as const,
    profile: (wallet: string) => ["business", "profile", wallet] as const,
    offers: (wallet: string) => ["business", "offers", wallet] as const,
    dashboard: (wallet: string) => ["business", "dashboard", wallet] as const,
  },

  // Debtor Dashboard
  debtor: {
    all: () => ["debtor"] as const,
    profile: (wallet: string) => ["debtor", "profile", wallet] as const,
    offers: (wallet: string) => ["debtor", "offers", wallet] as const,
    dashboard: (wallet: string) => ["debtor", "dashboard", wallet] as const,
  },

  // Investor Dashboard
  investor: {
    all: () => ["investor"] as const,
    profile: (wallet: string) => ["investor", "profile", wallet] as const,
    portfolio: (wallet: string) => ["investor", "portfolio", wallet] as const,
    dashboard: (wallet: string) => ["investor", "dashboard", wallet] as const,
  },

  // Admin Dashboard
  admin: {
    all: () => ["admin"] as const,
    dashboard: () => ["admin", "dashboard"] as const,
    reviews: () => ["admin", "reviews"] as const,
  },

  // Offer Operations
  offers: {
    all: () => ["offers"] as const,
    byId: (id: string) => ["offers", id] as const,
    create: () => ["offers", "create"] as const,
    acknowledge: (id: string) => ["offers", "acknowledge", id] as const,
  },

  // Operations
  operations: {
    all: (wallet?: string) => ["operations", wallet] as const,
    byId: (id: string) => ["operations", id] as const,
    prepare: () => ["operations", "prepare"] as const,
    submit: () => ["operations", "submit"] as const,
  },

  // Verification
  verification: {
    investor: {
      all: () => ["verification", "investor"] as const,
      byId: (id: string) => ["verification", "investor", id] as const,
    },
    debtor: {
      all: () => ["verification", "debtor"] as const,
      byId: (id: string) => ["verification", "debtor", id] as const,
    },
    business: {
      all: () => ["verification", "business"] as const,
      byId: (id: string) => ["verification", "business", id] as const,
    },
  },

  // Contracts
  contracts: {
    all: () => ["contracts"] as const,
    readiness: (wallet: string) => ["contracts", "readiness", wallet] as const,
  },

  // User sessions
  user: {
    wallet: (address: string) => ["user", "wallet", address] as const,
    profile: (address: string) => ["user", "profile", address] as const,
  },
} as const;

// Helper to create array-based keys
export function createQueryKey<T extends unknown[]>(...args: T): T {
  return args;
}
