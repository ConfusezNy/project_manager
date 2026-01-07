'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Users, UserPlus, FileText, Mail } from 'lucide-react'

// Components
import { TeamInfoCards } from '@/app/(components)/Teams/TeamInfoCards'
import { TeamMembersTable } from '@/app/(components)/Teams/TeamMembersTable'
import { TeamProjectDetail } from '@/app/(components)/Teams/TeamProjectDetail'
import { InviteMemberModal } from '@/app/(components)/Teams/InviteMemberModal'
import { ProjectFormModal, ProjectFormData } from '@/app/(components)/ProjectFormModal'
import Button from '@/app/(components)/Button'

export default function TeamsPage() {
  const { data: session, status } = useSession()
  const user = session?.user as any

  const [teamData, setTeamData] = useState<any>(null)
  const [section, setSection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [inviting, setInviting] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [joiningTeam, setJoiningTeam] = useState(false)
  const [rejectingTeam, setRejectingTeam] = useState(false)
  
  // Project states
  const [projectData, setProjectData] = useState<any>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectSubmitting, setProjectSubmitting] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)

  // ========================
  // Fetch team + section
  // ========================
  const fetchData = async () => {
    setLoading(true)

    try {
      // 1. เช็กว่ามีทีมไหม
      const teamRes = await fetch('/api/teams/my-team')
      if (teamRes.ok) {
        const data = await teamRes.json()
        if (data?.team) {
          setTeamData(data.team)
          // ถ้ามีทีมแล้ว ก็ดึง section จาก team
          setSection(data.team.section)
          
          // ดึงข้อมูลโปรเจกต์ (ถ้ามี)
          const projectRes = await fetch(`/api/projects?team_id=${data.team.team_id}`)
          if (projectRes.ok) {
            const project = await projectRes.json()
            setProjectData(project)
          }
          
          setLoading(false)
          return
        }
      }

      // 2. ถ้ายังไม่มีทีม → ดึง section ที่ enroll
      const sectionRes = await fetch('/api/sections/my-section')
      if (sectionRes.ok) {
        const sec = await sectionRes.json()
        setSection(sec)
      }

      // 3. ดึงคำเชิญที่รอรับ
      const invitesRes = await fetch('/api/teams/pending-invites')
      if (invitesRes.ok) {
        const invites = await invitesRes.json()
        setPendingInvites(invites)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  // ========================
  // Create team
  // ========================
  const handleCreateTeam = async () => {
    if (!section) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: section.section_id
        })
      })

      if (res.ok) {
        setShowConfirm(false)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.message || 'สร้างกลุ่มไม่สำเร็จ')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ========================
  // Invite member
  // ========================
  const handleOpenInviteModal = async () => {
    if (!section) return
    
    setShowInviteModal(true)
    
    // ดึงรายชื่อนักศึกษาที่ยังไม่มีทีม
    const res = await fetch(`/api/sections/${section.section_id}/available-students`)
    if (res.ok) {
      const students = await res.json()
      setAvailableStudents(students)
    }
  }

  const handleInviteMember = async (userId: string) => {
    if (!teamData) return

    setInviting(true)
    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: teamData.team_id,
          inviteeUserId: userId
        })
      })

      if (res.ok) {
        alert('เชิญสมาชิกสำเร็จ!')
        setShowInviteModal(false)
        fetchData() // refresh team data
      } else {
        const data = await res.json()
        alert(data.message || 'เชิญสมาชิกไม่สำเร็จ')
      }
    } finally {
      setInviting(false)
    }
  }

  // ========================
  // Accept invite
  // ========================
  const handleAcceptInvite = async (notificationId: number) => {
    setJoiningTeam(true)
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId
        })
      })

      if (res.ok) {
        alert('เข้าร่วมกลุ่มสำเร็จ!')
        fetchData() // refresh data
      } else {
        const data = await res.json()
        alert(data.message || 'เข้าร่วมกลุ่มไม่สำเร็จ')
      }
    } finally {
      setJoiningTeam(false)
    }
  }

  // ========================
  // Reject invite
  // ========================
  const handleRejectInvite = async (notificationId: number) => {
    setRejectingTeam(true)
    try {
      const res = await fetch('/api/teams/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId
        })
      })

      if (res.ok) {
        alert('ปฏิเสธคำเชิญแล้ว')
        fetchData() // refresh data
      } else {
        const data = await res.json()
        alert(data.message || 'ปฏิเสธไม่สำเร็จ')
      }
    } finally {
      setRejectingTeam(false)
    }
  }

  // ========================
  // Project handlers
  // ========================
  const handleCreateProject = () => {
    setIsEditingProject(false)
    setShowProjectModal(true)
  }

  const handleEditProject = () => {
    setIsEditingProject(true)
    setShowProjectModal(true)
  }

  const handleProjectSubmit = async (formData: ProjectFormData) => {
    if (!teamData) return

    setProjectSubmitting(true)
    try {
      if (isEditingProject && projectData) {
        // แก้ไขโปรเจกต์
        const res = await fetch(`/api/projects/${projectData.project_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (res.ok) {
          alert('แก้ไขหัวข้อโครงงานสำเร็จ!')
          setShowProjectModal(false)
          fetchData()
        } else {
          const data = await res.json()
          alert(data.message || 'แก้ไขไม่สำเร็จ')
        }
      } else {
        // สร้างโปรเจกต์ใหม่
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            team_id: teamData.team_id
          })
        })

        if (res.ok) {
          alert('สร้างหัวข้อโครงงานสำเร็จ!')
          setShowProjectModal(false)
          fetchData()
        } else {
          const data = await res.json()
          alert(data.message || 'สร้างไม่สำเร็จ')
        }
      }
    } finally {
      setProjectSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectData) return

    if (!confirm('คุณต้องการลบหัวข้อโครงงานนี้ใช่หรือไม่?')) {
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectData.project_id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('ลบหัวข้อโครงงานสำเร็จ!')
        setProjectData(null)
        fetchData()
      } else {
        const data = await res.json()
        alert(data.message || 'ลบไม่สำเร็จ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด')
    }
  }

  // ========================
  // Guards
  // ========================
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  // ========================
  // Render - หน้าเดียวเสมอ
  // ========================
  const hasTeam = !!teamData

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ข้อมูลกลุ่มโครงงาน
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Pending Invites */}
        {!hasTeam && pendingInvites.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  คำเชิญเข้ากลุ่ม ({pendingInvites.length})
                </h3>
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.notification_id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {invite.actor?.firstname} {invite.actor?.lastname} เชิญคุณเข้ากลุ่ม
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {invite.team?.section?.section_code} - {invite.team?.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            สมาชิก: {invite.team?.members?.length || 0} คน
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            className="!py-2.5 !px-5 !text-base"
                            onClick={() => handleAcceptInvite(invite.notification_id)}
                            disabled={joiningTeam}
                          >
                            {joiningTeam ? 'กำลังเข้าร่วม...' : 'รับคำเชิญ'}
                          </Button>
                          <Button
                            variant="secondary"
                            className="!py-2.5 !px-5 !text-base"
                            onClick={() => handleRejectInvite(invite.notification_id)}
                            disabled={joiningTeam || rejectingTeam}
                          >
                            {rejectingTeam ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 1: สถานะกลุ่ม + อาจารย์ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* สถานะกลุ่ม */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={22} className="text-blue-500" />
                สถานะกลุ่ม
              </h2>
              {hasTeam && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase border border-blue-100 dark:border-blue-800">
                  รอมอบหมายหัวข้อ
                </span>
              )}
            </div>

            {hasTeam ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">ชื่อกลุ่ม</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {teamData.teamname === 'TMP' ? 'รอตั้งชื่อกลุ่ม' : (teamData.teamname || 'ยังไม่ได้ตั้งชื่อ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">เลขกลุ่ม</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {section?.section_code || '---'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">ภาคเรียน</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {section?.term?.semester}/{section?.term?.academicYear || section?.term?.term_name || '---'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {section ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">ชื่อกลุ่ม</p>
                        <p className="text-base font-semibold text-gray-400 dark:text-gray-500">
                          ยังไม่ได้สร้างกลุ่ม
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">เลขกลุ่ม</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {section.section_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-2">ภาคเรียน</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {section.term?.semester}/{section.term?.academicYear || section.term?.term_name}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-3">สถานะ</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <UserPlus size={24} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-500 dark:text-gray-400">
                            ยังไม่มีกลุ่ม
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            สร้างกลุ่มหรือรอรับคำเชิญ
                          </p>
                        </div>
                        <Button 
                          variant="primary" 
                          className="!py-2.5 !px-5 !text-base"
                          onClick={() => setShowConfirm(true)}
                        >
                          สร้างกลุ่มใหม่
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-base">ไม่พบข้อมูลรายวิชา</p>
                )}
              </div>
            )}
          </div>

          {/* อาจารย์ที่ปรึกษา */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
              <UserPlus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-500 dark:text-gray-400 mb-1">
              ยังไม่มีสมาชิกอาจารย์
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              กรุณาติดต่ออาจารย์เพื่อขอคำปรึกษา
            </p>
            <Button 
              variant="primary" 
              className="!py-2.5 !px-5 !text-sm w-full"
              onClick={() => alert("ระบบค้นหาและเลือกอาจารย์กำลังพัฒนา...")}
            >
              เลือกอาจารย์ที่ปรึกษา +
            </Button>
          </div>
        </div>

        {/* Row 2: สมาชิกในกลุ่ม */}
        {hasTeam ? (
          <TeamMembersTable 
            members={teamData.members || []} 
            onInviteClick={handleOpenInviteModal}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                สมาชิกภายในกลุ่ม
              </h2>
              <button disabled className="text-sm font-bold text-gray-400 cursor-not-allowed">
                เชิญเพื่อนเข้ากลุ่ม +
              </button>
            </div>
            <div className="p-10 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">ยังไม่มีสมาชิก</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">สร้างกลุ่มเพื่อเริ่มต้น</p>
            </div>
          </div>
        )}

        {/* Row 3: รายละเอียดโครงงาน */}
        {hasTeam ? (
          projectData ? (
            <TeamProjectDetail 
              data={projectData} 
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              canEdit={projectData.status !== 'APPROVED'}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={22} className="text-amber-500" />
                  รายละเอียดหัวข้อโครงการ
                </h2>
              </div>
              <div className="text-center py-10">
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4">ยังไม่มีหัวข้อโครงงาน</p>
                <Button
                  variant="primary"
                  onClick={handleCreateProject}
                  className="!py-2.5 !px-6 !text-base"
                >
                  สร้างหัวข้อโครงงาน +
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={22} className="text-amber-500" />
                รายละเอียดหัวข้อโครงการ
              </h2>
              <button disabled className="text-sm font-bold text-gray-400 cursor-not-allowed uppercase tracking-widest">
                แก้ไขหัวข้อ
              </button>
            </div>
            <div className="text-center py-10">
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2">ยังไม่มีข้อมูลโครงงาน</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">จะแสดงหลังจากสร้างกลุ่มและกำหนดหัวข้อ</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ยืนยันการสร้างกลุ่ม
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              คุณต้องการสร้างกลุ่มสำหรับรายวิชา<br />
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {section?.section_code} - {section?.term?.term_name}
              </span><br />
              ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                ยกเลิก
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={handleCreateTeam}
                disabled={submitting}
              >
                {submitting ? 'กำลังสร้าง...' : 'ยืนยัน'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        availableStudents={availableStudents}
        onInvite={handleInviteMember}
        isLoading={inviting}
      />

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleProjectSubmit}
        initialData={isEditingProject && projectData ? {
          projectname: projectData.projectname,
          projectnameEng: projectData.projectnameEng || '',
          project_type: projectData.project_type || '',
          description: projectData.description || ''
        } : null}
        isSubmitting={projectSubmitting}
      />
    </div>
  )
}
