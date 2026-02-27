"use client"

import { useState } from "react"
import { Bookmark } from "@/types"
import { formatDate, getDomain } from "@/lib/utils"
import { bookmarkApi } from "@/lib/api"

interface BookmarkCardProps {
    bookmark: Bookmark
    onDelete: (id: string) => void
    onEdit: (bookmark: Bookmark) => void
}

export default function BookmarkCard({
    bookmark,
    onDelete,
    onEdit,
}: BookmarkCardProps) {

    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm("Delete this bookmark?")) return
        setDeleting(true)
        try {
            await bookmarkApi.delete(bookmark.id)
            onDelete(bookmark.id)
        } catch {
            alert("Failed to delete bookmark")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors group">

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                        🔖
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {bookmark.title}
                        </h3>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block"
                        >
                            {getDomain(bookmark.url)}
                        </a>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                        onClick={() => onEdit(bookmark)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 disabled:opacity-50"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Description */}
            {bookmark.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {bookmark.description}
                </p>
            )}

            {/* Tags */}
            {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {bookmark.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="text-xs text-gray-400 mt-3">
                {formatDate(bookmark.created_at)}
            </div>

        </div>
    )
}