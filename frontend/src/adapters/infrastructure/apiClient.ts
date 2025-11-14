// File: frontend/src/adapters/infrastructure/apiClient.ts
const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined" ? "http://localhost:4000" : "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const message =
      contentType.includes("application/json")
        ? await response.json().then((j) => JSON.stringify(j))
        : await response.text();

    throw new Error(
      `Request failed ${response.status} ${response.statusText}: ${message}`
    );
  }

  // If no content
  if (response.status === 204) return undefined as unknown as T;

  return (await response.json()) as T;
}

export const api = {
  get<T>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: "GET" });
  },
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    if (body !== undefined && !(body instanceof FormData)) {
      if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    }

    return request<T>(path, {
      ...init,
      method: "POST",
      headers,
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  },
};
