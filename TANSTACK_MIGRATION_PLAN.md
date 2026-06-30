# TanStack Query Migration - Complete Plan

## Overview
Complete all phases of TanStack Query integration for HorizonPay, achieving 100% page migration with SSR prefetching and API optimizations.

## Current Status
- **Phase 1 (Foundation)**: ✅ 100% Complete
- **Phase 2 (Page Migrations)**: 🟡 61% Complete (11/18 pages)
- **TypeScript**: ✅ 0 errors

## Key Decisions Made
- TanStack Query v5 with 60s staleTime
- Type-safe query key factory (`queryKeys`)
- Singleton API client pattern
- Automatic cache invalidation on mutations
- Skeleton loading states
- EmptyState error handling with retry

## Architecture Components

### Query Infrastructure (Phase 1 - Complete)
```
lib/query/
├── keys.ts          # Type-safe query key factory
├── prefetch.ts      # SSR prefetching functions
└── client.ts        # QueryClient configuration

app/components/providers/
├── query-provider.tsx     # QueryClientProvider wrapper
└── hydration-provider.tsx # HydrationBoundary for SSR
```

### Data Layer
```
lib/api/
├── client.ts        # Singleton API client
└── handlers/       # API route handlers

lib/server/
├── cached-handlers.ts  # Server-side caching
└── api-response.ts     # Response utilities

lib/hooks/
├── use-business.ts      # Business dashboard/query hooks
├── use-debtor.ts       # Debtor dashboard/query hooks  
├── use-investor.ts      # Investor dashboard/query hooks
├── use-workspace.ts     # Workspace data hooks
└── use-mutations.ts      # Mutation hooks
```

---

## Phase 2: Page Migrations - Detailed Plan

### Part A: Add SSR Prefetching to Migrated Pages (Priority: HIGH)

#### 7 Pages Need Prefetching:

1. **app/dashboard/business/page.tsx**
   - Current: Uses `useBusinessDashboard()` client-side
   - Need: Add server component wrapper with `prefetchBusinessDashboard()`
   - Status: ⏳ Pending

2. **app/dashboard/debtor/page.tsx**
   - Current: Uses `useDebtorDashboard()` client-side
   - Need: Add server component wrapper with `prefetchDebtorDashboard()`
   - Status: ⏳ Pending

3. **app/dashboard/investor/page.tsx**
   - Current: Uses `useInvestorDashboard()` client-side
   - Need: Add server component wrapper with `prefetchInvestorDashboard()`
   - Status: ⏳ Pending

4. **app/dashboard/admin/page.tsx**
   - Current: Uses `useAdminDashboard()` + `useWorkspaceData()` client-side
   - Need: Add `prefetchAdminDashboard()` and `prefetchWorkspaceData()` functions
   - Status: ⏳ Pending

5. **app/verification/business/page.tsx**
   - Current: Uses `useBusinessVerificationStatus()` client-side
   - Need: Add `prefetchBusinessVerificationStatus()` function
   - Status: ⏳ Pending

6. **app/verification/debtor/page.tsx**
   - Current: Uses `useDebtorVerificationStatus()` client-side
   - Need: Add `prefetchDebtorVerificationStatus()` function
   - Status: ⏳ Pending

7. **app/verification/investor/page.tsx**
   - Current: Uses `useInvestorVerificationStatus()` client-side
   - Need: Add `prefetchInvestorVerificationStatus()` function
   - Status: ⏳ Pending

#### Implementation Pattern for Each Page:

```tsx
// 1. Create server component wrapper (e.g., app/dashboard/business/server-page.tsx)
import { prefetchBusinessDashboard } from "@/lib/query/prefetch";
import { HydrationProvider } from "@/app/components/providers/hydration-provider";
import BusinessDashboardPage from "./page";

export default async function ServerBusinessDashboardPage(props: any) {
  const wallet = ""; // Get from auth/context
  const dehydratedState = await prefetchBusinessDashboard(wallet);
  
  return (
    <HydrationProvider dehydratedState={dehydratedState}>
      <BusinessDashboardPage {...props} />
    </HydrationProvider>
  );
}

// 2. Update page.tsx to accept wallet from server
// 3. Or convert page.tsx to server component with client children
```

### Part B: Add Missing Prefetch Functions (Priority: HIGH)

#### New Prefetch Functions Needed in `lib/query/prefetch.ts`:

