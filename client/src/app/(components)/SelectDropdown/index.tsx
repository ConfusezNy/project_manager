import React from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface SelectDropdownProps {
  label?: string;
  options?: Option[];
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "กรุณาเลือกรายการ..." 
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {label && (
        // ปรับสี Label ให้อ่านง่ายใน Dark Mode
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // เพิ่ม Class สำหรับ Dark Mode ตรงนี้
        className="block w-full px-3 py-2 sm:text-sm rounded-md shadow-sm 
                   bg-white border border-gray-300 text-gray-900
                   dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                   transition-colors"
      >
        <option value="" disabled className="text-gray-500 dark:text-gray-400">
          {placeholder}
        </option>

        {options.map((option, index) => (
          <option key={option.value || index} value={option.value} className="dark:bg-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectDropdown;