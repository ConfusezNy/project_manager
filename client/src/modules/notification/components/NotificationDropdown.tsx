"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Users, CheckCheck, FileText, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationItem } from "../types/notification.types";

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);

  if (diffInMins < 1) return "เมื่อสักครู่";
  if (diffInMins < 60) return `${diffInMins} นาทีที่แล้ว`;

  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "เมื่อวาน";
  if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;

  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "TEAM_INVITE":
      return <Users size={16} className="text-blue-400" />;
    case "TASK_ASSIGNED":
    case "TASK_UPDATED":
      return <FileText size={16} className="text-purple-400" />;
    case "COMMENT_ADDED":
      return <MessageSquare size={16} className="text-green-400" />;
    default:
      return <Bell size={16} className="text-gray-400" />;
  }
};

const getIconBg = (eventType: string) => {
  switch (eventType) {
    case "TEAM_INVITE":
      return "bg-blue-500/20";
    case "TASK_ASSIGNED":
    case "TASK_UPDATED":
      return "bg-purple-500/20";
    case "COMMENT_ADDED":
      return "bg-green-500/20";
    default:
      return "bg-gray-200 dark:bg-gray-700";
  }
};

export const NotificationDropdown = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Close on click outside
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

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.notification_id);
    }

    // Smart routing based on event_type
    if (notification.link) {
      router.push(notification.link);
    } else if (notification.event_type === "TEAM_INVITE") {
      router.push("/Teams");
    } else if (
      notification.event_type === "TASK_ASSIGNED" ||
      notification.event_type === "TASK_UPDATED"
    ) {
      router.push("/tasks");
    } else if (notification.event_type === "COMMENT_ADDED") {
      router.push("/tasks");
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-[#1c1c1e] dark:border dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2c2c2e]">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              การแจ้งเตือน
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount} รายการใหม่
                  </span>
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    title="อ่านทั้งหมด"
                  >
                    <CheckCheck size={14} className="text-blue-500" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                <div className="inline-block w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin mb-2" />
                <p>กำลังโหลด...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                <Bell
                  size={32}
                  className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
                />
                <p>ไม่มีการแจ้งเตือนใหม่</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notification_id}
                  onClick={() => handleNotificationClick(item)}
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer ${!item.isRead
                      ? "bg-blue-50/50 dark:bg-blue-900/10"
                      : ""
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-8 h-8 rounded-full ${getIconBg(item.event_type)} flex items-center justify-center`}
                      >
                        {getEventIcon(item.event_type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${!item.isRead
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                          }`}
                      >
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
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!item.isRead && (
                      <span className="flex-shrink-0 h-2 w-2 mt-2 rounded-full bg-blue-500" />
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
