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
    Team?: {
        team_id: number;
        groupNumber?: number;
        Section?: { section_code: string };
    };
    Task?: { task_id: number; title: string };
    Project?: { project_id: number; projectname: string };
    // Backend ส่งมาเป็นชื่อยาว — map ตรงนี้
    Users_Notification_actor_user_idToUsers?: {
        users_id: string;
        firstname: string;
        lastname: string;
    };
}