```typescript
// Admin Dashboard
export async function prefetchAdminDashboard() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => apiClient.getAdminDashboard(),
  });
  return dehydrate(queryClient);
}

// Workspace Data
export async function prefetchWorkspaceData() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.workspace.data(),
    queryFn: getWorkspaceData,
  });
  return dehydrate(queryClient);
}

// Verification Status
export async function prefetchBusinessVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.business.byId(wallet),
    queryFn: () => apiClient.getBusinessVerificationStatus(wallet),
  });
  return dehydrate(queryClient);
}

export async function prefetchDebtorVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.debtor.byId(wallet),
    queryFn: () => apiClient.getDebtorVerificationStatus(wallet),
  });
  return dehydrate(queryClient);
}

export async function prefetchInvestorVerificationStatus(wallet: string) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.investor.byId(wallet),
    queryFn: () => apiClient.getInvestorVerificationStatus(wallet),
  });
  return dehydrate(queryClient);
}
```

### Part C: Update API Routes with Cached Handlers (Priority: MEDIUM)

#### API Routes to Update:

1. **app/api/business/route.ts**
   - Use `cachedBusinessDashboardHandler`
2. **app/api/debtor/route.ts**
   - Use `cachedDebtorDashboardHandler`
3. **app/api/investor/route.ts**
   - Use `cachedInvestorDashboardHandler`
4. **app/api/admin/route.ts**
   - Use `cachedAdminHandler` (need to create)
5. **app/api/marketplace/route.ts**
   - Use `cachedMarketplaceHandler`

#### Update Pattern:
```typescript
// app/api/business/[wallet]/route.ts
import { cachedBusinessDashboardHandler } from "@/lib/server/cached-handlers";

export async function GET(request: Request, context: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await context.params;
  return cachedBusinessDashboardHandler(wallet);
}
```

### Part D: Migrate Remaining Server-Component Pages (Priority: MEDIUM)

#### 4 Pages to Migrate:

1. **app/marketplace/page.tsx**
   - Current: Server component with direct DB access
   - Need: Convert to use `useMarketplaceData()` hook with prefetching

2. **app/offers/create/page.tsx**
   - Current: Server component with direct DB access
   - Need: Convert to use `useCreateOffer()` mutation

3. **app/offers/[id]/acknowledge/page.tsx**
   - Current: Server component with direct DB access
   - Need: Convert to use `useAcknowledgeOffer()` mutation

4. **app/offers/[id]/dispute/page.tsx**
   - Current: Server component with direct DB access
   - Need: Convert to use `useDisputeOffer()` mutation

#### Migration Pattern:
```tsx
// 1. Add hook in lib/hooks/use-marketplace.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { apiClient } from "@/lib/api/client";

export function useMarketplaceData() {
  return useQuery({
    queryKey: queryKeys.marketplace.all(),
    queryFn: () => apiClient.getMarketplaceData(),
    staleTime: 30 * 1000,
  });
}

// 2. Update page to use hook
// 3. Add prefetch function
// 4. Wrap with HydrationProvider
```

---

## Phase 3: API Optimizations (Priority: MEDIUM)

### 1. Complete Cached Handlers
Add to `lib/server/cached-handlers.ts`:

```typescript
// Admin Dashboard
let adminCache: { data: any; timestamp: number } | null = null;

export async function cachedAdminDashboardHandler() {
  const now = Date.now();
  if (adminCache && now - adminCache.timestamp < CACHE_TTL.ADMIN * 1000) {
    return ApiResponse.success(adminCache.data);
  }
  
  try {
    const { getPrismaClient } = await import("@/lib/db/prisma");
    const prisma = getPrismaClient();
    const [businesses, debtors, investors, offers, adminReviews] = await Promise.all([
      prisma.businessProfile.findMany({ include: { verificationDocuments: true } }),
      prisma.debtorProfile.findMany({ include: { verificationDocuments: true } }),
      prisma.investorProfile.findMany({ include: { verificationDocuments: true, positions: true } }),
      prisma.offer.findMany({
        include: { business: true, debtor: true, fundingPositions: true, repayments: true },
        orderBy: [{ status: "desc" }, { dueDate: "asc" }],
      }),
      prisma.adminReview.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    
    const data = { businesses, debtors, investors, offers, adminReviews };
    adminCache = { data, timestamp: now };
    return ApiResponse.success(data);
  } catch (error) {
    if (adminCache) {
      return ApiResponse.success(adminCache.data);
    }
    return ApiResponse.serverError(error);
  }
}
```

### 2. Optimize API Client
Ensure `lib/api/client.ts` uses the cached handlers for server-side calls.

---

## Phase 4: Testing & Validation (Priority: HIGH)

### 1. TypeScript Verification
- Run `npx tsc --noEmit` to ensure 0 errors
- Verify all type imports are correct

