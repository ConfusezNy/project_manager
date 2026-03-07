"use client";

/**
 * StudentSignupForm Component
 * Design: Match LoginForm — light mode, white card, blue hero panel
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronDown, UserPlus, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const STUDENT_TITLES = ["นาย", "นาง", "นางสาว"];

export const StudentSignupForm: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { signup } = useAuth();

    const verifiedEmail = searchParams.get("email") ?? "";

    const [form, setForm] = useState({
        titles: "",
        firstname: "",
        lastname: "",
        tel_number: "",
        email: verifiedEmail,
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setForm((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setMessage(null);
            try {
                await signup({
                    titles: form.titles || undefined,
                    firstname: form.firstname,
                    lastname: form.lastname,
                    tel_number: form.tel_number || undefined,
                    email: form.email,
                    password: form.password,
                });
                setMessage({ type: "success", text: "สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ..." });
                router.push("/dashboard");
            } catch (err: any) {
                setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
            } finally {
                setLoading(false);
            }
        },
        [form, signup, router]
    );

    const inputClass = "block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm";
    const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="w-full max-w-[1000px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500">

                {/* Left Panel */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden">
                    <img
                        className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2071&auto=format&fit=crop"
                        alt="Student Background"
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                    <div className="relative z-10 flex flex-col items-start max-w-md">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-inner">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                            สมัครสมาชิก<br />
                            <span className="text-blue-200">นักศึกษา</span>
                        </h2>
                        <p className="text-lg text-blue-100/90 font-light leading-relaxed mb-8">
                            ระบบบริหารจัดการปริญญานิพนธ์<br />วิศวกรรมคอมพิวเตอร์ RMUTT
                        </p>

                        {/* Verified email badge */}
                        <div className="w-full bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-black">✓</span>
                                </div>
                                <p className="text-white text-sm font-bold">ยืนยันอีเมลสำเร็จ</p>
                            </div>
                            <p className="text-blue-200 text-xs break-all pl-7">{verifiedEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-50 dark:bg-blue-900/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-sm mx-auto w-full">
                        <div className="text-center lg:text-left mb-8">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">ขั้นตอนที่ 3 / 3</p>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center lg:justify-start gap-3">
                                <GraduationCap className="text-blue-600 dark:text-blue-400 h-8 w-8" />
                                กรอกข้อมูลนักศึกษา
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้</p>
                        </div>

                        {message && (
                            <div className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium animate-in slide-in-from-top duration-200 ${message.type === "success"
                                ? "bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-400/30 text-green-700 dark:text-emerald-300"
                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-400"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Title + Firstname */}
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-4 space-y-2">
                                    <label className={labelClass}>คำนำหน้า</label>
                                    <div className="relative">
                                        <select
                                            name="titles"
                                            value={form.titles}
                                            onChange={handleChange}
                                            className="block w-full pl-3 pr-8 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">เลือก</option>
                                            {STUDENT_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="col-span-8 space-y-2">
                                    <label className={labelClass}>ชื่อจริง</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="ชื่อจริง" required className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            {/* Lastname */}
                            <div className="space-y-2">
                                <label className={labelClass}>นามสกุล</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="นามสกุล" required className={inputClass} />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className={labelClass}>เบอร์โทรศัพท์</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input name="tel_number" value={form.tel_number} onChange={handleChange} placeholder="08XXXXXXXX" maxLength={10} className={inputClass} />
                                </div>
                            </div>

                            {/* Email (read-only) */}
                            <div className="space-y-2">
                                <label className={labelClass}>อีเมลนักศึกษา <span className="text-xs font-normal text-green-600 dark:text-green-400">(ยืนยันแล้ว ✓)</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-green-500" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        readOnly
                                        className="block w-full pl-11 pr-4 py-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-300 text-sm font-medium shadow-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className={labelClass}>ตั้งรหัสผ่าน <span className="text-xs font-normal text-gray-400">(อย่างน้อย 6 ตัว)</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <><UserPlus size={18} /> สร้างบัญชีนักศึกษา</>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                มีบัญชีอยู่แล้ว?{" "}
                                <Link href="/signin" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                                    เข้าสู่ระบบ
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
