import { api } from "../api";

export type CreatePropertyPayload = {
  name: string;
  country: string;
  city: string;
  area: string;
  address: string;
  notes: string;
  property_type: "apartment" | "house" | "commercial";
  number_of_units: number;
  default_rent: number;
  default_deposit: number;
  unit_code_prefix: string;
};

export function createProperty(payload: CreatePropertyPayload) {
  return api("/api/properties", { method: "POST", json: payload });
}

export function getProperties() {
  return api("/api/properties", { method: "GET" });
}

export function getProperty(id: string) {
  return api(`/api/properties/${id}`, { method: "GET" });
}

export function updateProperty(id: string, payload: Partial<CreatePropertyPayload>) {
  return api(`/api/properties/${id}`, { method: "PUT", json: payload });
}

export function deleteProperty(id: string) {
  return api(`/api/properties/${id}`, { method: "DELETE" });
}

