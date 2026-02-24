/**
 * API Wrapper — เรียก NestJS Backend
 * ย้ายมาจาก: client/src/lib/api.ts (เวอร์ชัน NextAuth)
 *
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - เดิม: ใช้ relative URL (/api/*) + credentials: include (NextAuth cookies)
 * - ใหม่: ใช้ BASE_URL (localhost:4000) + Authorization: Bearer <JWT>
 * - ลบ NextAuth imports (getSession, signOut)
 * - เพิ่ม getToken() จาก auth-context
 */

import { getToken } from "@/lib/auth-context";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Wrapper around fetch ที่จัดการ JWT token + BASE_URL ให้อัตโนมัติ
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

  // สร้าง full URL: BASE_URL + path
  let fullUrl = `${BASE_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    fullUrl += `?${searchParams.toString()}`;
  }

  // ใส่ JWT token ใน Authorization header
  const token = getToken();
  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(fullUrl, init);

  if (!response.ok) {
    // Handle 401 Unauthorized globally → redirect to login
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
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
