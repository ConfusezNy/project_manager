"use client";

// CalendarMini - Mini calendar showing current month with highlighted dates
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarMiniProps {
  highlightedDates?: { date: Date; color: string; label: string }[];
  onDateClick?: (date: Date) => void;
}

export const CalendarMini: React.FC<CalendarMiniProps> = ({
  highlightedDates = [],
  onDateClick,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthNames = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const getHighlight = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return highlightedDates.find((h) => isSameDay(h.date, date));
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Build calendar grid (always 6 rows x 7 cols = 42 cells for consistent layout)
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  // Fill remaining cells
  while (days.length < 42) {
    days.push(null);
  }

  const buddhistYear = currentMonth.getFullYear() + 543;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          📆 ปฏิทิน
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-20 text-center">
            {monthNames[currentMonth.getMonth()]} {buddhistYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day, idx) => (
          <div
            key={`header-${idx}`}
            className={`text-center text-xs font-medium py-1 ${
              idx === 0
                ? "text-red-400"
                : idx === 6
                  ? "text-blue-400"
                  : "text-gray-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`} className="w-full aspect-square" />
            );
          }

          const highlight = getHighlight(day);
          const today = isToday(day);
          const dayOfWeek = (firstDay + day - 1) % 7;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <button
              key={`day-${day}`}
              onClick={() => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day,
                );
                onDateClick?.(date);
              }}
              className={`
                relative w-full aspect-square flex items-center justify-center 
                text-sm rounded-lg transition-all
                ${
                  today
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : highlight
                      ? "bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-600 dark:text-blue-400"
                      : isSunday
                        ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : isSaturday
                          ? "text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
              title={highlight?.label}
            >
              {day}
              {highlight && !today && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: highlight.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {highlightedDates.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-500">ผ่านแล้ว</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-500">รอส่ง</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarMini;
