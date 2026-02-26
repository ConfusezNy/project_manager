import React from "react";
import { Plus, ChevronDown, GraduationCap, Users } from "lucide-react";
import Button from "@/shared/components/Button";

interface Props {
    activeTab: "timeline" | "documents";
    setActiveTab: (tab: "timeline" | "documents") => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    studentType: string;
    setStudentType: (type: string) => void;
    onAddClick: () => void;

    isAdmin: boolean;
    years?: string[];
}

const TimelineFilters: React.FC<Props> = ({
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    studentType,
    setStudentType,
    onAddClick,
    isAdmin,
    years = ["2568", "2567"],
}) => {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Timeline
                    </h1>
                    <span className="text-gray-400 dark:text-gray-600">|</span>
                    <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                        จัดการปีการศึกษา
                    </h2>
                </div>
                {activeTab === "timeline" && isAdmin && (
                    <Button variant="primary" icon={Plus} onClick={onAddClick}>
                        เพิ่มข้อมูล
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-0 mb-6 gap-4">
                <div className="flex gap-8 text-sm font-semibold">
                    <button
                        onClick={() => setActiveTab("timeline")}
                        className={`pb-4 border-b-2 transition-colors ${activeTab === "timeline" ? "text-blue-600 border-blue-600 dark:text-blue-400" : "text-gray-500 border-transparent"}`}
                    >
                        สัปดาห์ที่ (Timeline)
                    </button>
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={`pb-4 border-b-2 transition-colors ${activeTab === "documents" ? "text-blue-600 border-blue-600 dark:text-blue-400" : "text-gray-500 border-transparent"}`}
                    >
                        เอกสารทั้งหมด
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-2">
                    <div className="relative group">
                        <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2c2c2e]">
                            <GraduationCap size={16} className="text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                                ปีการศึกษา:
                            </span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none bg-transparent font-semibold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer pr-1"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                className="text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2c2c2e]">
                            <Users size={16} className="text-gray-500" />
                            <select
                                value={studentType}
                                onChange={(e) => setStudentType(e.target.value)}
                                className="appearance-none bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer pr-1"
                            >
                                <option value="เทียบโอน">เทียบโอน</option>
                                <option value="ปกติ">ภาคปกติ</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="text-gray-400 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TimelineFilters;
