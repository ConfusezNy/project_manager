"use client";

import React from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface SimilarProject {
    project_id: number;
    projectname: string;
    projectnameEng?: string;
    project_type?: string;
    score: number;
    matchedKeywords: string[];
}

interface SimilarityWarningProps {
    similar: SimilarProject[];
    loading?: boolean;
}

export const SimilarityWarning: React.FC<SimilarityWarningProps> = ({
    similar,
    loading,
}) => {
    if (loading) {
        return (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                กำลังตรวจสอบโครงงานที่คล้ายกัน...
            </div>
        );
    }

    if (similar.length === 0) return null;

    const hasHighSimilarity = similar.some((s) => s.score >= 70);

    return (
        <div
            className={`p-4 rounded-lg border ${hasHighSimilarity
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                    size={18}
                    className={
                        hasHighSimilarity
                            ? "text-red-500"
                            : "text-amber-500"
                    }
                />
                <span
                    className={`text-sm font-semibold ${hasHighSimilarity
                        ? "text-red-700 dark:text-red-400"
                        : "text-amber-700 dark:text-amber-400"
                        }`}
                >
                    {hasHighSimilarity
                        ? "พบโครงงานที่คล้ายมาก!"
                        : `พบโครงงานที่คล้ายกัน ${similar.length} รายการ`}
                </span>
            </div>

            {/* Project List */}
            <div className="space-y-2">
                {similar.map((project) => (
                    <div
                        key={project.project_id}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {project.projectname}
                            </p>
                            {project.projectnameEng && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {project.projectnameEng}
                                </p>
                            )}
                            {project.matchedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {project.matchedKeywords.slice(0, 5).map((kw) => (
                                        <span
                                            key={kw}
                                            className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Score Badge */}
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${project.score >= 70
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : project.score >= 50
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                {project.score}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {hasHighSimilarity
                    ? "กรุณาตรวจสอบว่าหัวข้อของคุณไม่ซ้ำกับโครงงานที่มีอยู่ หรือปรับชื่อให้แตกต่างมากขึ้น"
                    : "สามารถดำเนินการต่อได้ แต่ควรตรวจสอบว่าหัวข้อไม่ซ้ำ"}
            </p>
        </div>
    );
};

export default SimilarityWarning;
