"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";

interface TeamMember {
  users_id: string;
  firstname: string;
  lastname: string;
}

interface TeamWithMembers {
  team_id: number;
  name: string;
  groupNumber: string;
  project?: {
    project_id: number;
    projectname: string;
  };
  members: TeamMember[];
}

interface SectionOption {
  section_id: number;
  section_code: string;
  course_type: string;
  term_id: number;
  Term?: {
    semester: number;
    academicYear: number;
  };
}

export type GradeScore =
  | "A"
  | "B_PLUS"
  | "B"
  | "C_PLUS"
  | "C"
  | "D_PLUS"
  | "D"
  | "F";

export const GRADE_OPTIONS: { value: GradeScore; label: string }[] = [
  { value: "A", label: "A" },
  { value: "B_PLUS", label: "B+" },
  { value: "B", label: "B" },
  { value: "C_PLUS", label: "C+" },
  { value: "C", label: "C" },
  { value: "D_PLUS", label: "D+" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
];

export type GradeFilter = "ALL" | "GRADED" | "NOT_GRADED";

export function useGrading() {
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionOption | null>(
    null,
  );
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, GradeScore>>({});
  const [existingGrades, setExistingGrades] = useState<
    Record<string, { grade_id: number; score: GradeScore }>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("ALL");

  // ดึง Sections (filter เฉพาะเทอมล่าสุด)
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await api.get<SectionOption[]>("/api/sections");
        if (data && data.length > 0) {
          // หา term_id ล่าสุด (ค่ามากที่สุด)
          const latestTermId = Math.max(...data.map((s) => s.term_id));
          // filter เฉพาะ section ของเทอมล่าสุด
          const filtered = data.filter((s) => s.term_id === latestTermId);
          setSections(filtered);
          if (filtered.length > 0) {
            setSelectedSection(filtered[0]);
          }
        }
      } catch (err) {
        setError("โหลด Section ล้มเหลว");
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  // ดึง Teams + Grades เมื่อเลือก Section
  const fetchTeamsAndGrades = useCallback(async () => {
    if (!selectedSection) return;
    setLoading(true);
    setError(null);

    try {
      // API คืนค่า { section_id, teams: [...] }
      const response = await api.get<any>(
        `/api/sections/${selectedSection.section_id}/teams`,
      );

      const teamsData = response?.teams || response;

      if (!teamsData || !Array.isArray(teamsData) || teamsData.length === 0) {
        setTeams([]);
        setGradeMap({});
        setExistingGrades({});
        setLoading(false);
        return;
      }

      const formattedTeams: TeamWithMembers[] = teamsData.map((t: any) => ({
        team_id: t.team_id,
        name: t.name,
        groupNumber: t.groupNumber,
        project:
          t.project || t.Project
            ? {
                project_id: (t.project || t.Project).project_id,
                projectname: (t.project || t.Project).projectname,
              }
            : undefined,
        members: (t.members || t.Teammember || []).map((m: any) => ({
          users_id: m.users_id || m.user_id,
          firstname: m.firstname || m.Users?.firstname || "",
          lastname: m.lastname || m.Users?.lastname || "",
        })),
      }));

      setTeams(formattedTeams);

      // ดึงเกรดที่มีอยู่แล้ว
      const gradesData = await api.get<any[]>(
        `/api/grades?section_id=${selectedSection.section_id}`,
      );

      const existingMap: Record<
        string,
        { grade_id: number; score: GradeScore }
      > = {};
      const currentGrades: Record<string, GradeScore> = {};

      if (gradesData && Array.isArray(gradesData)) {
        for (const g of gradesData) {
          const key = g.student_id;
          existingMap[key] = { grade_id: g.grade_id, score: g.score };
          currentGrades[key] = g.score;
        }
      }

      setExistingGrades(existingMap);
      setGradeMap(currentGrades);
    } catch (err) {
      console.error("Fetch teams/grades error:", err);
      setError("โหลดข้อมูลทีมล้มเหลว");
    } finally {
      setLoading(false);
    }
  }, [selectedSection]);

  useEffect(() => {
    fetchTeamsAndGrades();
  }, [fetchTeamsAndGrades]);

  // Filter + Search teams
  const filteredTeams = useMemo(() => {
    return teams
      .map((team) => {
        let members = team.members;

        // Search by name or student id
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          members = members.filter(
            (m) =>
              m.users_id.toLowerCase().includes(q) ||
              m.firstname.toLowerCase().includes(q) ||
              m.lastname.toLowerCase().includes(q) ||
              `${m.firstname} ${m.lastname}`.toLowerCase().includes(q),
          );
        }

        // Filter by grade status
        if (gradeFilter === "GRADED") {
          members = members.filter((m) => gradeMap[m.users_id]);
        } else if (gradeFilter === "NOT_GRADED") {
          members = members.filter((m) => !gradeMap[m.users_id]);
        }

        return { ...team, members };
      })
      .filter((team) => {
        // ถ้า search อยู่ → ซ่อนทีมที่ไม่มี member ตรง
        if (searchQuery.trim() || gradeFilter !== "ALL") {
          return team.members.length > 0;
        }
        return true;
      });
  }, [teams, searchQuery, gradeFilter, gradeMap]);

  // เลือกเกรดให้นักศึกษา
  const setGrade = (studentId: string, score: GradeScore) => {
    setSuccessMessage(null);
    setGradeMap((prev) => {
      // ถ้ากดเกรดเดิมซ้ำ → ยกเลิก
      if (prev[studentId] === score) {
        const next = { ...prev };
        delete next[studentId];
        return next;
      }
      return { ...prev, [studentId]: score };
    });
  };

  // รีเซ็ตเกรดทั้งหมด
  const resetGrades = () => {
    const restored: Record<string, GradeScore> = {};
    for (const [key, val] of Object.entries(existingGrades)) {
      restored[key] = val.score;
    }
    setGradeMap(restored);
    setSuccessMessage(null);
  };

  // บันทึกเกรดทั้งหมด
  const saveGrades = async () => {
    if (!selectedSection) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const gradesToSave: {
        student_id: string;
        project_id: number;
        score: GradeScore;
      }[] = [];

      // ใช้ teams (ไม่ใช่ filteredTeams) เพื่อ save ทุกคน
      for (const team of teams) {
        if (!team.project) continue;
        for (const member of team.members) {
          const score = gradeMap[member.users_id];
          if (score) {
            gradesToSave.push({
              student_id: member.users_id,
              project_id: team.project.project_id,
              score,
            });
          }
        }
      }

      if (gradesToSave.length === 0) {
        setError("ยังไม่ได้เลือกเกรดให้นักศึกษาคนใดเลย");
        setSaving(false);
        return;
      }

      const result = await api.post<{ message: string; count: number }>(
        "/api/grades",
        {
          section_id: selectedSection.section_id,
          grades: gradesToSave,
        },
      );

      if (result) {
        setSuccessMessage(result.message);
        await fetchTeamsAndGrades();
      }
    } catch (err) {
      console.error("Save grades error:", err);
      setError("บันทึกเกรดล้มเหลว");
    } finally {
      setSaving(false);
    }
  };

  // นับจำนวน
  const totalStudents = teams.reduce((sum, t) => sum + t.members.length, 0);
  const gradedCount = Object.keys(gradeMap).length;

  // Bug #3 fix: เปรียบเทียบ key-by-key แทน JSON.stringify
  const hasChanges = useMemo(() => {
    const existingKeys = Object.keys(existingGrades);
    const gradeKeys = Object.keys(gradeMap);

    // จำนวน key ต่างกัน
    if (existingKeys.length !== gradeKeys.length) return true;

    // เช็คทุก key
    for (const key of gradeKeys) {
      if (!existingGrades[key] || existingGrades[key].score !== gradeMap[key]) {
        return true;
      }
    }

    // เช็คว่า existing มี key ที่ gradeMap ไม่มีไหม
    for (const key of existingKeys) {
      if (!gradeMap[key]) return true;
    }

    return false;
  }, [existingGrades, gradeMap]);

  return {
    sections,
    selectedSection,
    setSelectedSection,
    teams: filteredTeams,
    allTeams: teams,
    gradeMap,
    loading,
    saving,
    error,
    successMessage,
    totalStudents,
    gradedCount,
    hasChanges,
    searchQuery,
    setSearchQuery,
    gradeFilter,
    setGradeFilter,
    setGrade,
    resetGrades,
    saveGrades,
  };
}
