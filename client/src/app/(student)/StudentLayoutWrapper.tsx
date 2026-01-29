"use client";

// Student Layout Wrapper - Client component that provides project context
import { ProjectProvider } from "@/context/ProjectContext";
import { ReactNode } from "react";

interface StudentLayoutWrapperProps {
  children: ReactNode;
}

export function StudentLayoutWrapper({ children }: StudentLayoutWrapperProps) {
  return <ProjectProvider>{children}</ProjectProvider>;
}
