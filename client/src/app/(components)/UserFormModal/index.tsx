import React, { useState, useEffect } from 'react';
import Modal from '../../(components)/ModalTimeline'; // เรียกใช้ Modal กลางที่เราเคยทำ
import { User } from './UserTable';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User>) => void;
  initialData?: User | null;
}

const UserFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'Student', status: 'Active' });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status
      });
    } else {
      setForm({ name: '', email: '', role: 'Student', status: 'Active' }); // Reset for create
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as Partial<User>);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ - นามสกุล</label>
          <input 
            type="text" required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">อีเมล</label>
          <input 
            type="email" required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ระดับสิทธิ์ (Role)</label>
            <select 
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white"
              value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ (Status)</label>
            <select 
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white"
              value={form.status} onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">ยกเลิก</button>
          <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">บันทึก</button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;