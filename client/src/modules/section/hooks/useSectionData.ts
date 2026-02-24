"use client";

// useSectionData Hook - Manages all section page state and logic
import { useState, useEffect, useCallback } from "react";
import {
  sectionService,
  Section,
  Term,
  Candidate,
  Enrollment,
  CreateSectionForm,
  CreateTermForm,
  SectionTeam,
} from "../services/sectionService";

const initialCreateForm: CreateSectionForm = {
  section_code: "",
  course_type: "PROJECT",
  study_type: "LE",
  min_team_size: 1,
  max_team_size: 3,
  team_locked: false,
  term_id: "",
};

const initialTermForm: CreateTermForm = {
  academicYear: "",
  semester: "",
  startDate: "",
  endDate: "",
};

export function useSectionData() {
  // Data states
  const [sections, setSections] = useState<Section[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);

  // Current section context
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Continue to project states
  const [continueTermId, setContinueTermId] = useState<string>("");
  const [continuingSectionId, setContinuingSectionId] = useState<number | null>(
    null,
  );
  const [continuingSectionCode, setContinuingSectionCode] =
    useState<string>("");
  const [continueTeams, setContinueTeams] = useState<SectionTeam[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [continueLoading, setContinueLoading] = useState(false);

  // Forms
  const [createForm, setCreateForm] =
    useState<CreateSectionForm>(initialCreateForm);
  const [createError, setCreateError] = useState("");
  const [termForm, setTermForm] = useState<CreateTermForm>(initialTermForm);
  const [termError, setTermError] = useState("");

  // Fetch data
  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sectionService.getSections();
      setSections(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTerms = useCallback(async () => {
    const data = await sectionService.getTerms();
    setTerms(data);
  }, []);

  useEffect(() => {
    fetchSections();
    fetchTerms();
  }, [fetchSections, fetchTerms]);

  // Handlers
  const handleCreateSection = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError("");
      try {
        await sectionService.createSection(createForm);
        setShowCreateModal(false);
        setCreateForm(initialCreateForm);
        fetchSections();
      } catch (err: any) {
        setCreateError(err.message);
      }
    },
    [createForm, fetchSections],
  );

  const handleCreateTerm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setTermError("");
      try {
        await sectionService.createTerm(termForm);
        setShowTermModal(false);
        setTermForm(initialTermForm);
        fetchTerms();
      } catch (err: any) {
        setTermError(err.message);
      }
    },
    [termForm, fetchTerms],
  );

  const fetchEnrollments = useCallback(async (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setEnrollments([]);
    setShowEnrollmentsModal(true);
    const data = await sectionService.getEnrollments(sectionId);
    setEnrollments(data);
  }, []);

  const openEnrollModal = useCallback(async (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setCandidates([]);
    setSelectedCandidates([]);
    setShowEnrollModal(true);
    const data = await sectionService.getCandidates(sectionId);
    setCandidates(data);
  }, []);

  const handleEnroll = useCallback(async () => {
    if (!currentSectionId || selectedCandidates.length === 0) return;
    try {
      await sectionService.enrollStudents(currentSectionId, selectedCandidates);
      alert("Enroll สำเร็จ!");
      setShowEnrollModal(false);
      setSelectedCandidates([]);
    } catch (err: any) {
      alert(err.message);
    }
  }, [currentSectionId, selectedCandidates]);

  const toggleCandidate = useCallback((userId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }, []);

  const toggleAllCandidates = useCallback(() => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((c) => c.users_id));
    }
  }, [selectedCandidates, candidates]);

  // Continue to project handlers
  const openContinueModal = useCallback(
    async (sectionId: number) => {
      setContinuingSectionId(sectionId);
      setContinueTermId("");
      setContinueTeams([]);
      setSelectedTeamIds([]);
      setShowContinueModal(true);

      // Find section code
      const section = sections.find((s) => s.section_id === sectionId);
      setContinuingSectionCode(section?.section_code || "");

      // Fetch teams for this section
      try {
        const data = await sectionService.getTeamsBySection(sectionId);
        setContinueTeams(data.teams);

        // Auto-select teams that are NOT approved
        const nonApproved = data.teams
          .filter((t) => t.project?.status !== "APPROVED")
          .map((t) => t.team_id);
        setSelectedTeamIds(nonApproved);
      } catch (err: any) {
        console.error("Failed to fetch teams:", err);
        setContinueTeams([]);
      }
    },
    [sections],
  );

  const handleContinueToProject = useCallback(async () => {
    if (!continuingSectionId || !continueTermId) {
      alert("กรุณาเลือกเทอมใหม่");
      return;
    }
    if (selectedTeamIds.length === 0) {
      alert("กรุณาเลือกอย่างน้อย 1 ทีม");
      return;
    }

    setContinueLoading(true);
    try {
      const result = await sectionService.continueToProject(
        continuingSectionId,
        continueTermId,
        selectedTeamIds,
      );
      alert(
        `ต่อวิชาเรียบร้อย! ย้าย ${result.teams_moved || selectedTeamIds.length} ทีมไปเทอมใหม่แล้ว`,
      );
      setShowContinueModal(false);
      fetchSections();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setContinueLoading(false);
    }
  }, [continuingSectionId, continueTermId, selectedTeamIds, fetchSections]);

  // Delete section handler
  const handleDeleteSection = useCallback(
    async (sectionId: number) => {
      if (
        !confirm(
          "คุณแน่ใจหรือไม่ที่จะลบ Section นี้? การลบจะไม่สามารถกู้คืนได้",
        )
      ) {
        return;
      }

      try {
        await sectionService.deleteSection(sectionId);
        alert("ลบ Section เรียบร้อย");
        fetchSections();
      } catch (err: any) {
        alert(err.message || "เกิดข้อผิดพลาดในการลบ Section");
      }
    },
    [fetchSections],
  );

  // Toggle team lock handler
  const handleToggleLock = useCallback(
    async (sectionId: number, locked: boolean) => {
      await sectionService.toggleTeamLock(sectionId, locked);
    },
    [],
  );

  return {
    // Data
    sections,
    terms,
    loading,
    error,
    candidates,
    enrollments,
    selectedCandidates,
    currentSectionId,
    continueTermId,
    setContinueTermId,

    // Continue to project
    continueTeams,
    selectedTeamIds,
    setSelectedTeamIds,
    continuingSectionCode,
    continueLoading,

    // Forms
    createForm,
    setCreateForm,
    createError,
    termForm,
    setTermForm,
    termError,

    // Modals
    showCreateModal,
    setShowCreateModal,
    showTermModal,
    setShowTermModal,
    showEnrollmentsModal,
    setShowEnrollmentsModal,
    showEnrollModal,
    setShowEnrollModal,
    showContinueModal,
    setShowContinueModal,

    // Handlers
    handlers: {
      fetchSections,
      fetchTerms,
      handleCreateSection,
      handleCreateTerm,
      fetchEnrollments,
      openEnrollModal,
      handleEnroll,
      toggleCandidate,
      toggleAllCandidates,
      openContinueModal,
      handleContinueToProject,
      handleDeleteSection,
      handleToggleLock,
    },
  };
}
