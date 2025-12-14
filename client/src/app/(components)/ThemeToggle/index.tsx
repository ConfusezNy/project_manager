"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="h-6 w-6 text-gray-500 dark:text-gray-300" />
        ) : (
          <Moon className="h-6 w-6 text-gray-500 dark:text-gray-300" />
        )
      ) : (
        <div className="h-6 w-6" /> // Placeholder
      )}
    </button>
  );
};

export default ThemeToggle;