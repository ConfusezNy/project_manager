"use client";

import React, { useState, useEffect, useRef } from "react";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getImageSrc } from "@/lib/image";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, status, logout } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ✅ ดึง profilePicture จาก /profile API โดยตรง ไม่ต้องพึ่ง JWT
  useEffect(() => {
    if (status !== "authenticated") return;
    api.get("/profile")
      .then((profile) => {
        if (profile?.profilePicture) {
          setAvatarUrl(getImageSrc(profile.profilePicture));
        }
      })
      .catch(() => {/* ถ้า fetch ไม่ได้ก็ใช้ initial แทน */ });
  }, [status]);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };


  // ดึงตัวอักษรแรกของชื่อกรณีไม่มีรูป
  const getInitial = () => {
    if (user?.firstname) {
      return user.firstname.charAt(0).toUpperCase();
    }
    return "A";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* --- 1. แก้ไขปุ่ม Profile Avatar (ปุ่มหลักบน Navbar) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-blue-600 font-bold text-white hover:bg-blue-700 transition-all overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          getInitial()
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-[#1c1c1e] dark:border dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
          {/* Header with User Info */}
          {status === "authenticated" && user && (
            <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2c2c2e]">
              <div className="flex items-center gap-3">
                {/* --- 2. แก้ไขรูปภาพในส่วน Header ของ Dropdown --- */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitial()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-1">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                router.push("/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors"
            >
              <Settings
                size={18}
                className="text-gray-500 dark:text-gray-400"
              />
              <span>ตั้งค่า</span>
            </button>

            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </div>

          {/* Loading State */}
          {status === "loading" && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                กำลังโหลด...
              </p>
            </div>
          )}

          {/* Not Authenticated State */}
          {status === "unauthenticated" && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
                กรุณาเข้าสู่ระบบ
              </p>
              <button
                onClick={() => router.push("/signin")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
