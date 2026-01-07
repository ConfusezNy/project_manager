'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import Button from '@/app/(components)/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string) => void;
  isLoading: boolean;
}

export const InviteMemberModal = ({ isOpen, onClose, onInvite, isLoading }: Props) => {
  const [searchId, setSearchId] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // ฟังก์ชันค้นหาเพื่อนในระบบ
  const handleSearch = async () => {
    if (!searchId) return;
    setIsSearching(true);
    setError('');
    setFoundUser(null);

    try {
      const res = await fetch(`/api/users/search?id=${searchId}`);
      const data = await res.json();
      
      if (res.ok && data) {
        if (data.teamId) {
          setError('เพื่อนคนนี้มีกลุ่มอยู่แล้ว');
        } else {
          setFoundUser(data);
        }
      } else {
        setError('ไม่พบรายชื่อนักศึกษาในระบบ');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <UserPlus className="text-emerald-500" size={24} /> เชิญสมาชิกเข้ากลุ่ม
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">ค้นหาด้วยรหัสนักศึกษา</label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm outline-none dark:text-white focus:ring-2 focus:ring-emerald-500"
                placeholder="ระบุรหัสนักศึกษา 13 หลัก"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="!py-2">
                <Search size={18} />
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {foundUser && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-600 font-bold uppercase">พบข้อมูลนักศึกษา</p>
                  <p className="font-bold dark:text-white">{foundUser.firstname} {foundUser.lastname}</p>
                  <p className="text-xs text-gray-500">{foundUser.users_id}</p>
                </div>
                <Button 
                  variant="primary" 
                  className="!bg-emerald-600 hover:!bg-emerald-700 !text-white !py-2 !px-4"
                  onClick={() => onInvite(foundUser.users_id)}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'เพิ่มเข้ากลุ่ม'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};