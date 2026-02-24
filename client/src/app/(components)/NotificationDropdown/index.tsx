"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  event_type: string;
  team?: {
    team_id: number;
    name: string;
    section?: {
      section_code: string;
    };
  };
  actor?: {
    firstname: string;
    lastname: string;
  };
}

const NotificationDropdown = () => {
  const router = useRouter();
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ดึงข้อมูล notifications จาก API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<NotificationItem[]>('/teams/pending-invites');
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh ทุก 30 วินาที
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleNotificationClick = (notification: NotificationItem) => {
    // ถ้าเป็นคำเชิญเข้ากลุ่ม ไปหน้า Teams
    if (notification.event_type === 'TEAM_INVITE') {
      router.push('/Teams');
      setIsNotiOpen(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return 'เมื่อสักครู่';
    if (diffInMins < 60) return `${diffInMins} นาทีที่แล้ว`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'เมื่อวาน';
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;

    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
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
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} รายการใหม่
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                กำลังโหลด...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                ไม่มีการแจ้งเตือนใหม่
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notification_id}
                  onClick={() => handleNotificationClick(item)}
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {item.event_type === 'TEAM_INVITE' ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Users size={16} className="text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Bell size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!item.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      {item.actor && (
                        <p className="text-xs text-gray-400 mt-1">
                          จาก: {item.actor.firstname} {item.actor.lastname}
                        </p>
                      )}
                      {item.team?.section && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          รายวิชา: {item.team.section.section_code}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{formatTime(item.createdAt)}</p>
                    </div>
                    {!item.isRead && (
                      <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-blue-500"></span>
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