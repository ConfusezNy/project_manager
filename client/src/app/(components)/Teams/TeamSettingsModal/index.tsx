'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void; // ฟังก์ชันนี้ต้องถูกส่งมาจาก TeamsPage
  isLoading: boolean;
  initialData: any;
}

export const TeamSettingsModal = ({ isOpen, onClose, onUpdate, isLoading, initialData }: Props) => {
  const [editData, setEditData] = useState({
    topicThai: '',
    topicEng: '',
    description: '',
    projectType: ''
  });

  // โหลดข้อมูลเดิมขึ้นมาแสดงเมื่อเปิด Modal
  useEffect(() => {
    if (initialData && isOpen) {
      setEditData({
        topicThai: initialData.topicThai || '',
        topicEng: initialData.topicEng || '',
        description: initialData.description || '',
        projectType: initialData.projectType || ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ ป้องกัน Error: ตรวจสอบว่ามีฟังก์ชัน onUpdate ส่งมาจริงหรือไม่ก่อนเรียกใช้
    if (typeof onUpdate === 'function') {
      onUpdate(editData);
    } else {
      console.error("Error: onUpdate prop is not provided to TeamSettingsModal");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] w-full max-w-xl rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
        
        {/* Header ตามแบบ image_cfbf23.png */}
        <div className="p-6 flex justify-between items-center border-b border-gray-800/50">
          <h2 className="text-2xl font-bold text-white">แก้ไข/ปรับหัวข้อ</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">ชื่อโปรเจกภาษาไทย</label>
            <input
              className="w-full px-4 py-2.5 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 transition-all"
              placeholder="ระบุชื่อภาษาไทย"
              value={editData.topicThai}
              onChange={(e) => setEditData({...editData, topicThai: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">ชื่อโปรเจกภาษาอังกฤษ</label>
            <input
              className="w-full px-4 py-2.5 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 transition-all"
              placeholder="Student Project Management"
              value={editData.topicEng}
              onChange={(e) => setEditData({...editData, topicEng: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">คำอธิบาย</label>
            <textarea
              rows={5}
              className="w-full px-4 py-2.5 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="อธิบายวัตถุประสงค์และแนวคิดโดยย่อ"
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">ประเภทโครงงาน</label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                value={editData.projectType}
                onChange={(e) => setEditData({...editData, projectType: e.target.value})}
              >
                <option value="">-- เลือก --</option>
                <option value="ฮาร์ดแวร์">ฮาร์ดแวร์</option>
                <option value="ซอฟต์แวร์">ซอฟต์แวร์</option>
                <option value="ไอโอที">ไอโอที (IoT)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ปุ่มแก้ไขตามแบบ image_cfbf23.png */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "กำลังบันทึก..." : "แก้ไข"}
          </button>
        </form>
      </div>
    </div>
  );
};