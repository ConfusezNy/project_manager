"use client";

/**
 * Auth Context — แทน NextAuth SessionProvider
 * ย้ายมาจาก: client/src/lib/auth.ts + NextAuth SessionProvider
 *
 * 📌 หน้าที่:
 * - เก็บ JWT token ใน cookie ชื่อ 'access_token'
 * - login/signup เรียก NestJS backend ตรง
 * - logout ลบ cookie + redirect /signin
 * - useAuth() hook ให้ user, status, login, logout, signup, getToken
 *
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - เดิมใช้ NextAuth SessionProvider + useSession()
 * - ใหม่ใช้ React Context + JWT cookie
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

// =====================================================
// Types
// =====================================================

interface AuthUser {
    users_id: string;
    email: string;
    role: string;
    firstname: string;
    lastname: string;
}

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    firstname: string;
    lastname: string;
    exp: number;
    iat: number;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
    user: AuthUser | null;
    status: AuthStatus;
    login: (email: string, password: string) => Promise<{ user: AuthUser }>;
    signup: (data: SignupData) => Promise<{ user: AuthUser }>;
    logout: () => void;
}

interface SignupData {
    titles?: string;
    firstname: string;
    lastname: string;
    tel_number?: string;
    email: string;
    password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// =====================================================
// Cookie helpers
// =====================================================

const COOKIE_NAME = "access_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function setCookie(name: string, value: string, days: number = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// =====================================================
// getToken — Export สำหรับ api.ts ใช้ (ไม่ต้องผ่าน hook)
// =====================================================

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return getCookie(COOKIE_NAME);
}

// =====================================================
// Decode JWT → AuthUser
// =====================================================

function decodeToken(token: string): AuthUser | null {
    try {
        const payload = jwtDecode<JwtPayload>(token);
        // เช็ค token หมดอายุ
        if (payload.exp * 1000 < Date.now()) {
            return null;
        }
        return {
            users_id: payload.sub,
            email: payload.email,
            role: payload.role,
            firstname: payload.firstname,
            lastname: payload.lastname,
        };
    } catch {
        return null;
    }
}

// =====================================================
// AuthProvider Component
// =====================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");
    const router = useRouter();

    // ตรวจสอบ token จาก cookie ตอน mount
    useEffect(() => {
        const token = getCookie(COOKIE_NAME);
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setUser(decoded);
                setStatus("authenticated");
            } else {
                // Token หมดอายุ → ลบออก
                deleteCookie(COOKIE_NAME);
                setStatus("unauthenticated");
            }
        } else {
            setStatus("unauthenticated");
        }
    }, []);

    // =====================================================
    // login — POST /auth/login → เก็บ token + set user
    // =====================================================
    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        const data = await res.json();
        const { access_token, user: userData } = data;

        // เก็บ token ใน cookie
        setCookie(COOKIE_NAME, access_token, 7);

        // Decode token → set user state
        const decoded = decodeToken(access_token);
        if (decoded) {
            setUser(decoded);
            setStatus("authenticated");
        }

        return { user: userData };
    }, []);

    // =====================================================
    // signup — POST /auth/signup → เก็บ token + set user
    // =====================================================
    const signup = useCallback(async (signupData: SignupData) => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupData),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "สมัครสมาชิกไม่สำเร็จ");
        }

        const data = await res.json();
        const { access_token, user: userData } = data;

        // เก็บ token ใน cookie
        setCookie(COOKIE_NAME, access_token, 7);

        // Decode token → set user state
        const decoded = decodeToken(access_token);
        if (decoded) {
            setUser(decoded);
            setStatus("authenticated");
        }

        return { user: userData };
    }, []);

    // =====================================================
    // logout — ลบ cookie + redirect /signin
    // =====================================================
    const logout = useCallback(() => {
        deleteCookie(COOKIE_NAME);
        setUser(null);
        setStatus("unauthenticated");
        router.push("/signin");
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, status, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// =====================================================
// useAuth hook — แทน useSession()
// =====================================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
