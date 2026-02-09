import { getSession, signOut } from "next-auth/react";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Wrapper around fetch that ensures credentials are sent and handles errors.
 */
export const api = {
  get: async <T = any>(url: string, options?: FetchOptions): Promise<T> => {
    return request<T>(url, { ...options, method: "GET" });
  },
  post: async <T = any>(
    url: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> => {
    return request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  },
  put: async <T = any>(
    url: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> => {
    return request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  },
  delete: async <T = any>(url: string, options?: FetchOptions): Promise<T> => {
    return request<T>(url, { ...options, method: "DELETE" });
  },
  patch: async <T = any>(
    url: string,
    body: any,
    options?: FetchOptions,
  ): Promise<T> => {
    return request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  },
};

async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  // Append query params if present
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl += `?${searchParams.toString()}`;
  }

  // CRITICAL: Always include credentials to send HttpOnly cookies
  init.credentials = "include";

  const response = await fetch(fullUrl, init);

  if (!response.ok) {
    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      // Optional: Trigger global logout or refresh logic defined in the app
      // window.location.href = "/signin"; // Basic redirection
    }

    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error ||
        errorBody.message ||
        `Request failed with status ${response.status}`,
    );
  }

  // Return empty object for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
