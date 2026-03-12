import { api } from "../api";

export type RegisterPayload = {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  role?: "landlord" | "tenant";
};

export function register(payload: RegisterPayload) {
  return api("/api/auth/register", { method: "POST", json: payload });
}

export function signin(email: string, password: string) {
  console.log("Signing in with email:", email, "and password:", password);
  return api("/api/auth/signin", { method: "POST", json: { email, password } });
}

export function signout() {
  return api("/api/auth/signout", { method: "POST" });
}

export function me() {
  return api("/api/auth/me", { method: "GET" });
}