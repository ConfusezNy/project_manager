/**
 * NotificationContext
 * 📌 Share notification state ระหว่าง Navbar (Bell icon) + Sidebar (Badge)
 * ทุก role ใช้ context นี้ร่วมกัน — poll ทุก 30s
 */
"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationItem {
    notification_id: number;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    event_type: string;
    link?: string | null;  // ✅ เพิ่ม link field
    Team?: { team_id: number; name: string; Section?: { section_code: string } };
    Task?: { task_id: number; title: string };
    Project?: { project_id: number; projectname: string };
    Users_Notification_actor_user_idToUsers?: {
        users_id: string;
        firstname: string;
        lastname: string;
    };
}

interface NotificationContextValue {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    refetch: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    refetch: async () => { },
    markAsRead: async () => { },
    markAllAsRead: async () => { },
});

const POLL_INTERVAL = 30_000; // 30 seconds

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { status } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<NotificationItem[]>("/notifications");
            if (data) setNotifications(data);
        } catch {
            // silent — ไม่ crash app ถ้า fetch ไม่สำเร็จ
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll เมื่อ authenticated
    useEffect(() => {
        if (status !== "authenticated") return;
        refetch();
        const interval = setInterval(refetch, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [status, refetch]);

    const markAsRead = useCallback(
        async (id: number) => {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === id ? { ...n, isRead: true } : n,
                ),
            );
            try {
                await api.patch(`/notifications/${id}/read`, {});
            } catch {
                await refetch(); // rollback
            }
        },
        [refetch],
    );

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await api.patch("/notifications/read-all", {});
        } catch {
            await refetch(); // rollback
        }
    }, [refetch]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, loading, refetch, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotification() {
    return useContext(NotificationContext);
}
