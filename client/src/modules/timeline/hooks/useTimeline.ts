"use client";

// useTimeline Hook - State management for timeline page
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface TimelineItem {
  id: number;
  week: number;
  title: string;
  description?: string;
  date: string;
  isoDateTime: string;
  hasDoc: boolean;
  status: "active" | "pending" | "inactive";
  year: string;
}

export function useTimeline() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [data, setData] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "documents">(
    "timeline",
  );
  const [selectedYear, setSelectedYear] = useState("2568");
  const [studentType, setStudentType] = useState("เทียบโอน");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const checkTimelineStatus = useCallback((items: TimelineItem[]) => {
    const now = new Date();
    return items.map((item) => {
      const itemDate = new Date(item.isoDateTime);
      return now >= itemDate
        ? { ...item, status: "active" as const }
        : { ...item, status: "pending" as const };
    });
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/timeline?year=${selectedYear}`);
      const result = await res.json();
      setData(checkTimelineStatus(result));
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, checkTimelineStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Status check interval
  useEffect(() => {
    const interval = setInterval(
      () => setData((prev) => checkTimelineStatus(prev)),
      60000,
    );
    return () => clearInterval(interval);
  }, [checkTimelineStatus]);

  const handleOpenCreate = useCallback(() => {
    if (isAdmin) {
      setEditingId(null);
      setIsModalOpen(true);
    }
  }, [isAdmin]);

  const handleOpenEdit = useCallback(
    (id: number) => {
      if (isAdmin) {
        setEditingId(id);
        setIsModalOpen(true);
      }
    },
    [isAdmin],
  );

  const handleFormSubmit = useCallback(
    async (formData: any) => {
      const timeString = formData.startTime || "00:00";
      const isoDateTime = `${formData.date}T${timeString}`;

      const displayDate =
        new Date(formData.date).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) + (formData.startTime ? ` • ${formData.startTime} น.` : "");

      const payload = {
        ...formData,
        date: displayDate,
        isoDateTime,
        year: selectedYear,
        week: editingId
          ? data.find((i) => i.id === editingId)?.week
          : data.length + 1,
      };

      try {
        const url = editingId ? `/api/timeline/${editingId}` : "/api/timeline";
        const method = editingId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          await loadData();
          setIsModalOpen(false);
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    },
    [selectedYear, editingId, data, loadData],
  );

  const filteredData = data.filter((item) => item.year === selectedYear);

  return {
    isAdmin,
    data: filteredData,
    isLoading,
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    studentType,
    setStudentType,
    isModalOpen,
    setIsModalOpen,
    editingId,
    editingItem: editingId ? data.find((i) => i.id === editingId) : undefined,
    handlers: {
      loadData,
      handleOpenCreate,
      handleOpenEdit,
      handleFormSubmit,
    },
  };
}
