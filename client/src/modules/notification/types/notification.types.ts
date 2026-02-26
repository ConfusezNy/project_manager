// Notification Types
export interface NotificationItem {
    notification_id: number;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    event_type: string;
    link?: string | null;
    team_id?: number | null;
    task_id?: number | null;
    project_id?: number | null;
    team?: {
        team_id: number;
        name: string;
        section?: {
            section_code: string;
        };
    };
    actor?: {
        firstname: string;
        lastname: string;
    };
}
