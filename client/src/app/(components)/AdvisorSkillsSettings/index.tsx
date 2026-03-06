'use client';

/**
 * AdvisorSkillsSettings — ตั้งค่าความเชี่ยวชาญ/วิชาที่สอน
 * เฉพาะ role ADVISOR เท่านั้น
 * ข้อมูลจะถูกแสดงใน AdvisorSelectionModal เมื่อนักศึกษาเลือกอาจารย์
 */

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookOpen, X, Plus, Lightbulb } from 'lucide-react';

export default function AdvisorSkillsSettings() {
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // โหลด expertiseAreas จาก API
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const profile = await api.get('/profile');
                if (profile.expertiseAreas) {
                    // CSV → array of tags
                    const parsed = (profile.expertiseAreas as string)
                        .split(',')
                        .map((t: string) => t.trim())
                        .filter((t: string) => t.length > 0);
                    setTags(parsed);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // เพิ่ม tag ใหม่
    const addTag = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || tags.includes(trimmed)) return;
        setTags((prev) => [...prev, trimmed]);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }
        if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            setTags((prev) => prev.slice(0, -1));
        }
    };

    // ลบ tag
    const removeTag = (index: number) => {
        setTags((prev) => prev.filter((_, i) => i !== index));
    };

    // บันทึก
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaved(false);
            const expertiseAreas = tags.join(', ');
            await api.patch('/profile', { expertiseAreas });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : 'ไม่ทราบสาเหตุ'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-gray-500 dark:text-gray-400">กำลังโหลด...</div>;
    }

    const suggestions = ['Machine Learning', 'AI', 'Web Development', 'Database', 'Cybersecurity', 'IoT', 'Data Science', 'Software Engineering', 'Computer Networks', 'Mobile Development'];
    const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">ความเชี่ยวชาญ / วิชาที่สอน</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 ml-11">
                ข้อมูลนี้จะแสดงให้นักศึกษาเห็นเมื่อเลือกอาจารย์ที่ปรึกษา
            </p>

            {/* Tag Input Box */}
            <div className="mb-5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    สาขาความเชี่ยวชาญ
                </label>
                <div
                    className="min-h-[52px] flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition"
                >
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(i)}
                                className="hover:text-red-500 transition-colors"
                            >
                                <X size={13} />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
                        placeholder={tags.length === 0 ? 'พิมพ์แล้วกด Enter หรือ , เพื่อเพิ่ม...' : 'เพิ่มสาขา...'}
                        className="flex-1 min-w-[180px] bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">กด <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> หรือ <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">,</kbd> เพื่อเพิ่มแต่ละสาขา</p>
            </div>

            {/* Suggestions */}
            {unusedSuggestions.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        <Lightbulb size={13} />
                        คำแนะนำ
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {unusedSuggestions.slice(0, 6).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addTag(s)}
                                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-full transition"
                            >
                                <Plus size={11} /> {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
                {saved && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-in fade-in duration-200">
                        ✓ บันทึกสำเร็จแล้ว
                    </span>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
            </div>
        </div>
    );
}
