'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react' // Import ไอคอนเพิ่มเติม

export default function SignIn() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })
      if (result.error) {
        // เพิ่มการแจ้งเตือน Error แบบง่ายๆ (ในอนาคตอาจใช้ Toast Library)
        alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        setIsLoading(false)
        return false
      }
      router.push('/')
    } catch (error) {
      setIsLoading(false)
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    }
  }

  return (
    // ใช้ Flexbox แบบเต็มหน้าจอและพื้นหลังสีเทาอ่อน
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      
      {/* Card Container หลัก */}
      <div className="w-full max-w-[1000px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500">
        
        {/* === Left Side (Hero Image & Branding) === */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden">
            {/* Background Image & Effects */}
            <img
              className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
              alt="Technology Background"
            />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-start max-w-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1V4"/><path d="M15 1V4"/><path d="M9 20V23"/><path d="M15 20V23"/><path d="M20 9H23"/><path d="M20 14H23"/><path d="M1 9H4"/><path d="M1 14H4"/></svg>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                Engineering <br />
                <span className="text-blue-200">Intelligence.</span>
              </h2>
              <p className="text-lg text-blue-100/90 font-light leading-relaxed">
                ระบบบริหารจัดการปริญญานิพนธ์ <br/> วิศวกรรมคอมพิวเตอร์
              </p>
            </div>
        </div>

        {/* === Right Side (Form) === */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-50 dark:bg-blue-900/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-sm mx-auto w-full">
            <div className="text-center lg:text-left mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center justify-center lg:justify-start gap-3">
                <LogIn className="text-blue-600 dark:text-blue-400 h-8 w-8" />
                ยินดีต้อนรับกลับ
              </h2>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300">อีเมล</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                    placeholder="student@university.ac.th"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">รหัสผ่าน</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-sm font-medium shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer font-medium">จำฉันไว้ในระบบ</label>
                </div>
                <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">ลืมรหัสผ่าน?</Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit" disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>เข้าสู่ระบบ <LogIn size={18} /></>
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                <Link href="/singup" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}