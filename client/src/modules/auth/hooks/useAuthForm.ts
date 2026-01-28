"use client";

// useAuthForm Hook - Shared state management for auth forms
import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok) {
          setMessage("สมัครสมาชิกสำเร็จ");
          setForm(initialSignupForm);
        } else {
          setMessage(data?.error || data?.message || "เกิดข้อผิดพลาด");
        }
      } catch (err) {
        setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      } finally {
        setLoading(false);
      }
    },
    [form],
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const result = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (result?.error) {
          alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          setLoading(false);
          return;
        }

        router.push("/");
      } catch (error) {
        setLoading(false);
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    },
    [form, router],
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
