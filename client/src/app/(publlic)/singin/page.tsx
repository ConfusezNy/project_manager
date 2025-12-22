'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
// นำเข้าไอคอนเพิ่ม (ถ้าคุณใช้ lucide-react อยู่แล้ว)
import { Eye, EyeOff } from 'lucide-react' 

export default function SignIn() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  // 1. เพิ่ม State สำหรับควบคุมการมองเห็นรหัสผ่าน
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
        setIsLoading(false)
        return false
      }
      router.push('/')
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-gray-900 bg-white overflow-y-scroll">
      {/* === Left Side === */}
      <div className="hidden lg:flex relative w-0 flex-1 overflow-hidden bg-gray-900 items-center justify-center">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
          alt="Technology"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/95 to-black/90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 p-12 max-w-2xl">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-400">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1V4"/><path d="M15 1V4"/><path d="M9 20V23"/><path d="M15 20V23"/><path d="M20 9H23"/><path d="M20 14H23"/><path d="M1 9H4"/><path d="M1 14H4"/></svg>
          </div>
          <h2 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Engineering <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Intelligence.
            </span>
          </h2>
          <p className="text-lg text-blue-100/70 font-light leading-relaxed max-w-md">
            ระบบบริหารจัดการปริญญานิพนธ์วิศวกรรมคอมพิวเตอร์
          </p>
        </div>
      </div>

      {/* === Right Side === */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-24 xl:px-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-50/50 blur-3xl pointer-events-none" />

        <div className="mx-auto w-full max-w-sm lg:w-[420px] relative z-10">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ยินดีต้อนรับกลับ</h2>
            <p className="mt-3 text-base text-slate-500">กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูลปริญญานิพนธ์</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">อีเมล</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium"
                  placeholder="student@university.ac.th"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">รหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password" 
                  // 2. เปลี่ยน type ตาม State
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  // 3. เพิ่ม pr-12 เพื่อไม่ให้ตัวหนังสือทับไอคอนดวงตา
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium"
                  placeholder="••••••••"
                />
                {/* 4. เพิ่มปุ่มสลับการมองเห็นไว้ที่มุมขวา */}
                <button
                  type="button" // ต้องระบุเป็นปุ่มเพื่อไม่ให้ Enter แล้ว Submit ฟอร์ม
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">จำฉันไว้ในระบบ</label>
              </div>
              <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">ลืมรหัสผ่าน?</Link>
            </div>

            <button
              type="submit" disabled={isLoading}
              className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>

            <p className="text-center text-sm text-slate-500">
              ยังไม่มีบัญชีผู้ใช้งาน?{' '}
              <Link href="/signup" className="font-bold text-blue-600 hover:underline">สมัครสมาชิกใหม่</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}