const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
export interface MeResponse {
  uid: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
  permissions: string[];
  status: "ACTIVE";
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
async function request<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(response.status, body.error ?? "API_ERROR");
  return body;
}
export const api = {
  me: (token: string) => request<MeResponse>("/auth/me", token),
  list: <T>(
    collection: string,
    token: string,
    params = new URLSearchParams(),
  ) =>
    request<{ items: T[]; nextCursor: string | null }>(
      `/entities/${collection}?${params}`,
      token,
    ),
  create: (collection: string, data: Record<string, unknown>, token: string) =>
    request(`/entities/${collection}`, token, {
      method: "POST",
      body: JSON.stringify({ data, operationId: crypto.randomUUID() }),
    }),
  update: (
    collection: string,
    id: string,
    data: Record<string, unknown>,
    expectedVersion: number,
    token: string,
  ) =>
    request(`/entities/${collection}/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        data,
        expectedVersion,
        operationId: crypto.randomUUID(),
      }),
    }),
  remove: (
    collection: string,
    id: string,
    expectedVersion: number,
    token: string,
  ) =>
    request(`/entities/${collection}/${id}`, token, {
      method: "DELETE",
      body: JSON.stringify({
        data: {},
        expectedVersion,
        operationId: crypto.randomUUID(),
      }),
    }),
  users: (token: string) =>
    request<{
      items: Array<{
        uid: string;
        email: string;
        role: "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
        status: "ACTIVE" | "PENDING" | "DISABLED" | "LOCKED";
        version?: number;
      }>;
      nextCursor: string | null;
    }>("/users?limit=25", token),
  updateUser: (
    uid: string,
    data: { role: string; status: string; expectedVersion: number },
    token: string,
  ) =>
    request(`/users/${uid}`, token, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  proposals: (token: string) =>
    request<{ items: Array<Record<string, unknown> & { id: string }> }>(
      "/workflows/proposals",
      token,
    ),
  createProposal: (
    data: {
      reason: string;
      afterSnapshot: Record<string, unknown>;
      operationId: string;
    },
    token: string,
  ) =>
    request("/workflows/proposals", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  approveProposal: (id: string, token: string) =>
    request(`/workflows/proposals/${id}/approve`, token, { method: "POST" }),
  tasks: (token: string) =>
    request<{ items: Array<Record<string, unknown> & { id: string }> }>(
      "/workflows/tasks",
      token,
    ),
  createTask: (data: Record<string, string>, token: string) =>
    request("/workflows/tasks", token, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  uploadPhoto: async (deviceId: string, file: File, token: string) => {
    const form = new FormData();
    form.append("image", file);
    const response = await fetch(`${BASE_URL}/media/devices/${deviceId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = await response.json();
    if (!response.ok)
      throw new ApiError(response.status, body.error ?? "UPLOAD_FAILED");
    return body;
  },
  importDevices: (rows: Array<Record<string, unknown>>, token: string) =>
    request<{ created: number }>("/import/devices", token, {
      method: "POST",
      body: JSON.stringify({ rows, operationId: crypto.randomUUID() }),
    }),
  summary: (token: string) =>
    request<{
      substations: number;
      feeders: number;
      devices: number;
      loops: number;
    }>("/reports/summary", token),
};
