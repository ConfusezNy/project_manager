// Section Module - Barrel Export
// Usage: import { SectionDashboard, SectionCard } from '@/modules/section';

// Components
export { SectionDashboard } from "./components/SectionDashboard";
export { SectionCard } from "./components/SectionCard";
export { CreateTermModal } from "./components/CreateTermModal";
export { CreateSectionModal } from "./components/CreateSectionModal";
export { EnrollmentsModal } from "./components/EnrollmentsModal";
export { EnrollModal } from "./components/EnrollModal";
export { ContinueModal } from "./components/ContinueModal";

// Hooks
export { useSectionData } from "./hooks/useSectionData";

// Services
export { sectionService } from "./services/sectionService";

// Types
export type {
  Section,
  Term,
  Candidate,
  Enrollment,
  CreateSectionForm,
  CreateTermForm,
} from "./services/sectionService";
