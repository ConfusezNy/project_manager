'use client';

/**
 * ProfileSettings — แก้ไขข้อมูลส่วนตัว
 * ⚠️ เปลี่ยนจาก Base64 inline → Upload API endpoint
 * ⚠️ Fetch profile จาก GET /profile (ไม่ใช่จาก JWT ที่ไม่มี profilePicture)
 */

import { useAuth, getToken } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useEffect, useState, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProfileSettings() {
  const { user, status } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<{ firstname?: string; lastname?: string; tel_number?: string }>({});

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    tel_number: "",
  });

  // อาจารย์และนักศึกษาแก้ไขได้แค่รูปโปรไฟล์ ไม่สามารถแก้ชื่อหรือเบอร์โทรได้
  const isAdmin = user?.role === "ADMIN";
  const canEditFields = isAdmin;

  // Fetch full profile from API (JWT ไม่มี profilePicture)
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const profile = await api.get("/profile");
        setFormData({
          firstname: profile.firstname || "",
          lastname: profile.lastname || "",
          tel_number: profile.tel_number || "",
        });
        // แสดงรูปโปรไฟล์เดิม
        if (profile.profilePicture) {
          if (profile.profilePicture.startsWith("/uploads")) {
            setPreviewUrl(`${API_URL}${profile.profilePicture}`);
          } else {
            // Legacy Base64 or external URL
            setPreviewUrl(profile.profilePicture);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fallback to JWT data
        if (user) {
          setFormData({
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            tel_number: "",
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [status]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2 MB");
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const token = getToken();
      const res = await fetch(`${API_URL}/uploads/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "อัปโหลดรูปไม่สำเร็จ");
      }

      const data = await res.json();
      setUploadedFileUrl(data.fileUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
      setPreviewUrl(null);
      setUploadedFileUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Record<string, string> = {};

      // ADMIN สามารถแก้ไขชื่อ นามสกุล เบอร์โทรได้
      if (canEditFields) {
        const newErrors: typeof errors = {};
        if (!formData.firstname.trim()) newErrors.firstname = "กรุณากรอกชื่อจริง";
        if (!formData.lastname.trim()) newErrors.lastname = "กรุณากรอกนามสกุล";
        if (formData.tel_number && !/^0\d{9}$/.test(formData.tel_number)) {
          newErrors.tel_number = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }
        setErrors({});
        payload.firstname = formData.firstname.trim();
        payload.lastname = formData.lastname.trim();
        payload.tel_number = formData.tel_number.trim();
      }

      // ทุก role สามารถเปลี่ยนรูปโปรไฟล์ได้
      if (uploadedFileUrl) {
        payload.profilePicture = uploadedFileUrl;
      }

      // ถ้าไม่มีอะไรจะบันทึก
      if (Object.keys(payload).length === 0) {
        alert("ไม่มีการเปลี่ยนแปลง");
        setIsSubmitting(false);
        return;
      }

      await api.patch("/profile", payload);
      alert("บันทึกข้อมูลสำเร็จ!");
    } catch (error: unknown) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || loadingProfile) return <div className="p-6">กำลังโหลด...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
      <h2 className="text-xl font-bold mb-6 dark:text-white">ข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/20 bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="profile" /> : formData.firstname?.charAt(0)}
          </div>
          <div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm border rounded-xl dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">เปลี่ยนรูปโปรไฟล์</button>
            <p className="text-xs text-gray-400 mt-1">สูงสุด 2 MB (JPG, PNG, GIF, WebP)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">ชื่อจริง</label>
            {canEditFields ? (
              <>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={e => {
                    setFormData({ ...formData, firstname: e.target.value });
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, firstname: undefined }));
                  }}
                  className={`w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstname ? "border-red-400" : ""}`}
                />
                {errors.firstname && <p className="text-xs text-red-500">{errors.firstname}</p>}
              </>
            ) : (
              <p className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300 text-gray-700">{formData.firstname || "-"}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">นามสกุล</label>
            {canEditFields ? (
              <>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={e => {
                    setFormData({ ...formData, lastname: e.target.value });
                    if (e.target.value.trim()) setErrors(prev => ({ ...prev, lastname: undefined }));
                  }}
                  className={`w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastname ? "border-red-400" : ""}`}
                />
                {errors.lastname && <p className="text-xs text-red-500">{errors.lastname}</p>}
              </>
            ) : (
              <p className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300 text-gray-700">{formData.lastname || "-"}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">เบอร์โทรศัพท์</label>
            {canEditFields ? (
              <>
                <input
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                  value={formData.tel_number}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, tel_number: digits });
                    if (!digits || /^0\d{9}$/.test(digits)) setErrors(prev => ({ ...prev, tel_number: undefined }));
                  }}
                  className={`w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 ${errors.tel_number ? "border-red-400" : ""}`}
                />
                {errors.tel_number && <p className="text-xs text-red-500">{errors.tel_number}</p>}
              </>
            ) : (
              <p className="w-full p-3 border rounded-xl bg-gray-50 dark:bg-gray-900/50 dark:text-gray-300 text-gray-700">{formData.tel_number || "-"}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? "กำลังบันทึก..." : (canEditFields ? "บันทึกการเปลี่ยนแปลง" : "บันทึกรูปโปรไฟล์")}
          </button>
        </div>
      </form>
    </div>
  );
}