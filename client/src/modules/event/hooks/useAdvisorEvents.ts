"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
    type SectionInfo,
    type SubmissionWithEvent,
} from "@/modules/event/hooks/useStudentEvents";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdvisorProjectGroup {
    project_id: number;
    projectname: string;
    team_id: number;
    groupNumber: string;
    section: SectionInfo;
    submissions: SubmissionWithEvent[];
    approvedCount: number;
    total: number;
    progress: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Group submissions by PROJECT (ไม่ใช่ section)
// projectId (optional): ถ้าส่งมา → แสดงเฉพาะ project นั้น (มาจาก ?project= query param)
export function useAdvisorEvents(projectId?: number) {
    const { status } = useAuth();
    const [projectGroups, setProjectGroups] = useState<AdvisorProjectGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. ดึงโปรเจกต์ที่อาจารย์ดูแล
            const projects = await api.get<any[]>("/advisors/my-projects");

            if (!projects || projects.length === 0) {
                setError("ยังไม่มีโครงงานที่ดูแล");
                setLoading(false);
                return;
            }

            // 2. Filter เฉพาะ project ที่ต้องการ (ถ้ามี projectId)
            const targetProjects = projectId
                ? projects.filter((p: any) => p.project_id === projectId)
                : projects;

            if (targetProjects.length === 0) {
                setError(projectId ? `ไม่พบโครงงาน #${projectId}` : "ยังไม่มีโครงงานที่ดูแล");
                setLoading(false);
                return;
            }

            // 3. ดึง submissions ของแต่ละ project แยกกัน → group by project
            const groups: AdvisorProjectGroup[] = [];

            await Promise.all(
                targetProjects.map(async (project: any) => {
                    try {
                        const sectionId: number | undefined =
                            project.team?.section?.section_id ?? project.team?.section_id;
                        const sectionParam = sectionId ? `&section_ids=${sectionId}` : "";

                        const subs = await api.get<SubmissionWithEvent[]>(
                            `/submissions?team_id=${project.team.team_id}${sectionParam}`,
                        );

                        const submissionList = subs || [];
                        // คำนวณ progress เฉพาะเอกสาร/บทที่ (requireFile === true)
                        const docSubs = submissionList.filter((s) => s.Event?.requireFile === true);
                        const approved = docSubs.filter((s) => s.status === "APPROVED").length;
                        const total = docSubs.length;

                        groups.push({
                            project_id: project.project_id,
                            projectname: project.projectname,
                            team_id: project.team.team_id,
                            groupNumber: project.team.groupNumber,
                            section: project.team.section as SectionInfo,
                            submissions: submissionList,
                            approvedCount: approved,
                            total,
                            progress: total > 0 ? Math.round((approved / total) * 100) : 0,
                        });
                    } catch {
                        // project ที่ยังไม่มี submissions ข้ามไป
                    }
                }),
            );

            // sort: progress น้อยสุดขึ้นก่อน (งานที่ต้องติดตาม)
            groups.sort((a, b) => a.progress - b.progress);
            setProjectGroups(groups);
        } catch (err: unknown) {
            console.error("useAdvisorEvents error:", err);
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [status, fetchData]);

    // Summary stats across all projects (เฉพาะ requireFile เท่านั้น — คำนวณแล้วใน group)
    const totalApproved = projectGroups.reduce((sum, g) => sum + g.approvedCount, 0);
    const totalItems = projectGroups.reduce((sum, g) => sum + g.total, 0);
    const overallProgress = totalItems > 0 ? Math.round((totalApproved / totalItems) * 100) : 0;

    // หางานที่รอ review (SUBMITTED) เฉพาะ requireFile
    const pendingSubmission = projectGroups
        .flatMap((g) => g.submissions)
        .find((s) => s.status === "SUBMITTED" && s.Event?.requireFile === true);
    const pendingEvent = pendingSubmission?.Event;
    const pendingProject = pendingSubmission
        ? projectGroups.find((g) => g.team_id === pendingSubmission.team_id)
        : undefined;

    return {
        projectGroups,
        loading,
        error,
        overallProgress,
        pendingEvent,
        pendingProject,
        refresh: fetchData,
    };
}
