"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, Users, CheckCheck, FileText, MessageSquare,
  Award, FolderCheck, FolderX, Send, CheckCircle, XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  event_type: string;
  Team?: {
    team_id: number;
    name: string;
    Section?: { section_code: string };
  };
  Task?: {
    task_id: number;
    title: string;
  };
  Project?: {
    project_id: number;
    projectname: string;
  };
  Users_Notification_actor_user_idToUsers?: {
    users_id: string;
    firstname: string;
    lastname: string;
  };
}

const POLL_INTERVAL = 30000;

// === Event type → Icon ===
const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "TEAM_INVITE":
    case "TEAM_MEMBER_JOINED":
      return <Users size={16} className="text-blue-400" />;
    case "TASK_ASSIGNED":
    case "TASK_UPDATED":
      return <FileText size={16} className="text-purple-400" />;
    case "COMMENT_ADDED":
      return <MessageSquare size={16} className="text-green-400" />;
    case "SUBMISSION_SUBMITTED":
      return <Send size={16} className="text-orange-400" />;
    case "SUBMISSION_APPROVED":
      return <CheckCircle size={16} className="text-emerald-400" />;
    case "SUBMISSION_REJECTED":
      return <XCircle size={16} className="text-red-400" />;
    case "GRADE_GIVEN":
      return <Award size={16} className="text-yellow-400" />;
    case "PROJECT_APPROVED":
      return <FolderCheck size={16} className="text-emerald-400" />;
    case "PROJECT_REJECTED":
      return <FolderX size={16} className="text-red-400" />;
    default:
      return <Bell size={16} className="text-gray-400" />;
  }
};

const getIconBg = (eventType: string) => {
  switch (eventType) {
    case "TEAM_INVITE":
    case "TEAM_MEMBER_JOINED":
      return "bg-blue-500/20";
    case "TASK_ASSIGNED":
    case "TASK_UPDATED":
      return "bg-purple-500/20";
    case "COMMENT_ADDED":
      return "bg-green-500/20";
    case "SUBMISSION_SUBMITTED":
      return "bg-orange-500/20";
    case "SUBMISSION_APPROVED":
    case "PROJECT_APPROVED":
      return "bg-emerald-500/20";
    case "SUBMISSION_REJECTED":
    case "PROJECT_REJECTED":
      return "bg-red-500/20";
    case "GRADE_GIVEN":
      return "bg-yellow-500/20";
    default:
      return "bg-gray-200 dark:bg-gray-700";
  }
};

const NotificationDropdown = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ดึงข้อมูล notifications จาก API ใหม่
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<NotificationItem[]>("/notifications");
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(
    async (notificationId: number) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      try {
        await api.patch(`/notifications/${notificationId}/read`, {});
      } catch (error) {
        console.error("Failed to mark as read:", error);
        await fetchNotifications();
      }
    },
    [fetchNotifications],
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.patch("/notifications/read-all", {});
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
    markAsRead(notification.notification_id);

    const role = user?.role || "STUDENT";

    // navigate ตาม event_type + role
    switch (notification.event_type) {
      case "TEAM_INVITE":
      case "TEAM_MEMBER_JOINED":
        if (role === "ADMIN") router.push("/admin-teams");
        else if (role === "ADVISOR") router.push("/advisorteams");
        else router.push("/Teams");
        break;

      case "TASK_ASSIGNED":
      case "TASK_UPDATED":
      case "COMMENT_ADDED": {
        const taskParam = notification.Task?.task_id ? `?task_id=${notification.Task.task_id}` : "";
        if (role === "ADMIN") router.push(`/admin-tasks${taskParam}`);
        else if (role === "ADVISOR") router.push(`/advisor-tasks${taskParam}`);
        else router.push(`/tasks${taskParam}`);
        break;
      }

      case "SUBMISSION_SUBMITTED":
      case "SUBMISSION_APPROVED":
      case "SUBMISSION_REJECTED":
        if (role === "ADMIN") router.push("/admin-events");
        else if (role === "ADVISOR") router.push("/advisor-events");
        else router.push("/events");
        break;

      case "GRADE_GIVEN":
        if (role === "ADMIN") router.push("/admin-grades");
        else router.push("/dashboard");
        break;

      case "PROJECT_APPROVED":
      case "PROJECT_REJECTED":
        if (role === "ADMIN") router.push("/admin-projects");
        else router.push("/dashboard");
        break;

      default:
        router.push("/dashboard");
    }

    setIsNotiOpen(false);
  };

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

  // ดึงชื่อ actor
  const getActorName = (item: NotificationItem) => {
    const actor = item.Users_Notification_actor_user_idToUsers;
    if (actor) return `${actor.firstname} ${actor.lastname}`;
    return null;
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
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount} รายการใหม่
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1"
                    title="อ่านทั้งหมด"
                  >
                    <CheckCheck size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                กำลังโหลด...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notification_id}
                  onClick={() => handleNotificationClick(item)}
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer ${!item.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full ${getIconBg(item.event_type)} flex items-center justify-center`}>
                        {getEventIcon(item.event_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!item.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                      {getActorName(item) && (
                        <p className="text-xs text-gray-400 mt-1">
                          จาก: {getActorName(item)}
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