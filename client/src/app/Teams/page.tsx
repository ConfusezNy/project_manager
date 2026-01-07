'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Components พื้นฐาน
import { TeamHeader } from '../(components)/Teams/TeamHeader';
import { EmptyTeamState } from '../(components)/Teams/EmptyTeamState';

// Student Components
import { TeamInfoCards } from '../(components)/Teams/TeamInfoCards';
import { TeamMembersTable } from '../(components)/Teams/TeamMembersTable';
import { TeamProjectDetail } from '../(components)/Teams/TeamProjectDetail';
import { TeamAdminStats } from '../(components)/Teams/TeamAdminStats';
import { TeamFilters } from '../(components)/Teams/TeamFilters';
import { TeamTable } from '../(components)/Teams/TeamTable';
import { CreateTeamModal } from '../(components)/Teams/CreateTeamModal'; 
import { TeamSettingsModal } from '../(components)/Teams/TeamSettingsModal';
import { InviteMemberModal } from '../(components)/Teams/InviteMemberModal';

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const [teamData, setTeamData] = useState<any>(null); 
  const [allTeams, setAllTeams] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); 
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isInviting, setIsInviting] = useState(false); 

  const [selectedTerm, setSelectedTerm] = useState('1/2568');

  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isStudent = currentUser?.role === 'STUDENT';

  const fetchData = useCallback(async () => {
    if (status !== "authenticated") return;
    setIsLoading(true);

    try {
      if (isAdmin) {
        const res = await fetch(`/api/teams?term=${selectedTerm}`);
        if (res.ok) {
          const data = await res.json();
          setAllTeams(data);
        }
      } else if (isStudent) {
        const res = await fetch('/api/teams/my-team');
        if (res.ok) {
          const data = await res.json();
          setTeamData(data);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [status, isAdmin, isStudent, selectedTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTeam = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "เกิดข้อผิดพลาดในการสร้างกลุ่ม");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/teams/my-team', { method: 'DELETE' });
      if (res.ok) {
        setIsSettingsModalOpen(false);
        setTeamData(null); 
        fetchData(); 
      } else {
        const error = await res.json();
        alert(error.error || "ไม่สามารถลบกลุ่มได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ แก้ไขฟังก์ชันเชิญเพื่อนเพื่อให้แสดง Error ที่ชัดเจนขึ้น
  const handleInviteMember = async (targetUserId: string) => {
    setIsInviting(true);
    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsInviteModalOpen(false);
        fetchData(); // รีโหลดตารางสมาชิก
      } else {
        // ✅ แสดง Error จริงที่ส่งมาจาก API (เช่น เพื่อนมีกลุ่มแล้ว)
        alert(data.error || 'ไม่สามารถเชิญเพื่อนได้');
      }
    } catch (error) {
      // ✅ Error นี้จะเกิดก็ต่อเมื่อหาไฟล์ API ไม่เจอ หรือเน็ตหลุด
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (ตรวจสอบไฟล์ /api/teams/invite/route.ts)');
    } finally {
      setIsInviting(false);
    }
  };

const handleUpdateTeam = async (formData: any) => {
  setIsSubmitting(true);
  try {
    const res = await fetch('/api/teams/my-team', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsSettingsModalOpen(false); // ปิด Modal
      fetchData(); // ดึงข้อมูลใหม่มาโชว์ที่หน้าจอ
    } else {
      const error = await res.json();
      alert(error.error || "แก้ไขข้อมูลไม่สำเร็จ");
    }
  } catch (error) {
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
  } finally {
    setIsSubmitting(false);
  }
};

// ในส่วน JSX ส่ง Props ไปให้ Modal
<TeamSettingsModal 
  isOpen={isSettingsModalOpen}
  onClose={() => setIsSettingsModalOpen(false)}
  onUpdate={handleUpdateTeam} // ✅ ต้องมีบรรทัดนี้ และต้องชื่อ 'onUpdate'
  isLoading={isSubmitting}
  initialData={teamData}
/>

  if (status === "loading" || isLoading) {
    return (
      <div className="p-6 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 dark:text-white font-medium">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      <TeamHeader 
        role={currentUser?.role || 'GUEST'} 
        hasGroup={isAdmin ? allTeams.length > 0 : !!teamData} 
        onAddClick={() => setIsCreateModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />

      {isAdmin && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <TeamFilters selectedTerm={selectedTerm} setSelectedTerm={setSelectedTerm} />
          {allTeams.length > 0 ? (
            <>
              <TeamAdminStats totalTeams={allTeams.length} term={selectedTerm} />
              <TeamTable teams={allTeams} />
            </>
          ) : (
            <EmptyTeamState message={`ยังไม่มีข้อมูลกลุ่มในเทอม ${selectedTerm}`} />
          )}
        </div>
      )}

      {isStudent && (
        <div className="animate-in fade-in duration-500">
          {teamData ? (
            <div className="space-y-6">
              <TeamInfoCards data={teamData} />
              <TeamMembersTable 
                members={teamData.members} 
                onInviteClick={() => setIsInviteModalOpen(true)} 
              />
              <TeamProjectDetail data={teamData} />
            </div>
          ) : (
            <EmptyTeamState onAddClick={() => setIsCreateModalOpen(true)} />
          )}
        </div>
      )}

      {!isAdmin && !isStudent && (
        <div className="text-center py-20">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      )}

{isStudent && teamData && (
  <TeamSettingsModal 
    isOpen={isSettingsModalOpen}
    onClose={() => setIsSettingsModalOpen(false)}
    onUpdate={handleUpdateTeam} // ✅ ต้องมีบรรทัดนี้ และชื่อต้องตรงกัน
    isLoading={isSubmitting}
    initialData={teamData}
  />
)}

      {isStudent && (
        <CreateTeamModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTeam}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );

  

}