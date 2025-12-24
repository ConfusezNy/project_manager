'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Button from '../(components)/Button';
import UserStats from '../(components)/UserStates';
import UserFilters from '../(components)/UserFilters';
import UserTable, { User } from '../(components)/UserTable';
import UserFormModal from '../(components)/UserFormModal';

const UserPage = () => {
  // --- 1. จำลอง User ที่ Login เข้ามา ---
  // ในระบบจริง ข้อมูลนี้จะมาจาก Context หรือ Session
  const currentUser = {
    id: 99,
    name: 'Current User',
    role: 'Student', // 👈 ลองเปลี่ยนเป็น 'Admin', 'Teacher', หรือ 'Student' เพื่อทดสอบผลลัพธ์
  };

  const isAdmin = currentUser.role === 'Admin';

  // Mock Data
  const initialUsers: User[] = [
    { id: 1, name: 'Somchai Jaidee', email: 'somchai@univ.ac.th', role: 'Teacher', status: 'Active', lastActive: '2 min ago' },
    { id: 2, name: 'John Doe', email: 'john.doe@student.ac.th', role: 'Student', status: 'Inactive', lastActive: '3 days ago' },
    { id: 3, name: 'Admin Master', email: 'admin@system.com', role: 'Admin', status: 'Active', lastActive: 'Now' },
    { id: 99, name: 'Current User', email: 'me@univ.ac.th', role: 'Teacher', status: 'Active', lastActive: 'Now' }, // ตัวเอง
  ];

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Load Data
  useEffect(() => {
    setTimeout(() => {
      setUsers(initialUsers);
      setIsLoading(false);
    }, 500);
  }, []);

  // --- 2. Logic การกรองข้อมูล (Permission Logic) ---
  const getVisibleUsers = () => {
    let baseUsers = users;

    // ถ้าไม่ใช่ Admin อาจจะให้เห็นแค่บางคน หรือเห็นทั้งหมดแต่ Read-Only
    // กรณี 1: Teacher/Student เห็นแค่ "ตัวเอง" (Uncomment บรรทัดล่างถ้าต้องการแบบนี้)
    // if (!isAdmin) return baseUsers.filter(u => u.id === currentUser.id);

    // กรณี 2: Teacher/Student เห็น "ทุกคน" (Directory View) แต่แก้ไขไม่ได้ (ใช้ Logic นี้เป็น Default)
    return baseUsers; 
  };

  // Apply Search & Filters
  const filteredUsers = getVisibleUsers().filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Actions
  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleFormSubmit = (userData: Partial<User>) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      const newUser: User = {
        id: Date.now(),
        name: userData.name!,
        email: userData.email!,
        role: userData.role as any,
        status: userData.status as any,
        lastActive: 'Just now'
      };
      setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    admins: users.filter(u => u.role === 'Admin').length
  };

  if (isLoading) return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen w-full text-gray-800 dark:text-gray-200 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {/* แสดง Role ของคนดู */}
            สถานะของคุณ: <span className="font-semibold text-blue-600">{currentUser.role}</span>
          </p>
        </div>
        
        {/* ✅ ซ่อนปุ่มเพิ่ม ถ้าไม่ใช่ Admin */}
        {isAdmin && (
          <Button variant="primary" icon={UserPlus} onClick={handleAddClick}>เพิ่มผู้ใช้งาน</Button>
        )}
      </div>

      <UserStats {...stats} />

      <UserFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
      />

      {/* Table */}
      <UserTable 
        users={filteredUsers} 
        onEdit={handleEditClick} 
        onDelete={handleDeleteClick}
        readOnly={!isAdmin} // ✅ ส่งค่า readOnly ไป ถ้าไม่ใช่ Admin
      />

      {/* Form Modal (Admin only) */}
      {isAdmin && (
        <UserFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleFormSubmit}
          initialData={editingUser}
        />
      )}

    </div>
  );
};

export default UserPage;