import React from 'react';
import { FileText, Download } from 'lucide-react';

interface Props {
    data: any[];
    selectedYear: string;
}

const DocumentsView: React.FC<Props> = ({ data, selectedYear }) => {
    const docs = data.filter(i => i.hasDoc);

    return (
        <div className="w-full animate-in fade-in duration-300">
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] shadow-sm">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-6 py-4">ชื่อเอกสาร</th>
                            <th className="px-6 py-4">กิจกรรม</th>
                            <th className="px-6 py-4">ปีการศึกษา</th>
                            <th className="px-6 py-4 text-right">ดาวน์โหลด</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {docs.length > 0 ? (
                            docs.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileText size={16} className="text-blue-500" />Doc_{item.week}_{item.id}.pdf
                                    </td>
                                    <td className="px-6 py-4">{item.title}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-xs">{item.year}</span></td>
                                    <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:text-blue-800 dark:text-blue-400"><Download size={18} /></button></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">ไม่พบเอกสารในปีการศึกษา {selectedYear}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentsView;
