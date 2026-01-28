"use client";

// SignupForm Component - Handles user registration
import React from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { useSignupForm } from "../hooks/useAuthForm";

export const SignupForm: React.FC = () => {
  const {
    form,
    loading,
    message,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  } = useSignupForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-[1100px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500">
        {/* Left Side (Branding) */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-indigo-700 to-blue-600 text-white overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1454165833767-0266b196773b?q=80&w=2070&auto=format&fit=crop"
            alt="Work Background"
          />
          <div className="relative z-10 flex flex-col items-start max-w-md">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mb-8 shadow-inner border border-white/30">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Join Our <br />
              <span className="text-indigo-200 font-black">Community.</span>
            </h2>
            <p className="text-lg text-indigo-100/80 font-light leading-relaxed">
              เริ่มต้นสร้างสรรค์ปริญญานิพนธ์ของคุณ
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-[1.2] flex flex-col justify-center p-8 sm:p-12 lg:p-14 relative bg-white dark:bg-gray-800">
          <div className="relative z-10 w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                สร้างบัญชีใหม่
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                กรุณากรอกข้อมูลเพื่อลงทะเบียนเข้าสู่ระบบ
              </p>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top duration-300 ${
                  message.includes("สำเร็จ")
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                {/* Title */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    คำนำหน้า
                  </label>
                  <div className="relative">
                    <select
                      name="titles"
                      value={form.titles}
                      onChange={handleChange}
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="">เลือก</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Firstname */}
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    ชื่อจริง
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      name="firstname"
                      value={form.firstname}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Lastname */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  นามสกุล
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      name="tel_number"
                      value={form.tel_number}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="08XXXXXXXX"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    อีเมลนักศึกษา
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="student@univ.ac.th"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  รหัสผ่าน
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-semibold dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      กำลังประมวลผล...
                    </span>
                  ) : (
                    "ลงทะเบียนเข้าสู่ระบบ"
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
                <Link
                  href="/singin"
                  className="font-black text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                >
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
