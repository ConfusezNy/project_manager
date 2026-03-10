/**
 * useAutoMarkRead
 * 
 * เมื่อผู้ใช้ navigate ไปหน้าใดก็ตาม hook นี้จะ mark notifications ที่เกี่ยวข้อง
 * กับหน้านั้นว่า isRead = true อัตโนมัติ
 * 
 * ใช้ path matching เพื่อรู้ว่าอยู่หน้าไหน แล้ว filter event_type ที่ตรงกัน
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNotification } from "@/lib/notification-context";
import type { NotificationItem } from "../types/notification.types";

// Map: path prefix → event_types ที่ควร mark as read เมื่อเข้าหน้านั้น
const PATH_EVENT_MAP: Record<string, string[]> = {
  "/Tasks": ["TASK_ASSIGNED", "TASK_UPDATED", "COMMENT_ADDED"],
  "/tasks": ["TASK_ASSIGNED", "TASK_UPDATED", "COMMENT_ADDED"],
  "/advisor-tasks": ["TASK_ASSIGNED", "TASK_UPDATED", "COMMENT_ADDED"],
  "/admin-tasks": ["TASK_ASSIGNED", "TASK_UPDATED", "COMMENT_ADDED"],

  "/events": ["EVENT_CREATED", "SUBMISSION_APPROVED", "SUBMISSION_REJECTED"],
  "/advisor-events": ["SUBMISSION_SUBMITTED", "SUBMISSION_APPROVED", "SUBMISSION_REJECTED"],
  "/admin-events": ["SUBMISSION_SUBMITTED", "SUBMISSION_APPROVED", "SUBMISSION_REJECTED", "EVENT_CREATED"],

  "/Teams": ["TEAM_MEMBER_JOINED"],
  // ⚠️ TEAM_INVITE ไม่ auto-mark เพราะ getPendingInvites filter isRead: false
  // invite จะ mark read ก็ต่อเมื่อ user กด "รับ" (join) หรือ "ปฏิเสธ" (reject) บน /Teams เท่านั้น
  "/advisorteams": ["TEAM_MEMBER_JOINED", "ADVISOR_REQUEST", "PROJECT_APPROVED", "PROJECT_REJECTED", "SUBMISSION_SUBMITTED", "SUBMISSION_APPROVED", "SUBMISSION_REJECTED"],
  "/admin-teams": ["TEAM_MEMBER_JOINED"],

  "/dashboard": ["GRADE_GIVEN", "PROJECT_APPROVED", "PROJECT_REJECTED"],
  "/advisor-dashboard": ["EVENT_CREATED"],
  "/admin-dashboard": ["PROJECT_APPROVED", "PROJECT_REJECTED"],

  "/admin-grades": ["GRADE_GIVEN"],
  "/admin-projects": ["PROJECT_APPROVED", "PROJECT_REJECTED"],
};

export function useAutoMarkRead() {
  const pathname = usePathname();
  const { notifications, markAsRead } = useNotification();

  useEffect(() => {
    if (!pathname) return;

    // หา event_types ที่ match กับ pathname ปัจจุบัน
    const matchedTypes = Object.entries(PATH_EVENT_MAP).find(([path]) =>
      pathname.startsWith(path)
    )?.[1];

    if (!matchedTypes || matchedTypes.length === 0) return;

    // Mark unread notifications ที่ match event_type เป็น read
    const toMark = notifications.filter(
      (n: NotificationItem) => !n.isRead && matchedTypes.includes(n.event_type)
    );

    if (toMark.length === 0) return;

    // Mark ทีละตัว (debounce ด้วย delay เล็กน้อย เพื่อให้ animate ก่อน)
    const timer = setTimeout(() => {
      toMark.forEach((n) => markAsRead(n.notification_id));
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, notifications, markAsRead]);
}
