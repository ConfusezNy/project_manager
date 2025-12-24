"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  isRead: boolean;
}

const NotificationDropdown = () => {
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  // Mock Data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: "งานใหม่!", desc: "คุณได้รับมอบหมายในโปรเจกต์ A", time: "5 นาทีที่แล้ว", isRead: false },
    { id: 2, title: "เตือนความจำ", desc: "ส่งรายงานประจำสัปดาห์", time: "1 ชั่วโมงที่แล้ว", isRead: false },
    { id: 3, title: "ระบบ", desc: "อัปเดตระบบเสร็จสมบูรณ์", time: "เมื่อวาน", isRead: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={notiRef}>
      <button 
        className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsNotiOpen(!isNotiOpen)}
      >
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isNotiOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-[#1c1c1e] dark:border dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2c2c2e]">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <Check size={14} /> อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                ไม่มีการแจ้งเตือนใหม่
              </div>
            ) : (
              notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-6">
                      <p className={`text-sm font-medium ${!item.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {item.desc}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                    </div>
                    <button 
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    {!item.isRead && (
                      <span className="absolute top-4 right-10 h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;