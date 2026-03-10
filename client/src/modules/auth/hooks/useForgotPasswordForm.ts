"use client";

/**
 * useForgotPasswordForm Hook
 * จัดการ state สำหรับ forgot password + reset password flow
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/image";

export function useForgotPasswordForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ขอ OTP สำหรับรีเซ็ตรหัสผ่าน
    const requestOtp = useCallback(async (email: string) => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "เกิดข้อผิดพลาด");
            }

            const data = await res.json();
            setMessage(data.message);
            return true;
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาด");
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // ยืนยัน OTP + เปลี่ยนรหัสผ่าน
    const resetPassword = useCallback(
        async (email: string, otp: string, newPassword: string) => {
            setLoading(true);
            setError(null);
            setMessage(null);

            try {
                const res = await fetch(`${API_URL}/auth/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp, newPassword }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "เกิดข้อผิดพลาด");
                }

                const data = await res.json();
                setMessage(data.message);
                return true;
            } catch (err: any) {
                setError(err.message || "เกิดข้อผิดพลาด");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        loading,
        message,
        error,
        requestOtp,
        resetPassword,
    };
}
