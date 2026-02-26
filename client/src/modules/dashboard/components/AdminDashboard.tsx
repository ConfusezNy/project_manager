"use client";

import React from "react";
import {
    Loader2,
    Users,
    FolderKanban,
    Calendar,
    FileCheck,
    Clock,
    CheckCircle,
    AlertCircle,
    UserPlus,
    Send,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { useAdminDashboard } from "@/modules/dashboard/hooks/useAdminDashboard";

// Stat Card Component
const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: any;
    label: string;
    value: number | string;
    color: string;
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
            >
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
        </div>
    </div>
);

// Progress Donut Chart
const ProgressDonut = ({
    approved,
    pending,
    total,
}: {
    approved: number;
    pending: number;
    total: number;
}) => {
    const remaining = total - approved - pending;
    const data = [
        { name: "อนุมัติแล้ว", value: approved, color: "#22c55e" },
        { name: "รอตรวจ", value: pending, color: "#3b82f6" },
        {
            name: "ยังไม่ส่ง",
            value: remaining > 0 ? remaining : 0,
            color: "#e5e7eb",
        },
    ].filter((d) => d.value > 0);

    const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                ยังไม่มีข้อมูล
            </div>
        );
    }

    return (
        <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, name: string) => [`${value} งาน`, name]}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {progress}%
                </span>
                <span className="text-xs text-gray-500">เสร็จสิ้น</span>
            </div>
        </div>
    );
};

// Section Progress Bar Chart
const SectionProgressChart = ({
    data,
}: {
    data: Array<{
        section_code: string;
        approvedCount: number;
        totalSubmissions: number;
    }>;
}) => {
    const chartData = data.map((d) => ({
        name: d.section_code,
        progress:
            d.totalSubmissions > 0
                ? Math.round((d.approvedCount / d.totalSubmissions) * 100)
                : 0,
    }));

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                ยังไม่มี Section
            </div>
        );
    }

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Progress"]} />
                    <Bar dataKey="progress" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Activity Icon
const getActivityIcon = (type: string) => {
    switch (type) {
        case "submission":
            return <Send className="w-4 h-4 text-blue-500" />;
        case "approval":
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case "team_created":
            return <FolderKanban className="w-4 h-4 text-purple-500" />;
        case "user_signup":
            return <UserPlus className="w-4 h-4 text-orange-500" />;
        default:
            return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
};

export const AdminDashboard: React.FC = () => {
    const { user, status: authStatus } = useAuth();
    const {
        loading,
        error,
        stats,
        sectionProgress,
        upcomingDeadlines,
        recentActivities,
        overallProgress,
    } = useAdminDashboard();

    if (authStatus === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    แดชบอร์ดผู้ดูแลระบบ
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    ยินดีต้อนรับ, {user?.firstname || "Admin"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={FolderKanban}
                    label="Section"
                    value={stats.sectionsCount}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={Users}
                    label="ทีมทั้งหมด"
                    value={stats.teamsCount}
                    color="bg-green-500"
                />
                <StatCard
                    icon={Users}
                    label="ผู้ใช้ทั้งหมด"
                    value={stats.usersCount}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={Calendar}
                    label="กำหนดการ"
                    value={stats.eventsCount}
                    color="bg-orange-500"
                />
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Overall Progress Donut */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        ความคืบหน้าภาพรวม
                    </h3>
                    <ProgressDonut
                        approved={stats.approvedSubmissions}
                        pending={stats.pendingSubmissions}
                        total={stats.totalSubmissions}
                    />
                    <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                อนุมัติ ({stats.approvedSubmissions})
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                รอตรวจ ({stats.pendingSubmissions})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Progress ตาม Section
                    </h3>
                    <SectionProgressChart data={sectionProgress} />
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        กำหนดการที่ใกล้ถึง
                    </h3>
                    {upcomingDeadlines.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            ไม่มีกำหนดการใน 14 วันนี้
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingDeadlines.map((deadline) => (
                                <div
                                    key={deadline.event_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {deadline.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {deadline.section_code}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${deadline.daysLeft <= 3
                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            : deadline.daysLeft <= 7
                                                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            }`}
                                    >
                                        {deadline.daysLeft === 0
                                            ? "วันนี้"
                                            : `อีก ${deadline.daysLeft} วัน`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    กิจกรรมล่าสุด
                </h3>
                <div className="space-y-3">
                    {recentActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
