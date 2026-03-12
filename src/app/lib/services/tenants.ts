import { api } from "../api";

export type TenantUser = {
  id: number;
  full_name: string;
  email?: string | null;
  phone: string;
  is_active: boolean;
};

export type TenantListItem = {
  tenant_id: number;
  user: TenantUser;
  profile?: {
    national_id?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
  };
};

export type TenantListResponse = {
  items: TenantListItem[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
};

export type CreateTenantPayload = {
  full_name: string;
  phone: string;
  email?: string;
  password?: string;
  national_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
};

export function getTenants(q?: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }

  const queryString = params.toString();
  return api(`/api/tenants${queryString ? `?${queryString}` : ""}`, {
    method: "GET",
  }) as Promise<TenantListResponse>;
}

export function createTenant(payload: CreateTenantPayload) {
  return api("/api/tenants", { method: "POST", json: payload });
}

export function deactivateTenant(tenantId: number) {
  return api(`/api/tenants/${tenantId}`, { method: "DELETE" });
}
