// Event Module - Barrel Export
// Usage: import { EventList, EventCard, eventService } from '@/modules/event';

// Components
export { EventList } from "./components/EventList";
export { EventCard } from "./components/EventCard";
export { EventListItem } from "./components/EventListItem";
export { SubmitModal } from "./components/SubmitModal";
export { AdvisorEventsDashboard } from "./components/AdvisorEventsDashboard";

// Services
export { eventService } from "./services/eventService";

// Types
export type {
  Event,
  Submission,
  EventType,
  SubmissionStatus,
  CreateEventInput,
  UpdateEventInput,
} from "./types/event.types";

export {
  EVENT_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_COLORS,
} from "./types/event.types";
