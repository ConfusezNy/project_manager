import React from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import Button from "@/app/(components)/Button";
import CardTimeline from "@/app/(components)/CardTimeline";

interface TimelineItem {
  id: number;
  week: number;
  title: string;
  date: string;
  hasDoc: boolean;
  status: "active" | "pending" | "inactive";
  year: string;
}

interface Props {
  data: TimelineItem[];
  selectedYear: string;
  onEdit: (id: number) => void;
  onCreate: () => void;
  isAdmin: boolean; // ✅ รับ Prop สิทธิ์
}

const TimelineListView: React.FC<Props> = ({
  data,
  selectedYear,
  onEdit,
  onCreate,
  isAdmin,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in zoom-in duration-500 min-h-[400px]">
        <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-full mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <FilePlus size={64} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
          ไม่พบข้อมูลปีการศึกษา {selectedYear}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center mb-6">
          {isAdmin
            ? "คุณยังไม่ได้สร้างแผนการเรียนสำหรับปีนี้"
            : "ยังไม่มีการประกาศแผนการเรียนสำหรับปีนี้"}
        </p>
        {/* ✅ แสดงปุ่มสร้างแผนเฉพาะ Admin */}
        {isAdmin && (
          <Button variant="primary" onClick={onCreate}>
            สร้างแผนการเรียน {selectedYear}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {data.map((item, index) => {
        const isActive = item.status === "active";
        const isLast = index === data.length - 1;
        const isNextActive = data[index + 1]?.status === "active";

        return (
          <div
            key={item.id}
            className="relative flex gap-4 sm:gap-6 pb-6 group w-full"
          >
            <div className="flex flex-col items-center mt-1 w-6 sm:w-8 flex-shrink-0">
              <div
                className={`relative z-10 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-[3px] sm:border-4 transition-all duration-500 ${
                  isActive
                    ? "border-green-500 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                    : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-[#121212]"
                }`}
              />

              {!isLast && (
                <div
                  className={`absolute top-5 bottom-[-6px] w-[2px] transition-colors duration-500 ${
                    isActive && isNextActive
                      ? "bg-green-500/40"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>

            <Link href={`/timeline/${item.id}`} className="flex-1 min-w-0">
              <CardTimeline
                weekNumber={item.week}
                title={item.title}
                date={item.date}
                hasDoc={item.hasDoc}
                // ✅ ส่งฟังก์ชัน onEdit ไปเฉพาะ Admin เท่านั้น
                onEdit={
                  isAdmin
                    ? (e) => {
                        e?.preventDefault();
                        e?.stopPropagation();
                        onEdit(item.id);
                      }
                    : undefined
                }
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineListView;