### 2. Build Verification
- Run `next build` to ensure no build errors
- Check for SSR warnings

### 3. Runtime Testing
- Test each dashboard page with wallet connected
- Verify prefetching works (no loading spinners on initial load)
- Test mutation invalidation (cache updates after actions)
- Verify error handling and retry behavior

---

## Timeline & Priority Matrix

| Task | Priority | Estimated Time | Dependencies |
|------|----------|---------------|--------------|
| Add missing prefetch functions | HIGH | 1 hour | None |
| Add prefetching to 7 dashboard pages | HIGH | 3 hours | Prefetch functions |
| Add prefetching to 3 verification pages | HIGH | 2 hours | Prefetch functions |
| Update API routes with cached handlers | MEDIUM | 2 hours | Cached handlers |
| Add admin cached handler | MEDIUM | 1 hour | None |
| Migrate marketplace page | MEDIUM | 2 hours | Prefetch functions |
| Migrate create offer page | MEDIUM | 2 hours | Mutation hooks |
| Migrate acknowledge offer page | MEDIUM | 2 hours | Mutation hooks |
| Migrate dispute offer page | MEDIUM | 2 hours | Mutation hooks |
| TypeScript verification | HIGH | 1 hour | All migrations |
| Build verification | HIGH | 1 hour | All migrations |
| Runtime testing | HIGH | 2 hours | Build success |

**Total Estimated Time**: ~19 hours

---

## File Changes Summary

### New Files
- `lib/query/prefetch.ts` - Add admin, workspace, verification prefetch functions
- `app/dashboard/*/server-page.tsx` - Server wrappers for prefetching
- `app/verification/*/server-page.tsx` - Server wrappers for prefetching

### Modified Files
- `lib/query/prefetch.ts` - Add 5 new prefetch functions
- `lib/server/cached-handlers.ts` - Add admin cached handler
- `app/dashboard/business/page.tsx` - Add HydrationProvider wrapper
- `app/dashboard/debtor/page.tsx` - Add HydrationProvider wrapper
- `app/dashboard/investor/page.tsx` - Add HydrationProvider wrapper
- `app/dashboard/admin/page.tsx` - Add HydrationProvider wrapper
- `app/verification/business/page.tsx` - Add HydrationProvider wrapper
- `app/verification/debtor/page.tsx` - Add HydrationProvider wrapper
- `app/verification/investor/page.tsx` - Add HydrationProvider wrapper
- `app/marketplace/page.tsx` - Convert to TanStack Query
- `app/offers/create/page.tsx` - Convert to TanStack Query
- `app/offers/[id]/acknowledge/page.tsx` - Convert to TanStack Query
- `app/offers/[id]/dispute/page.tsx` - Convert to TanStack Query
- `app/api/business/[wallet]/route.ts` - Use cached handler
- `app/api/debtor/[wallet]/route.ts` - Use cached handler
- `app/api/investor/[wallet]/route.ts` - Use cached handler
- `app/api/admin/route.ts` - Use cached handler
- `app/api/marketplace/route.ts` - Use cached handler

---

## Success Criteria

- [ ] All 18 pages use TanStack Query hooks
- [ ] All 18 pages have SSR prefetching implemented
- [ ] All API routes use cached handlers
- [ ] TypeScript compilation succeeds with 0 errors
- [ ] Next.js build succeeds with 0 errors
- [ ] No SSR hydration warnings in console
- [ ] Initial page loads show no loading spinners (data prefetched)
- [ ] Cache invalidation works for all mutations
- [ ] Error handling with retry works for all queries

---

## Risk Mitigation

### Risk: SSR Hydration Mismatch
**Mitigation**: Use consistent query keys between client and server, ensure all hooks use the same staleTime configuration.

### Risk: Cache Invalidation Issues
**Mitigation**: Implement automatic cache invalidation on all mutations, add manual invalidation where needed.

### Risk: TypeScript Errors
**Mitigation**: Run TSC after each major change, fix types incrementally.

### Risk: Build Failures
**Mitigation**: Test builds frequently, use feature flags if needed.

---

## Next Steps

1. **Start with Part B**: Add missing prefetch functions to `lib/query/prefetch.ts`
2. **Continue with Part A**: Add prefetching to the 7 migrated pages
3. **Then Part D**: Migrate remaining 4 server-component pages
4. **Then Part C**: Update API routes with cached handlers
5. **Finally Phase 4**: Testing and validation

---

*Generated: 2026-06-30*
*Status: Plan Approved - Ready for Execution*
