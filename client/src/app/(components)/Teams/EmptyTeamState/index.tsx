'use client';

import React from 'react';
import { UserPlus } from 'lucide-react';
import Button from '@/app/(components)/Button';

interface Props {
  message?: string;
  onAddClick?: () => void; // ✅ รับ Prop นี้มา
}

export const EmptyTeamState = ({ message, onAddClick }: Props) => (
  <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 border-dashed">
    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-5 animate-pulse">
      <UserPlus size={40} className="text-gray-300 dark:text-gray-600" />
    </div>
    <h3 className="text-xl font-bold dark:text-white">
      {message || "คุณยังไม่มีข้อมูลกลุ่ม"}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center max-w-xs">
      เริ่มสร้างกลุ่มใหม่เพื่อเริ่มจัดการข้อมูลปริญญานิพนธ์ของคุณ หรือรอรับคำเชิญจากสมาชิกคนอื่น
    </p>
    
    {/* ✅ ผูก onClick เข้ากับ onAddClick */}
    <Button variant="primary" onClick={onAddClick}>
      สร้างกลุ่มใหม่เดี๋ยวนี้
    </Button>
  </div>
);