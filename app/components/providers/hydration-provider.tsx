"use client";

import { HydrationBoundary, QueryClient, QueryClientProvider, DehydratedState } from "@tanstack/react-query";
import { useState } from "react";

export function HydrationProvider({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState: DehydratedState | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState || undefined}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
