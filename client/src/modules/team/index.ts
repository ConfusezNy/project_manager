// Team Module - Barrel Export
// Usage: import { TeamDashboard, CreateTeamModal, TeamMembersTable } from '@/modules/team';

// Components
export { TeamDashboard } from "./components/TeamDashboard";
export { AdvisorTeamsDashboard } from "./components/AdvisorTeamsDashboard";
export { CreateTeamModal } from "./components/CreateTeamModal";
export { TeamMembersTable } from "./components/TeamMembersTable";
export { InviteMemberModal } from "./components/InviteMemberModal";
export { TeamHeader } from "./components/TeamHeader";
export { TeamProjectDetail } from "./components/TeamProjectDetail";
export { TeamSettingsModal } from "./components/TeamSettingsModal";
export { TeamInfoCards } from "./components/TeamInfoCards";
export { EmptyTeamState } from "./components/EmptyTeamState";
export { PendingInvites } from "./components/PendingInvites";
export { TeamStatusCard } from "./components/TeamStatusCard";
export { AdvisorCard } from "./components/AdvisorCard";
export { ConfirmModal } from "./components/ConfirmModal";

// Hooks
export { useTeamData } from "./hooks/useTeamData";
export { useAdvisorTeams } from "./hooks/useAdvisorTeams";

// Services
export { teamService } from "./services/teamService";
export { projectService } from "./services/projectService";

// Types
export type {
  TeamData,
  TeamMember,
  PendingInvite,
  AvailableStudent,
} from "./services/teamService";
export type {
  ProjectData,
  ProjectFormData,
  ProjectAdvisor,
} from "./services/projectService";
export type { UseTeamDataReturn } from "./hooks/useTeamData";
export type { AdvisorProject } from "./hooks/useAdvisorTeams";
