import { jsonSafe } from "@/lib/utils/json-safe";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, API_BASE);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(endpoint, API_BASE).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonSafe(body)),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Marketplace
  async getMarketplaceData() {
    return this.get<any>("/api/marketplace");
  }

  // Business
  async getBusinessDashboard(wallet: string) {
    return this.get<{ offers: any[]; business: any }>(
      `/api/dashboard/business`,
      { wallet }
    );
  }

  async getDebtorDashboard(wallet: string) {
    return this.get<{ offers: any[]; debtor: any }>(
      `/api/dashboard/debtor`,
      { wallet }
    );
  }

  async getInvestorDashboard(wallet: string) {
    return this.get<{ offers: any[]; investor: any }>(
      `/api/dashboard/investor`,
      { wallet }
    );
  }

  // Admin
  async getAdminDashboard() {
    return this.get<any>("/api/dashboard/admin");
  }

  // Workspace
  async getWorkspaceData() {
    return this.get<any>("/api/workspace");
  }

  // Offer
  async getOfferById(id: string) {
    return this.get<{ offer: any; business: any; debtor: any }>(
      `/api/offers/${id}`
    );
  }

  // Operations
  async prepareOperation(input: any) {
    return this.post<{ operation: any }>("/api/operations/prepare", input);
  }

  async buildTransaction(params: { operationId: string; walletAddress: string }) {
    return this.post<{ unsignedXdr: string; networkPassphrase: string }>(
      "/api/operations/build",
      params
    );
  }

  async submitTransaction(params: { operationId: string; signedXdr: string }) {
    return this.post<{ operation: any }>("/api/operations/submit", params);
  }

  // Verification
  async getBusinessVerificationStatus(wallet: string) {
    return this.get<any>(`/api/verification/business/status`, { wallet });
  }

  async getDebtorVerificationStatus(wallet: string) {
    return this.get<any>(`/api/verification/debtor/status`, { wallet });
  }

  async getInvestorVerificationStatus(wallet: string) {
    return this.get<any>(`/api/verification/investor/status`, { wallet });
  }

  async submitInvestorVerification(data: any) {
    return this.post<{ success: boolean; message: string }>(
      "/api/verification/investor/submit",
      data
    );
  }

  async submitDebtorVerification(data: any) {
    return this.post<{ success: boolean; message: string }>(
      "/api/verification/debtor/submit",
      data
    );
  }

  async submitBusinessVerification(data: any) {
    return this.post<{ success: boolean; message: string }>(
      "/api/verification/business/submit",
      data
    );
  }
}

export const apiClient = ApiClient.getInstance();
