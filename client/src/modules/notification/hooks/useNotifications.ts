"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { NotificationItem } from "../types/notification.types";

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<NotificationItem[]>("/teams/pending-invites");
            if (data) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(
        async (notificationId: number) => {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notification_id === notificationId ? { ...n, isRead: true } : n,
                ),
            );
            try {
                await api.patch(`/teams/notifications/${notificationId}/read`, {});
            } catch (error) {
                // Revert on failure
                console.error("Failed to mark as read:", error);
                await fetchNotifications();
            }
        },
        [fetchNotifications],
    );

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            await api.patch("/teams/notifications/read-all", {});
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            await fetchNotifications();
        }
    }, [fetchNotifications]);

    // Polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}
