import { api } from "../api";

export function getDashboardSummary() {
  return api("/api/dashboard/summary", { method: "GET" });
}
