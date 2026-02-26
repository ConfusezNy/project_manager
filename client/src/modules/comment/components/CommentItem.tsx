"use client";

import React from "react";
import type { Comment } from "../types/comment.types";

interface CommentItemProps {
    comment: Comment;
}

const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
    const initial = comment.user?.firstname?.[0] || "U";

    return (
        <div className="flex gap-3 group">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {initial}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user?.firstname} {comment.user?.lastname}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(comment.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {comment.text}
                </p>
            </div>
        </div>
    );
};

export default CommentItem;
