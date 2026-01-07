'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import TimelineFilters from '../(components)/TimelineFilters';
import TimelineListView from '../(components)/TimelineListView';
import DocumentsView from '../(components)/DocumentsView';
import TimelineFormModal from '../(components)/TimelineFormModal';

interface TimelineItem {
  id: number;
  week: number;
  title: string;
  description?: string; 
  date: string;         
  isoDateTime: string;  
  hasDoc: boolean;
  status: 'active' | 'pending' | 'inactive';
  year: string; 
}

const TimelinePage = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [data, setData] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents'>('timeline');
  const [selectedYear, setSelectedYear] = useState('2568');
  const [studentType, setStudentType] = useState('เทียบโอน');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); 

  // --- Logic เช็คสถานะ ---
  const checkTimelineStatus = useCallback((items: TimelineItem[]) => {
    const now = new Date();
    return items.map(item => {
      const itemDate = new Date(item.isoDateTime);
      return now >= itemDate ? { ...item, status: 'active' as const } : { ...item, status: 'pending' as const };
    });
  }, []);

  // --- ดึงข้อมูลจากฐานข้อมูล ---
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

  // ตั้งเวลาเช็คสถานะทุก 1 นาที
  useEffect(() => {
    const interval = setInterval(() => setData(prev => checkTimelineStatus(prev)), 60000);
    return () => clearInterval(interval);
  }, [checkTimelineStatus]);

  // --- Actions ---
  const handleOpenCreate = () => { if(isAdmin) { setEditingId(null); setIsModalOpen(true); } };
  const handleOpenEdit = (id: number) => { if(isAdmin) { setEditingId(id); setIsModalOpen(true); } };

  const handleFormSubmit = async (formData: any) => {
    const timeString = formData.startTime || '00:00';
    const isoDateTime = `${formData.date}T${timeString}`;
    
    // แปลงวันที่แสดงผลไทย
    const displayDate = new Date(formData.date).toLocaleDateString('th-TH', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }) + (formData.startTime ? ` • ${formData.startTime} น.` : '');

    const payload = { 
      ...formData, 
      date: displayDate, 
      isoDateTime, 
      year: selectedYear,
      week: editingId ? data.find(i => i.id === editingId)?.week : data.length + 1
    };

    try {
      const url = editingId ? `/api/timeline/${editingId}` : '/api/timeline';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await loadData(); // ✅ รีโหลดข้อมูลใหม่จากฐานข้อมูลหลังบันทึก
        setIsModalOpen(false);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const filteredData = data.filter(item => item.year === selectedYear);

  if (isLoading) return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen w-full text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <TimelineFilters 
        activeTab={activeTab} setActiveTab={setActiveTab}
        years={['2568', '2567', '2566']} 
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        studentType={studentType} setStudentType={setStudentType}
        onAddClick={handleOpenCreate}
        isAdmin={isAdmin}
      />

      {activeTab === 'timeline' ? (
        <TimelineListView 
          data={filteredData} 
          selectedYear={selectedYear} 
          onEdit={handleOpenEdit} 
          onCreate={handleOpenCreate} 
          isAdmin={isAdmin}
        />
      ) : (
        <DocumentsView data={filteredData} selectedYear={selectedYear} />
      )}

      {isAdmin && (
        <TimelineFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          year={selectedYear}
          initialData={editingId ? data.find(i => i.id === editingId) : undefined}
        />
      )}
    </div>
  );
};

export default TimelinePage;