"use client"

import { useState } from "react"
import { Collection } from "@/types"
import { collectionApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"

interface CollectionCardProps {
    collection: Collection
    onDelete: (id: string) => void
    onEdit: (collection: Collection) => void
    onClick: (collection: Collection) => void
}

export default function CollectionCard({
    collection,
    onDelete,
    onEdit,
    onClick,
}: CollectionCardProps) {

    const [deleting, setDeleting] = useState(false)

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm("Delete this collection? Bookmarks will not be deleted.")) return
        setDeleting(true)
        try {
            await collectionApi.delete(collection.id)
            onDelete(collection.id)
        } catch {
            alert("Failed to delete collection")
        } finally {
            setDeleting(false)
        }
    }

    function handleEdit(e: React.MouseEvent) {
        e.stopPropagation()
        onEdit(collection)
    }

    return (
        <div
            onClick={() => onClick(collection)}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="text-3xl">📁</div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleEdit}
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

            {/* Info */}
            <div className="mt-3">
                <h3 className="font-medium text-gray-900">
                    {collection.name}
                </h3>
                {collection.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {collection.description}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">
                    {collection.bookmark_count} bookmarks
                </span>
                <span className="text-xs text-gray-400">
                    {formatDate(collection.created_at)}
                </span>
            </div>

        </div>
    )
}