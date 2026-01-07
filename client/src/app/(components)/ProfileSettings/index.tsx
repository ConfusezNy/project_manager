'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

export default function ProfileSettings() {
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ปรับชื่อให้ตรงกับ Schema
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    tel_number: "",
    profilePicture: "" as string | null,
  });

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setFormData({
        firstname: u.firstname || "",
        lastname: u.lastname || "",
        tel_number: u.tel_number || "", // ใช้ tel_number
        profilePicture: u.profilePicture || null, // ใช้ profilePicture
      });
    }
  }, [session]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // ย่อขนาดเหลือแค่ 100px พอครับ สำหรับรูปโปรไฟล์จิ๋ว
        const MAX_WIDTH = 100; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // บีบอัดคุณภาพเหลือ 0.5 (50%) เพื่อให้ไฟล์เล็กระดับไม่กี่ KB
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        setFormData({ ...formData, profilePicture: compressedBase64 });
      };
    };
    reader.readAsDataURL(file);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("บันทึกข้อมูลสำเร็จ!");
        await update(); // รีเฟรชข้อมูลใน Session
      } else {
        // แสดง Error จริงจาก Server
        alert(`เกิดข้อผิดพลาด: ${result.error || "ไม่ทราบสาเหตุ"}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (ตรวจสอบ Path API)");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return <div className="p-6">กำลังโหลด...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
      <h2 className="text-xl font-bold mb-6 dark:text-white">ข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/20 bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {formData.profilePicture ? <img src={formData.profilePicture} className="w-full h-full object-cover"/> : formData.firstname?.charAt(0)}
          </div>
          <div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm border rounded-xl dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">เปลี่ยนรูปโปรไฟล์</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">ชื่อจริง</label>
            <input type="text" value={formData.firstname} onChange={e => setFormData({...formData, firstname: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">นามสกุล</label>
            <input type="text" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold dark:text-gray-300">เบอร์โทรศัพท์ (สูงสุด 10 หลัก)</label>
            <input type="tel" maxLength={10} value={formData.tel_number} onChange={e => setFormData({...formData, tel_number: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50">
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </div>
  );
}