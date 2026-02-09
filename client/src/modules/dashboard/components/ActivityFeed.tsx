"use client";

// ActivityFeed - Shows recent team activities
import React from "react";
import {
  CheckCircle,
  MessageSquare,
  FileEdit,
  Plus,
  AlertTriangle,
  UserPlus,
  Clock,
} from "lucide-react";

export interface Activity {
  id: number;
  type:
    | "submission"
    | "approval"
    | "comment"
    | "task_create"
    | "task_update"
    | "revision"
    | "member";
  user: string;
  userAvatar?: string;
  action: string;
  target: string;
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const typeConfig = {
  submission: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  approval: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  comment: {
    icon: MessageSquare,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  task_create: {
    icon: Plus,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  task_update: {
    icon: FileEdit,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  revision: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  member: {
    icon: UserPlus,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 6,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <div className="text-center">
          <Clock
            size={32}
            className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ยังไม่มีกิจกรรม
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        📈 กิจกรรมล่าสุด
      </h3>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {displayActivities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          const isLast = index === displayActivities.length - 1;

          return (
            <div key={activity.id} className="relative flex gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-100 dark:bg-gray-700" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
              >
                <Icon size={14} className={config.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    "{activity.target}"
                  </span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > maxItems && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ดูทั้งหมด ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
