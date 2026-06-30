// Feature flags for TanStack Query integration
export const featureFlags = {
  // Core TanStack Query
  tanstackQuery: process.env.NEXT_PUBLIC_TANSTACK_ENABLED !== "false",
  
  // Real-time updates
  sseUpdates: process.env.NEXT_PUBLIC_SSE_ENABLED === "true",
  
  // Infinite scroll
  infiniteScroll: process.env.NEXT_PUBLIC_INFINITE_SCROLL_ENABLED === "true",
  
  // Performance monitoring
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  
  // Cache optimizations
  serverCache: process.env.NEXT_PUBLIC_SERVER_CACHE_ENABLED !== "false",
  clientCache: process.env.NEXT_PUBLIC_CLIENT_CACHE_ENABLED !== "false",
  
  // Debug features
  debugDevtools: process.env.NODE_ENV === "development",
  debugLogging: process.env.NEXT_PUBLIC_DEBUG_LOGGING === "true",
} as const;

// Type-safe feature flag access
type FeatureFlagKey = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag];
}

export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flag: FeatureFlagKey,
  Fallback: React.ComponentType<P> | null = null
) {
  return function WrappedComponent(props: P) {
    if (isFeatureEnabled(flag)) {
      return <Component {...props} />;
    }
    return Fallback ? <Fallback {...props} /> : null;
  };
}

// Hook to check feature flags
export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  return isFeatureEnabled(flag);
}
