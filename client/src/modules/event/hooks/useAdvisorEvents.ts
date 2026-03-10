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

export interface SectionGroup {
    section: SectionInfo;
    submissions: SubmissionWithEvent[];
    isCurrent: boolean;
    groupNumber: string;
    projectname: string;
}

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

// Group submissions by SECTION
// projectId (optional): ถ้าส่งมา → แสดงเฉพาะนักศึกษากลุ่มนั้น (มาจาก ?project= query param)
export function useAdvisorEvents(projectId?: number) {
    const { status } = useAuth();
    const [projectGroups, setProjectGroups] = useState<AdvisorProjectGroup[]>([]);
    const [sectionGroups, setSectionGroups] = useState<SectionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. ดึงโปรเจกต์ที่อาจารย์ดูแลทั้งหมด (รวมวิชาเก่า)
            const projects = await api.get<any[]>("/advisors/all-projects");

            if (!projects || projects.length === 0) {
                setError("ยังไม่มีโครงงานที่ดูแล");
                setLoading(false);
                return;
            }

            // 2. Filter เฉพาะทีมนักศึกษาที่ต้องการ
            let targetProjects = projects;
            let currentSecId: number | null = null;

            if (projectId) {
                const currentProject = projects.find((p: any) => p.project_id === projectId);
                if (!currentProject) {
                    setError(`ไม่พบโครงงาน #${projectId}`);
                    setLoading(false);
                    return;
                }

                currentSecId = currentProject.team?.section?.section_id ?? currentProject.team?.section_id ?? null;

                const currentMembers = (currentProject.team?.members || [])
                    .map((m: any) => m.user?.users_id || m.users_id)
                    .sort()
                    .join(',');

                targetProjects = projects.filter((p: any) => {
                    const projectMembers = (p.team?.members || [])
                        .map((m: any) => m.user?.users_id || m.users_id)
                        .sort()
                        .join(',');

                    if (!projectMembers || !currentMembers) {
                        return p.project_id === projectId;
                    }

                    return projectMembers === currentMembers;
                });
            }

            if (targetProjects.length === 0) {
                setError(projectId ? `ไม่พบโครงงาน #${projectId}` : "ยังไม่มีโครงงานที่ดูแล");
                setLoading(false);
                return;
            }

            // 3. ดึง submissions ของแต่ละ project (รวมเข้าไปใน list เดียว)
            let allSubmissions: SubmissionWithEvent[] = [];
            const groups: AdvisorProjectGroup[] = [];

            await Promise.all(
                targetProjects.map(async (project: any) => {
                    try {
                        const sectionId: number | undefined =
                            project.team?.section?.section_id ?? project.team?.section_id;
                        const sectionParam = sectionId ? `&section_ids=${sectionId}` : "";

                        const subs = await api.get<SubmissionWithEvent[]>(
                            `/submissions?team_id=${project.team.team_id}${sectionParam}`
                        );

                        const submissionList = subs || [];
                        const mappedList = submissionList.map(s => ({
                            ...s,
                            projectName: project.projectname,
                            groupNumber: project.team.groupNumber
                        }));

                        allSubmissions = [...allSubmissions, ...mappedList];

                        // คำนวณ progress สำหรับหน้าที่มี progress รวม
                        const docSubs = submissionList.filter((s) => s.Event?.requireFile === true);
                        const approved = docSubs.filter((s) => s.status === "APPROVED").length;
                        const total = docSubs.length;

                        groups.push({
                            project_id: project.project_id,
                            projectname: project.projectname,
                            team_id: project.team.team_id,
                            groupNumber: project.team.groupNumber,
                            section: project.team.section as SectionInfo,
                            submissions: mappedList,
                            approvedCount: approved,
                            total,
                            progress: total > 0 ? Math.round((approved / total) * 100) : 0,
                        });
                    } catch {
                        // project ที่ยังไม่มี submissions ข้ามไป
                    }
                })
            );

            // 4. Group submissions by Section (เหมือนของ student)
            const secGroups: Record<number, SectionGroup> = {};
            for (const sub of allSubmissions) {
                const section = sub.Event?.Section;
                if (!section) continue;

                if (!secGroups[section.section_id]) {
                    secGroups[section.section_id] = {
                        section,
                        submissions: [],
                        isCurrent: section.section_id === currentSecId,
                        // @ts-ignore (เพิ่ม property เพื่อส่งไปใช้ใน header)
                        groupNumber: sub.groupNumber || "",
                        // @ts-ignore
                        projectname: sub.projectName || ""
                    };
                }

                secGroups[section.section_id].submissions.push(sub);
            }

            // Sort section groups
            const sortedSecGroups = Object.values(secGroups).sort((a, b) => {
                if (a.isCurrent && !b.isCurrent) return -1;
                if (!a.isCurrent && b.isCurrent) return 1;
                return a.section.section_code.localeCompare(b.section.section_code);
            });

            setSectionGroups(sortedSecGroups);
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

    // Summary stats (ใช้ projectGroups เพื่อรักษาความเข้ากันได้กับโค้ดเก่าเล็กน้อย)
    const totalApproved = projectGroups.reduce((sum, g) => sum + g.approvedCount, 0);
    const totalItems = projectGroups.reduce((sum, g) => sum + g.total, 0);
    const overallProgress = totalItems > 0 ? Math.round((totalApproved / totalItems) * 100) : 0;

    const pendingSubmission = projectGroups
        .flatMap((g) => g.submissions)
        .find((s) => s.status === "SUBMITTED" && s.Event?.requireFile === true);
    const pendingEvent = pendingSubmission?.Event;
    const pendingProject = pendingSubmission
        ? projectGroups.find((g) => g.team_id === pendingSubmission.team_id)
        : undefined;

    return {
        projectGroups,
        sectionGroups,
        loading,
        error,
        overallProgress,
        pendingEvent,
        pendingProject,
        refresh: fetchData,
    };
}
