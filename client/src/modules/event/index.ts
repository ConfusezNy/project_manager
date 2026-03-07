// Event Module - Barrel Export
// Usage: import { EventList, EventCard, eventService } from '@/modules/event';

// Components
export { EventList } from "./components/EventList";
export { EventCard } from "./components/EventCard";
export { EventListItem } from "./components/EventListItem";
export { SubmitModal } from "./components/SubmitModal";
export { AdvisorEventsDashboard } from "./components/AdvisorEventsDashboard";

// Admin Event Components
export { AdminEventsPage } from "./components/AdminEventsPage";
export { EventTable } from "./components/EventTable";
export { CreateEventModal } from "./components/CreateEventModal";
export { EventDetailDrawer } from "./components/EventDetailDrawer";
export {
  StatusBadge,
  RequireFileBadge,
} from "./components/StatusBadge";

// Hooks
export { useEventManagement } from "./hooks/useEventManagement";
export { useStudentEvents } from "./hooks/useStudentEvents";

// Services
export { eventService } from "./services/eventService";

// Types
export type {
  Event,
  Submission,
  SubmissionStatus,
  CreateEventInput,
  UpdateEventInput,
} from "./types/event.types";

export {
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from "./types/event.types";
