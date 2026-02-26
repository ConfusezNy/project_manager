"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import type { Comment } from "../types/comment.types";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (text: string) => Promise<void>;
    title?: string;
    maxHeight?: string;
    disabled?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    onAddComment,
    title = "Comments",
    maxHeight = "max-h-60",
    disabled = false,
}) => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} />
                {title} ({comments.length})
            </h3>

            {/* Comment List */}
            <div className={`space-y-3 ${maxHeight} overflow-y-auto pr-1 custom-scrollbar`}>
                {comments.length > 0 ? (
                    comments.map((c) => <CommentItem key={c.comment_id} comment={c} />)
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        ยังไม่มี comment
                    </p>
                )}
            </div>

            {/* Add Comment Form */}
            <CommentForm onSubmit={onAddComment} disabled={disabled} />
        </div>
    );
};

export default CommentSection;
