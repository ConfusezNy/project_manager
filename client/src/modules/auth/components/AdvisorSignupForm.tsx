"use client";

/**
 * AdvisorSignupForm Component
 * Design: Match LoginForm — light mode, white card, purple hero panel (แยกจาก student)
 */

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronDown, UserPlus, BookOpen } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ADVISOR_TITLES = [
    "รองศาสตราจารย์ ดร.",
    "รองศาสตราจารย์",
    "ผู้ช่วยศาสตราจารย์ ดร.",
    "ผู้ช่วยศาสตราจารย์",
    "อาจารย์ ดร.",
    "ดร.",
    "อาจารย์",
];

export const AdvisorSignupForm: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const verifiedEmail = searchParams.get("email") ?? "";

    const [form, setForm] = useState({
        titles: "",
        firstname: "",
        lastname: "",
        tel_number: "",
        email: verifiedEmail,
        password: "",
        expertiseAreas: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            const sanitized = name === "tel_number" ? value.replace(/\D/g, "") : value;
            setForm((prev) => ({ ...prev, [name]: sanitized }));
        },
        []
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setMessage(null);

            // Validate required fields
            if (!form.firstname.trim()) {
                setMessage({ type: "error", text: "กรุณากรอกชื่อจริง" });
                setLoading(false);
                return;
            }
            if (!form.lastname.trim()) {
                setMessage({ type: "error", text: "กรุณากรอกนามสกุล" });
                setLoading(false);
                return;
            }
            if (form.tel_number) {
                const tel = form.tel_number.trim();
                if (!/^0\d{9}$/.test(tel)) {
                    setMessage({ type: "error", text: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0" });
                    setLoading(false);
                    return;
                }
            }

            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/auth/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        titles: form.titles || undefined,
                        firstname: form.firstname.trim(),
                        lastname: form.lastname.trim(),
                        tel_number: form.tel_number.trim() || undefined,
                        email: form.email,
                        password: form.password,
                        expertiseAreas: form.expertiseAreas || undefined,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");

                // บันทึก token ถ้ามี
                if (data.access_token) localStorage.setItem("token", data.access_token);
                setMessage({ type: "success", text: "สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ..." });
                setTimeout(() => router.push("/dashboard"), 1000);
            } catch (err: any) {
                setMessage({ type: "error", text: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่" });
            } finally {
                setLoading(false);
            }
        },
        [form, router]
    );

    const inputClass = "block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 text-sm font-medium shadow-sm";
    const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="w-full max-w-[1020px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500">

                {/* Left Panel — Purple for Advisor */}
                <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-violet-600 to-purple-800 text-white overflow-hidden">
                    <img
                        className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                        alt="Advisor Background"
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                    <div className="relative z-10 flex flex-col items-start max-w-md">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-inner">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                            สมัครสมาชิก<br />
                            <span className="text-purple-200">อาจารย์ที่ปรึกษา</span>
                        </h2>
                        <p className="text-lg text-purple-100/90 font-light leading-relaxed mb-8">
                            ระบบบริหารจัดการปริญญานิพนธ์<br />วิศวกรรมคอมพิวเตอร์ RMUTT
                        </p>

                        {/* Verified + Info */}
                        <div className="w-full space-y-3">
                            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center shrink-0">
                                        <span className="text-white text-xs font-black">✓</span>
                                    </div>
                                    <p className="text-white text-sm font-bold">ยืนยันอีเมลสำเร็จ</p>
                                </div>
                                <p className="text-purple-200 text-xs break-all pl-7">{verifiedEmail}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                                <p className="text-purple-200 text-xs leading-relaxed">
                                    💡 กรอกข้อมูลความเชี่ยวชาญเพื่อให้นักศึกษาค้นหาและเลือกอาจารย์ที่ปรึกษาได้ง่ายขึ้น
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-violet-50 dark:bg-violet-900/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-purple-50 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-sm mx-auto w-full">
                        <div className="text-center lg:text-left mb-8">
                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">ขั้นตอนที่ 3 / 3</p>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center lg:justify-start gap-3">
                                <BookOpen className="text-violet-600 dark:text-violet-400 h-8 w-8" />
                                กรอกข้อมูลอาจารย์
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">กรอกข้อมูลเพื่อสร้างบัญชีอาจารย์ที่ปรึกษา</p>
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
                                <div className="col-span-5 space-y-2">
                                    <label className={labelClass}>คำนำหน้า</label>
                                    <div className="relative">
                                        <select
                                            name="titles"
                                            value={form.titles}
                                            onChange={handleChange}
                                            className="block w-full pl-3 pr-8 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">เลือก</option>
                                            {ADVISOR_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="col-span-7 space-y-2">
                                    <label className={labelClass}>ชื่อจริง</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
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
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="นามสกุล" required className={inputClass} />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className={labelClass}>เบอร์โทรศัพท์</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <input name="tel_number" value={form.tel_number} onChange={handleChange} placeholder="08XXXXXXXX" maxLength={10} inputMode="numeric" pattern="[0-9]*" className={inputClass} />
                                </div>
                            </div>

                            {/* Email (read-only) */}
                            <div className="space-y-2">
                                <label className={labelClass}>อีเมลอาจารย์ <span className="text-xs font-normal text-green-600 dark:text-green-400">(ยืนยันแล้ว ✓)</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-green-500" />
                                    </div>
                                    <input
                                        name="email" type="email" value={form.email} readOnly
                                        className="block w-full pl-11 pr-4 py-3.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-300 text-sm font-medium shadow-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Expertise */}
                            <div className="space-y-2">
                                <label className={labelClass}>ความเชี่ยวชาญ <span className="text-xs font-normal text-gray-400">(ไม่บังคับ)</span></label>
                                <textarea
                                    name="expertiseAreas"
                                    value={form.expertiseAreas}
                                    onChange={handleChange}
                                    placeholder="เช่น AI, Machine Learning, Computer Networks, Embedded Systems"
                                    rows={2}
                                    className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 text-sm font-medium shadow-sm resize-none"
                                />
                                <p className="text-gray-400 text-xs">คั่นด้วยจุลภาค เช่น "AI, ML, Python"</p>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className={labelClass}>ตั้งรหัสผ่าน <span className="text-xs font-normal text-gray-400">(อย่างน้อย 6 ตัว)</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-200 text-sm font-medium shadow-sm"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus:outline-none">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/30 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all active:scale-95 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <><UserPlus size={18} /> สร้างบัญชีอาจารย์ที่ปรึกษา</>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                                มีบัญชีอยู่แล้ว?{" "}
                                <Link href="/signin" className="font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline transition-colors">
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
