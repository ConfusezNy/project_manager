"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Camera, ChevronDown, Plus, X as XIcon } from "lucide-react";
import { User } from "./UserTable";
import { getToken } from "@/lib/auth-context";
import { getImageSrc, API_URL } from "@/lib/image";

const ALL_TITLES = [
    "รองศาสตราจารย์ ดร.",
    "รองศาสตราจารย์",
    "ผู้ช่วยศาสตราจารย์ ดร.",
    "ผู้ช่วยศาสตราจารย์",
    "อาจารย์ ดร.",
    "ดร.",
    "อาจารย์",
    "นาย",
    "นาง",
    "นางสาว",
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: Partial<User> & { newPassword?: string; profilePicture?: string }) => void;
    initialData?: User | null;
}

const UserFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        role: "STUDENT",
        titles: "",
        firstname: "",
        lastname: "",
        email: "",
        tel_number: "",
        expertiseAreas: "",
    });

    const [expertiseTags, setExpertiseTags] = useState<string[]>([]);
    const [expertiseInput, setExpertiseInput] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [nameError, setNameError] = useState("");

    useEffect(() => {
        if (initialData) {
            setForm({
                role: initialData.role || "STUDENT",
                titles: initialData.titles || "",
                firstname: initialData.firstname || "",
                lastname: initialData.lastname || "",
                email: initialData.email || "",
                tel_number: initialData.tel_number || "",
                expertiseAreas: initialData.expertiseAreas || "",
            });

            // Parse expertise areas into tags
            const areas = initialData.expertiseAreas || "";
            if (areas.trim()) {
                setExpertiseTags(areas.split(",").map((s: string) => s.trim()).filter(Boolean));
            } else {
                setExpertiseTags([]);
            }

            // Show existing profile picture
            if (initialData.avatar) {
                setPreviewUrl(getImageSrc(initialData.avatar));
            } else {
                setPreviewUrl(null);
            }
        } else {
            setForm({ role: "STUDENT", titles: "", firstname: "", lastname: "", email: "", tel_number: "", expertiseAreas: "" });
            setExpertiseTags([]);
            setPreviewUrl(null);
        }
        setUploadedFileUrl(null);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setNameError("");
        setExpertiseInput("");
    }, [initialData, isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2 MB");
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            const token = getToken();
            const res = await fetch(`${API_URL}/uploads/profile`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formDataUpload,
            });
            if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
            const data = await res.json();
            setUploadedFileUrl(data.fileUrl);
        } catch {
            alert("อัปโหลดรูปไม่สำเร็จ");
            setPreviewUrl(null);
            setUploadedFileUrl(null);
        }
    };

    const addExpertiseTag = () => {
        const tag = expertiseInput.trim();
        if (tag && !expertiseTags.includes(tag)) {
            setExpertiseTags([...expertiseTags, tag]);
            setExpertiseInput("");
        }
    };

    const removeExpertiseTag = (tag: string) => {
        setExpertiseTags(expertiseTags.filter((t) => t !== tag));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setNameError("");

        if (!form.firstname.trim() || !form.lastname.trim()) {
            setNameError("กรุณากรอกชื่อและนามสกุล");
            return;
        }

        if (newPassword || confirmPassword) {
            if (newPassword.length < 8) {
                setPasswordError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
                return;
            }
            if (!/\d/.test(newPassword)) {
                setPasswordError("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
                return;
            }
            if (newPassword !== confirmPassword) {
                setPasswordError("รหัสผ่านไม่ตรงกัน");
                return;
            }
        }

        const expertiseStr = expertiseTags.join(", ");

        onSubmit({
            role: form.role,
            titles: form.titles,
            firstname: form.firstname.trim(),
            lastname: form.lastname.trim(),
            name: `${form.firstname.trim()} ${form.lastname.trim()}`,
            email: form.email,
            tel_number: form.tel_number,
            expertiseAreas: form.role === "ADVISOR" ? expertiseStr : undefined,
            ...(uploadedFileUrl !== null ? { profilePicture: uploadedFileUrl } : {}),
            ...(newPassword ? { newPassword } : {}),
        } as any);
    };

    if (!isOpen) return null;

    const inputClass = "w-full rounded-xl border border-transparent bg-slate-50 p-3 text-sm dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl dark:bg-[#1c1c1e] dark:border dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
                    {/* 1. Role — at the very top */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            ระดับสิทธิ์ (Role)
                        </label>
                        <select
                            className={`${inputClass} cursor-pointer`}
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="ADVISOR">Advisor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* 2. Profile Picture */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            รูปโปรไฟล์
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                    (form.firstname || "?").charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    <Camera size={16} />
                                    เปลี่ยนรูป
                                </button>
                                <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, WebP (สูงสุด 2MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Title + Firstname */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">คำนำหน้า</label>
                            <div className="relative">
                                <select
                                    className={`${inputClass} appearance-none cursor-pointer pr-8`}
                                    value={form.titles}
                                    onChange={(e) => setForm({ ...form, titles: e.target.value })}
                                >
                                    <option value="">เลือก</option>
                                    {ALL_TITLES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="col-span-7 space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ชื่อจริง</label>
                            <input
                                type="text"
                                required
                                placeholder="ชื่อจริง"
                                className={`${inputClass} ${nameError ? "!border-red-400" : ""}`}
                                value={form.firstname}
                                onChange={(e) => {
                                    setForm({ ...form, firstname: e.target.value });
                                    if (e.target.value.trim()) setNameError("");
                                }}
                            />
                        </div>
                    </div>

                    {/* 4. Lastname */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">นามสกุล</label>
                        <input
                            type="text"
                            required
                            placeholder="นามสกุล"
                            className={`${inputClass} ${nameError ? "!border-red-400" : ""}`}
                            value={form.lastname}
                            onChange={(e) => {
                                setForm({ ...form, lastname: e.target.value });
                                if (e.target.value.trim()) setNameError("");
                            }}
                        />
                        {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                    </div>

                    {/* 5. Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">อีเมล</label>
                        <input
                            type="email"
                            required
                            placeholder="example@univ.ac.th"
                            className={inputClass}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    {/* 6. Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            เบอร์โทรศัพท์ <span className="text-xs font-normal text-slate-400">(ไม่บังคับ)</span>
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            inputMode="numeric"
                            placeholder="08XXXXXXXX"
                            className={inputClass}
                            value={form.tel_number}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                setForm({ ...form, tel_number: digits });
                            }}
                        />
                    </div>

                    {/* 7. Expertise Areas — only for ADVISOR */}
                    {form.role === "ADVISOR" && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-gray-700">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                ความเชี่ยวชาญ
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="เช่น AI, Machine Learning"
                                    className={`${inputClass} flex-1`}
                                    value={expertiseInput}
                                    onChange={(e) => setExpertiseInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addExpertiseTag();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={addExpertiseTag}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shrink-0"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            {expertiseTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {expertiseTags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg ring-1 ring-blue-200 dark:ring-blue-700"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeExpertiseTag(tag)}
                                                className="hover:text-red-500 transition-colors ml-1"
                                            >
                                                <XIcon size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 8. Password Change — only when editing */}
                    {initialData && (
                        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-gray-700">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                เปลี่ยนรหัสผ่าน <span className="text-xs font-normal text-slate-400">(ไม่บังคับ)</span>
                            </p>
                            <input
                                type="password"
                                placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว + ตัวเลข 1 ตัว)"
                                className={inputClass}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="ยืนยันรหัสผ่านใหม่"
                                className={inputClass}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {passwordError && (
                                <p className="text-xs text-rose-500 font-medium">{passwordError}</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                            บันทึกข้อมูล
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
