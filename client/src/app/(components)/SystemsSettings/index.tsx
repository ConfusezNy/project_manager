'use client';

import React from 'react';

export default function SystemSettings() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-8 transition-colors duration-200">
      
      {/* 1. ตั้งค่าปีการศึกษา */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          ตั้งค่าปีการศึกษา
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ปีการศึกษาปัจจุบัน
            </label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="2567">2567</option>
              <option value="2568">2568</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ภาคการศึกษา (Semester)
            </label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="summer">ฤดูร้อน</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. เงื่อนไขปริญญานิพนธ์ */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          เงื่อนไขปริญญานิพนธ์
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              จำนวนนักศึกษาสูงสุดต่ออาจารย์ 1 ท่าน
            </label>
            <input 
              type="number" 
              defaultValue={10} 
              className="w-full md:w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              สมาชิกในกลุ่มสูงสุด (คน)
            </label>
            <input 
              type="number" 
              defaultValue={3} 
              className="w-full md:w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
        </div>
      </div>

      {/* 3. ปุ่มบันทึก */}
      <div className="pt-4 flex justify-end">
        <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-md shadow-sm transition-all font-bold">
          อัปเดตการตั้งค่าระบบ
        </button>
      </div>

    </div>
  );
}