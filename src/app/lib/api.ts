// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = RequestInit & { json?: unknown };

export async function api(path: string, options: ApiOptions = {}) {
  const { json, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  // ✅ Only set JSON headers when sending JSON (POST/PUT/PATCH etc.)
  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include", // ✅ required for JWT cookies
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error || data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}
