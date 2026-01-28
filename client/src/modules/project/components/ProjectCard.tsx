import React from "react";
import { Calendar, User, ArrowRight } from "lucide-react";

export interface ProjectData {
  id: string | number;
  title: string;
  description?: string;
  category: string;
  year: string;
  author: string;
}

interface ProjectCardProps {
  data: ProjectData;
  onClick?: (id: string | number) => void;
}

export const ProjectCardSkeleton = () => {
  return (
    <div className="h-full border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex justify-between mb-4">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
        <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md mb-3"></div>
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
};

const getCategoryStyle = (type: string) => {
  switch (type) {
    case "IoT":
    case "internet_of_thing":
      return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "WebApplication":
      return "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600";
  }
};

export const ProjectCard = ({ data, onClick }: ProjectCardProps) => {
  if (!data) return null;

  return (
    <div
      onClick={() => onClick && onClick(data.id)}
      className="group relative h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-2 py-1 rounded-md text-xs font-semibold border ${getCategoryStyle(data.category)}`}
        >
          {data.category === "internet_of_thing" ? "IoT" : data.category}
        </span>
        <div className="flex items-center text-gray-400 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
          <Calendar className="w-3 h-3 mr-1" />
          {data.year}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {data.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {data.description || "ไม่มีรายละเอียดสังเขป"}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
            {data.author}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
