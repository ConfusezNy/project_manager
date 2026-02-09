"use client";

// TaskStatusChart - Donut chart showing task status distribution
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TaskStatusChartProps {
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

const STATUS_COLORS = {
  done: "#22c55e", // green
  inProgress: "#3b82f6", // blue
  todo: "#f59e0b", // orange
};

const STATUS_LABELS = {
  done: "เสร็จสิ้น",
  inProgress: "กำลังดำเนินการ",
  todo: "ต้องทำ",
};

export const TaskStatusChart: React.FC<TaskStatusChartProps> = ({
  todoCount,
  inProgressCount,
  doneCount,
}) => {
  const total = todoCount + inProgressCount + doneCount;

  const data = [
    { name: STATUS_LABELS.done, value: doneCount, color: STATUS_COLORS.done },
    {
      name: STATUS_LABELS.inProgress,
      value: inProgressCount,
      color: STATUS_COLORS.inProgress,
    },
    { name: STATUS_LABELS.todo, value: todoCount, color: STATUS_COLORS.todo },
  ].filter((item) => item.value > 0);

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">ยังไม่มี Task</p>
      </div>
    );
  }

  const CustomLabel = ({ cx, cy }: any) => (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-900 dark:fill-white"
    >
      <tspan x={cx} dy="-0.3em" fontSize="24" fontWeight="bold">
        {total}
      </tspan>
      <tspan x={cx} dy="1.5em" fontSize="12" className="fill-gray-500">
        งาน
      </tspan>
    </text>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        📋 สถานะงาน
      </h3>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} งาน`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusChart;
