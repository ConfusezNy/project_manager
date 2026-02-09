"use client";

// NotificationPanel - Shows recent notifications and alerts
import React from "react";
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface Notification {
  id: number;
  type: "feedback" | "announcement" | "approval" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

const typeConfig = {
  feedback: {
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  announcement: {
    icon: Bell,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  approval: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  info: {
    icon: Info,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-800",
  },
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onNotificationClick,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <div className="text-center">
          <Bell
            size={32}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ไม่มีการแจ้งเตือน
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
        🔔 การแจ้งเตือน
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notifications.map((notification) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;

          return (
            <button
              key={notification.id}
              onClick={() => onNotificationClick?.(notification)}
              className={`
                w-full text-left p-2.5 rounded-lg transition-colors
                ${config.bg}
                ${notification.read ? "opacity-60" : ""}
                hover:opacity-100
              `}
            >
              <div className="flex gap-2.5">
                <div className={`mt-0.5 ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPanel;
