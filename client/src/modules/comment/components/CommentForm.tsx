"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

interface CommentFormProps {
    onSubmit: (text: string) => Promise<void>;
    placeholder?: string;
    disabled?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
    onSubmit,
    placeholder = "เขียน comment...",
    disabled = false,
}) => {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        try {
            await onSubmit(text.trim());
            setText("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                disabled={disabled || submitting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow placeholder:text-gray-400 disabled:opacity-50"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            />
            <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim() || disabled}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
                <Send size={16} />
            </button>
        </div>
    );
};

export default CommentForm;
