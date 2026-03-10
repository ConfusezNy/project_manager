"use client";

/**
 * OtpVerifyForm Component
 * 2-Step OTP Verification — ออกแบบให้ match LoginForm design language
 * Step 1: กรอก Email → ขอ OTP
 * Step 2: กรอก OTP 6 หลัก → ยืนยัน → Redirect ตาม role
 */

import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck, RefreshCw, CheckCircle } from "lucide-react";
import { API_URL } from "@/lib/image";

type Step = "email" | "otp";

export const OtpVerifyForm: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // DEV: รับ @gmail.com → ADVISOR | TODO: ลบออกก่อน production
    const validateEmail = (val: string) => {
        const isRmutt = val.endsWith("@mail.rmutt.ac.th") || val.endsWith("@en.rmutt.ac.th");
        const isGmail = val.endsWith("@gmail.com"); // DEV only
        if (!isRmutt && !isGmail) {
            return "อีเมลต้องเป็น @mail.rmutt.ac.th, @en.rmutt.ac.th หรือ @gmail.com (ทดสอบ)";
        }
        return "";
    };

    const handleRequestOtp = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            setSuccess("");
            const errMsg = validateEmail(email);
            if (errMsg) { setEmailError(errMsg); return; }
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/auth/request-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
                setSuccess(`ส่ง OTP ไปยัง ${email} แล้ว`);
                setStep("otp");
                setCountdown(60);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } catch (err: any) {
                setError(err.message || "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่");
            } finally {
                setLoading(false);
            }
        },
        [email]
    );

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otpValues];
        next[index] = value;
        setOtpValues(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setOtpValues(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerifyOtp = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            const otp = otpValues.join("");
            if (otp.length < 6) { setError("กรุณากรอก OTP ให้ครบ 6 หลัก"); return; }
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/auth/verify-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "รหัส OTP ไม่ถูกต้อง");
                const { role } = data;
                const encoded = encodeURIComponent(email);
                router.push(role === "ADVISOR" ? `/signup/advisor?email=${encoded}` : `/signup/student?email=${encoded}`);
            } catch (err: any) {
                setError(err.message || "ยืนยัน OTP ไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        },
        [email, otpValues, router]
    );

    const handleResend = useCallback(async () => {
        if (countdown > 0) return;
        setError("");
        setOtpValues(["", "", "", "", "", ""]);
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/request-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSuccess("ส่ง OTP ใหม่แล้ว!");
            setCountdown(60);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (err: any) {
            setError(err.message || "ส่งอีเมลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [countdown, email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="w-full max-w-[960px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500">

                {/* Left Panel */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden">
                    <img
                        className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
                        src="/cpe.jpg"
                        alt="University Background"
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                    <div className="relative z-10 flex flex-col items-start max-w-sm">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-inner">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                            ยืนยันตัวตน<br />
                            <span className="text-blue-200">ด้วยอีเมล</span>
                        </h2>
                        <p className="text-lg text-blue-100/90 font-light leading-relaxed mb-8">
                            ระบบบริหารจัดการปริญญานิพนธ์<br />วิศวกรรมคอมพิวเตอร์ RMUTT
                        </p>

                        {/* Step indicators */}
                        <div className="w-full space-y-3">
                            {[
                                { n: 1, label: "กรอกอีเมลสถาบัน", sub: "@mail / @en .rmutt.ac.th" },
                                { n: 2, label: "ยืนยันรหัส OTP", sub: "ตรวจสอบ inbox ของคุณ" },
                                { n: 3, label: "กรอกข้อมูลสมาชิก", sub: "ฟอร์มตาม role ของคุณ" },
                            ].map(({ n, label, sub }) => (
                                <div key={n} className={`flex items-center gap-3 p-3 rounded-xl ${(step === "email" && n === 1) || (step === "otp" && n === 2) ? "bg-white/20" : "bg-white/10"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${(step === "email" && n === 1) || (step === "otp" && n === 2) ? "bg-white text-blue-700" : n < (step === "otp" ? 2 : 1) ? "bg-green-400 text-white" : "bg-white/30 text-white"}`}>
                                        {n < (step === "otp" ? 2 : 1) ? "✓" : n}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold">{label}</p>
                                        <p className="text-blue-200 text-xs">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-50 dark:bg-blue-900/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                                {step === "email" ? "ขั้นตอนที่ 1 / 3" : "ขั้นตอนที่ 2 / 3"}
                            </p>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {step === "email" ? "กรอกอีเมลสถาบัน" : "ยืนยันรหัส OTP"}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {step === "email"
                                    ? "เราจะส่งรหัส OTP ไปยังอีเมลของคุณ"
                                    : `ส่งรหัส 6 หลักไปที่ ${email}`}
                            </p>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2 animate-in slide-in-from-top duration-200">
                                <span className="shrink-0 mt-0.5">⚠️</span> {error}
                            </div>
                        )}
                        {success && step === "otp" && (
                            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-400/30 text-green-700 dark:text-emerald-300 text-sm flex items-center gap-2 animate-in slide-in-from-top duration-200">
                                <CheckCircle size={16} className="shrink-0" /> {success}
                            </div>
                        )}

                        {/* Step 1: Email */}
                        {step === "email" && (
                            <form onSubmit={handleRequestOtp} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        อีเมลสถาบัน
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                            placeholder="650123456@mail.rmutt.ac.th"
                                            required
                                            className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm ${emailError ? "border-red-400 focus:ring-red-500/30 focus:border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">
                                        รองรับ: <span className="text-blue-500">@mail.rmutt.ac.th</span> (นักศึกษา) · <span className="text-indigo-500">@en.rmutt.ac.th</span> (อาจารย์)
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <>ขอรหัส OTP <ArrowRight size={16} /></>
                                    )}
                                </button>

                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    มีบัญชีอยู่แล้ว?{" "}
                                    <Link href="/signin" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                                        เข้าสู่ระบบ
                                    </Link>
                                </p>
                            </form>
                        )}

                        {/* Step 2: OTP PIN */}
                        {step === "otp" && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                                        รหัส OTP 6 หลัก
                                    </label>
                                    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                                        {otpValues.map((val, i) => (
                                            <React.Fragment key={i}>
                                                {i === 3 && (
                                                    <div className="flex items-center text-gray-300 dark:text-gray-600 font-bold text-lg select-none">—</div>
                                                )}
                                                <input
                                                    ref={(el) => { inputRefs.current[i] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={val}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-xl border-2 transition-all outline-none shadow-sm ${val
                                                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                                                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                                        } focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`}
                                                />
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otpValues.join("").length < 6}
                                    className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-green-500/20 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 ${(loading || otpValues.join("").length < 6) ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <><CheckCircle size={16} /> ยืนยันและดำเนินการต่อ</>
                                    )}
                                </button>

                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        type="button"
                                        onClick={() => { setStep("email"); setError(""); setSuccess(""); setOtpValues(["", "", "", "", "", ""]); }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        ← เปลี่ยนอีเมล
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || loading}
                                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                                    >
                                        <RefreshCw size={13} />
                                        {countdown > 0 ? `ขอใหม่ได้ใน (${countdown}s)` : "ขอรหัสใหม่"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
