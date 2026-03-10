"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForgotPasswordForm } from "@/modules/auth/hooks/useForgotPasswordForm";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get("email") || "";

    const { loading, message, error, resetPassword } = useForgotPasswordForm();

    const [form, setForm] = useState({
        email: emailFromQuery,
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        if (form.newPassword.length < 8) {
            setValidationError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            return;
        }

        if (!/\d/.test(form.newPassword)) {
            setValidationError("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setValidationError("รหัสผ่านไม่ตรงกัน");
            return;
        }

        const success = await resetPassword(form.email, form.otp, form.newPassword);
        if (success) {
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 sm:p-12">
                    {/* Back Link */}
                    <Link
                        href="/forgot-password"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
                    >
                        <ArrowLeft size={16} />
                        ขอรหัส OTP ใหม่
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 mb-6">
                            <KeyRound className="text-blue-600 dark:text-blue-400 h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            รีเซ็ตรหัสผ่าน
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            กรอกรหัส OTP ที่ได้จากอีเมล แล้วตั้งรหัสผ่านใหม่
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                อีเมล
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                                placeholder="your-email@mail.rmutt.ac.th"
                            />
                        </div>

                        {/* OTP */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                รหัส OTP (6 หลัก)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={form.otp}
                                    onChange={(e) =>
                                        setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })
                                    }
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm tracking-[0.3em] text-center"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                รหัสผ่านใหม่
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                    className="block w-full px-4 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                                    placeholder="อย่างน้อย 8 ตัวอักษร + ตัวเลข 1 ตัว"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                required
                                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                                placeholder="ยืนยันรหัสผ่าน"
                            />
                        </div>

                        {/* Validation Error */}
                        {validationError && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                    ⚠️ {validationError}
                                </p>
                            </div>
                        )}

                        {/* Success Message */}
                        {message && (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                    ✅ {message}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                                    ❌ {error}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    กำลังเปลี่ยนรหัสผ่าน...
                                </>
                            ) : (
                                <>
                                    เปลี่ยนรหัสผ่าน <KeyRound size={18} />
                                </>
                            )}
                        </button>

                        {/* Back to Login */}
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                            <Link
                                href="/signin"
                                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
                            >
                                กลับไปเข้าสู่ระบบ
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
