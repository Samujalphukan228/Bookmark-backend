"use client"

import { useState } from "react"
import { Bookmark } from "@/types"
import { formatDate, getDomain } from "@/lib/utils"
import { bookmarkApi } from "@/lib/api"
import { 
    HiOutlineBookmark, 
    HiOutlinePencil, 
    HiOutlineTrash,
    HiOutlineExternalLink 
} from "react-icons/hi"

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
        <div className="border border-neutral-800 rounded p-4 hover:border-neutral-700 hover:bg-neutral-900/50 transition-colors group">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0 group-hover:border-neutral-700">
                        <HiOutlineBookmark className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                        <h3 className="text-sm font-medium text-white truncate">
                            {bookmark.title}
                        </h3>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors mt-0.5"
                        >
                            <span className="truncate">{getDomain(bookmark.url)}</span>
                            <HiOutlineExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                        onClick={() => onEdit(bookmark)}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors touch-manipulation"
                    >
                        <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-1.5 rounded hover:bg-red-950/50 text-neutral-500 hover:text-red-400 disabled:opacity-50 transition-colors touch-manipulation"
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            {bookmark.description && (
                <p className="text-xs text-neutral-500 mt-3 line-clamp-2">
                    {bookmark.description}
                </p>
            )}

            {/* Tags */}
            {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {bookmark.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 border border-neutral-800 text-neutral-500 rounded text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="text-xs text-neutral-600 mt-3">
                {formatDate(bookmark.created_at)}
            </div>

        </div>
    )
}