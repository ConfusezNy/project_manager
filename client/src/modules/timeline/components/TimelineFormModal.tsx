import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Upload } from 'lucide-react';
import Modal from '@/shared/components/Modal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
    onSubmit: (formData: any) => void;
    year: string;
}

const TimelineFormModal: React.FC<Props> = ({ isOpen, onClose, initialData, onSubmit, year }) => {
    const [formData, setFormData] = useState({ title: '', description: '', date: '', startTime: '', hasDoc: false });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const dateStr = initialData.isoDateTime.split('T')[0];
                const timeStr = new Date(initialData.isoDateTime).toTimeString().slice(0, 5);
                setFormData({ title: initialData.title, description: initialData.description || '', date: dateStr, startTime: timeStr, hasDoc: initialData.hasDoc });
            } else {
                setFormData({ title: '', description: '', date: '', startTime: '', hasDoc: false });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? `แก้ไขรายการ (ปี ${year})` : `เพิ่มรายการใหม่ (ปี ${year})`}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">หัวข้อ</label>
                    <input type="text" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รายละเอียด</label>
                    <textarea rows={3} className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">วันที่</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Calendar className="w-4 h-4 text-gray-500" /></div>
                            <input type="date" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white [color-scheme:light] dark:[color-scheme:dark]" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">เวลา</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Clock className="w-4 h-4 text-gray-500" /></div>
                            <input type="time" className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm dark:border-gray-600 dark:bg-[#2c2c2e] dark:text-white [color-scheme:light] dark:[color-scheme:dark]" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                        </div>
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="hasDoc" className="w-4 h-4" checked={formData.hasDoc} onChange={e => setFormData({ ...formData, hasDoc: e.target.checked })} />
                        <label htmlFor="hasDoc" className="text-sm font-medium text-gray-900 dark:text-gray-300">สถานะ: มีเอกสารประกอบแล้ว</label>
                    </div>
                    {formData.hasDoc && (
                        <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-[#2c2c2e]"><Upload className="w-8 h-8 mb-2 text-gray-400" /></div>
                    )}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm hover:bg-gray-100 border dark:text-gray-300 dark:border-gray-600">ยกเลิก</button>
                    <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm text-white hover:bg-blue-800 dark:bg-blue-600">บันทึก</button>
                </div>
            </form>
        </Modal>
    );
};

export default TimelineFormModal;
