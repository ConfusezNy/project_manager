'use client'; 

import React, { useState, useEffect } from 'react';
import TimelineFilters from '../(components)/TimelineFilters';
import TimelineListView from '../(components)/TimelineListView';
import DocumentsView from '../(components)/DocumentsView';
import TimelineFormModal from '../(components)/TimelineFormModal';

// Interface
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
  // --- States ---
  const [data, setData] = useState<TimelineItem[]>([]); // ✅ เริ่มต้นเป็น Array ว่าง
  const [isLoading, setIsLoading] = useState(true); 
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents'>('timeline');
  const [selectedYear, setSelectedYear] = useState('2568');
  const [studentType, setStudentType] = useState('เทียบโอน');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); 

  // --- Initial Load ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // จำลองการโหลดข้อมูล (Network Delay)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ✅ ไม่โหลด Mock Data แล้ว ให้เป็นค่าว่าง []
      setData([]); 
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // --- Logic Helpers ---
  const checkTimelineStatus = (items: TimelineItem[]) => {
    const now = new Date();
    return items.map(item => {
      if (!item.isoDateTime) return item;
      const itemDate = new Date(item.isoDateTime);
      return now >= itemDate ? { ...item, status: 'active' as const } : { ...item, status: 'pending' as const };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => setData(prev => checkTimelineStatus(prev)), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const handleOpenCreate = () => { setEditingId(null); setIsModalOpen(true); };
  const handleOpenEdit = (id: number) => { setEditingId(id); setIsModalOpen(true); };

  const handleFormSubmit = (formData: any) => {
    // Logic รวมวันที่และเวลา
    const timeString = formData.startTime || '00:00';
    const isoDateTime = `${formData.date}T${timeString}`;
    
    // แปลงวันที่แสดงผลไทย
    let displayDate = "ไม่ระบุวันที่";
    if (formData.date) {
        const datePart = new Date(formData.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
        displayDate = `${datePart}${formData.startTime ? ` • ${formData.startTime} น.` : ''}`;
    }

    const newItemBase = { ...formData, date: displayDate, isoDateTime, year: selectedYear };

    if (editingId !== null) {
      // กรณีแก้ไข
      setData(prev => {
        const updated = prev.map(item => item.id === editingId ? { ...item, ...newItemBase } : item);
        return checkTimelineStatus(updated);
      });
    } else {
      // ✅ กรณีเพิ่มใหม่ (Input)
      const newItem: TimelineItem = { 
        id: Date.now(), 
        week: data.filter(i => i.year === selectedYear).length + 1, // รันเลขสัปดาห์ต่อจากที่มี
        ...newItemBase, 
        status: 'pending' 
      };
      
      setData(prev => {
        const updated = [...prev, newItem].sort((a, b) => new Date(a.isoDateTime).getTime() - new Date(b.isoDateTime).getTime());
        // รีเซ็ตเลขสัปดาห์ใหม่ตามลำดับเวลา
        const reIndexed = updated.map((item, index) => ({...item, week: index + 1}));
        return checkTimelineStatus(reIndexed);
      });
    }
    setIsModalOpen(false);
  };

  // กรองข้อมูลตามปีที่เลือก
  const filteredData = data.filter(item => item.year === selectedYear);

  if (isLoading) return <div className="min-h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="p-6 min-h-screen w-full text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      <TimelineFilters 
        activeTab={activeTab} setActiveTab={setActiveTab}
        // Mock ปีไว้ก่อน (ในอนาคตอาจดึงจาก API ได้)
        years={['2568', '2567', '2566']} 
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        studentType={studentType} setStudentType={setStudentType}
        onAddClick={handleOpenCreate}
      />

      {activeTab === 'timeline' ? (
        <TimelineListView 
          data={filteredData} 
          selectedYear={selectedYear} 
          onEdit={handleOpenEdit} 
          onCreate={handleOpenCreate} 
        />
      ) : (
        <DocumentsView data={filteredData} selectedYear={selectedYear} />
      )}

      <TimelineFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        year={selectedYear}
        initialData={editingId ? data.find(i => i.id === editingId) : undefined}
      />

    </div>
  );
};

export default TimelinePage;