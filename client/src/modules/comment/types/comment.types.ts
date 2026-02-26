// Comment Types - Shared type definitions for comment module
// Re-exports TaskComment from task types for backwards compatibility

export interface CommentUser {
    users_id: string;
    firstname?: string | null;
    lastname?: string | null;
    email?: string | null;
    profilePicture?: string | null;
}

export interface Comment {
    comment_id: number;
    text: string;
    createdAt: Date | string;
    isRead: boolean;
    users_id: string;
    user?: CommentUser;
}
