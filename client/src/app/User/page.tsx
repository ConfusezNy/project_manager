'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus } from 'lucide-react';
import Button from '../(components)/Button';
import UserStats from '../(components)/UserStates';
import UserFilters from '../(components)/UserFilters';
import UserTable, { User } from '../(components)/UserTable';
import UserFormModal from '../(components)/UserFormModal';

const UserPage = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = session?.user as any;
  // ตรวจสอบบทบาทจาก Session จริง
  const isAdmin = currentUser?.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (res.ok) {
        const mappedUsers = data.map((u: any) => ({
          id: u.users_id,
          // รวมชื่อจริงและนามสกุลสำหรับแสดงผล
          name: `${u.firstname} ${u.lastname}`,
          email: u.email,
          role: u.role,
          status: 'Active',
          lastActive: 'Now'
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string | number) => {
    if (confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert("ลบไม่สำเร็จ");
      }
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (userData: any) => {
     fetchUsers();
     setIsModalOpen(false);
  };

  if (isLoading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    // เพิ่ม bg-white dark:bg-gray-900 และ text-gray-800 dark:text-gray-100
    <div className="p-6 min-h-screen w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {/* ปรับสีหัวข้อตามโหมด dark:text-white */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            สถานะของคุณ: <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser?.role || 'Guest'}</span>
          </p>
        </div>
        {/* แสดงปุ่มเพิ่มเฉพาะ Admin เท่านั้น */}
        {isAdmin && (
          <Button variant="primary" icon={UserPlus} onClick={handleAddClick}>เพิ่มผู้ใช้งาน</Button>
        )}
      </div>

      {/* Stats Section */}
      <UserStats 
        total={users.length} 
        active={users.length} 
        admins={users.filter(u => u.role === 'ADMIN').length} 
      />

      {/* Filters Section */}
      <div className="my-6">
        <UserFilters 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          roleFilter={roleFilter} setRoleFilter={setRoleFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <UserTable 
          users={filteredUsers} 
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick}
          readOnly={!isAdmin} 
        />
      </div>

      {/* Modal Section */}
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