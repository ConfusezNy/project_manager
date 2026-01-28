import React from "react";
import { Pencil, FileText } from "lucide-react";
import Button from "../Button"; // ✅ แก้ไข Path ให้ถูกต้อง (เรียกไฟล์ข้างๆ กัน)

interface CardTimelineProps {
  weekNumber: number | string;
  title: string;
  date: string;
  hasDoc: boolean;
  onEdit?: (e?: React.MouseEvent) => void;
}

const CardTimeline: React.FC<CardTimelineProps> = ({
  weekNumber,
  title,
  date,
  hasDoc,
  onEdit,
}) => {
  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl p-5 transition-all duration-300 
      bg-white border border-gray-200 shadow-sm 
      hover:shadow-md hover:border-blue-400
      dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500"
    >
      {/* --- ส่วนเนื้อหา --- */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Week Number */}
        <div
          className="w-10 sm:w-12 text-center text-4xl sm:text-5xl font-bold 
          text-gray-300 group-hover:text-blue-600 
          dark:text-gray-600 dark:group-hover:text-blue-400 
          transition-colors duration-300"
        >
          {weekNumber}
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-1">
          <h3
            className="text-base font-bold 
            text-gray-800 group-hover:text-blue-600 
            dark:text-gray-100 dark:group-hover:text-blue-400 
            transition-colors duration-300"
          >
            {title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {date}
          </span>
        </div>
      </div>

      {/* --- ส่วนปุ่ม Action --- */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 ml-14 sm:ml-0">
        <Button variant="ghost" icon={Pencil} onClick={onEdit}>
          แก้ไข
        </Button>

        {hasDoc && (
          <button
            className="flex items-center gap-1 text-sm font-medium transition-colors
              text-blue-600 hover:text-blue-800 hover:underline
              dark:text-blue-400 dark:hover:text-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={14} className="sm:hidden" />
            เอกสาร
          </button>
        )}
      </div>
    </div>
  );
};

export default CardTimeline;
