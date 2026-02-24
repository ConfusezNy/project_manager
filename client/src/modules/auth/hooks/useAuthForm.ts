"use client";

/**
 * useAuthForm Hook - Shared state management for auth forms
 * ย้ายมาจาก: client/src/modules/auth/hooks/useAuthForm.ts (เวอร์ชัน NextAuth)
 *
 * ⚠️ สิ่งที่เปลี่ยนจากเดิม:
 * - Login: เดิมใช้ signIn("credentials") จาก NextAuth → ใหม่ใช้ useAuth().login()
 * - Signup: เดิมใช้ raw fetch("/api/auth/signup") → ใหม่ใช้ useAuth().signup()
 * - ลบ NextAuth imports ทั้งหมด
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export interface SignupFormData {
  titles: string;
  firstname: string;
  lastname: string;
  tel_number: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const initialSignupForm: SignupFormData = {
  titles: "",
  firstname: "",
  lastname: "",
  tel_number: "",
  email: "",
  password: "",
};

const initialLoginForm: LoginFormData = {
  email: "",
  password: "",
  rememberMe: false,
};

export function useSignupForm() {
  const [form, setForm] = useState<SignupFormData>(initialSignupForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage(null);

      try {
        // ใช้ useAuth().signup() → POST /auth/signup ไปที่ NestJS
        await signup({
          titles: form.titles || undefined,
          firstname: form.firstname,
          lastname: form.lastname,
          tel_number: form.tel_number || undefined,
          email: form.email,
          password: form.password,
        });

        setMessage("สมัครสมาชิกสำเร็จ");
        setForm(initialSignupForm);

        // Redirect to dashboard หลังสมัครสำเร็จ
        router.push("/dashboard");
      } catch (err: any) {
        setMessage(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    },
    [form, signup, router],
  );

  return {
    form,
    loading,
    message,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  };
}

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormData>(initialLoginForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Get redirect path based on role
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "/admin-dashboard";
      case "ADVISOR":
        return "/advisor-dashboard";
      case "STUDENT":
      default:
        return "/dashboard";
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        // ใช้ useAuth().login() → POST /auth/login ไปที่ NestJS
        const result = await login(form.email, form.password);

        // Redirect based on role
        const role = result.user?.role || "STUDENT";
        const redirectPath = getRedirectPath(role);
        router.push(redirectPath);
      } catch (error: any) {
        setLoading(false);
        alert(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    },
    [form, router, login],
  );

  return {
    form,
    loading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  };
}
