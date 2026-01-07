'use client';
import React, { useState, useEffect } from 'react';
import Modal from '../../(components)/ModalTimeline'; 
import { User } from './UserTable';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<User>) => void;
  initialData?: User | null;
}

const UserFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'STUDENT', status: 'Active' });

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, email: initialData.email, role: initialData.role, status: initialData.status });
    } else {
      setForm({ name: '', email: '', role: 'STUDENT', status: 'Active' });
    }
  }, [initialData, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form as any); }} className="flex flex-col gap-5 p-1">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ชื่อ - นามสกุล</label>
          <input 
            type="text" required placeholder="เช่น สมชาย ใจดี"
            className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-sm dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">อีเมล</label>
          <input 
            type="email" required placeholder="example@univ.ac.th"
            className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-sm dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ระดับสิทธิ์ (Role)</label>
            <select 
              className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-sm dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer"
              value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="STUDENT">Student</option>
              <option value="ADVISOR">Advisor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">สถานะ (Status)</label>
            <select 
              className="w-full rounded-xl border border-transparent bg-slate-50 p-3 text-sm dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer"
              value={form.status} onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="Active">ใช้งานปกติ</option>
              <option value="Inactive">ปิดการใช้งาน</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-gray-700 transition-colors">ยกเลิก</button>
          <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">บันทึกข้อมูล</button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;