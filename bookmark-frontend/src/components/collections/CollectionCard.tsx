"use client"

import { useState } from "react"
import { Collection } from "@/types"
import { collectionApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { HiOutlineFolder, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi"

interface CollectionCardProps {
    collection: Collection
    onDelete: (id: string) => void
    onEdit: (collection: Collection) => void
    onClick: (collection: Collection) => void
    isSelected?: boolean
}

export default function CollectionCard({
    collection,
    onDelete,
    onEdit,
    onClick,
    isSelected = false,
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
            className={`
                border rounded p-4 cursor-pointer transition-colors touch-manipulation group
                ${isSelected 
                    ? 'bg-white border-white' 
                    : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }
            `}
        >

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <HiOutlineFolder className={`w-5 h-5 flex-shrink-0 ${
                        isSelected ? 'text-black' : 'text-neutral-500'
                    }`} />
                    <div className="min-w-0">
                        <h3 className={`text-sm font-medium truncate ${
                            isSelected ? 'text-black' : 'text-white'
                        }`}>
                            {collection.name}
                        </h3>
                        <p className={`text-xs mt-0.5 ${
                            isSelected ? 'text-neutral-600' : 'text-neutral-500'
                        }`}>
                            {collection.bookmark_count} {collection.bookmark_count === 1 ? 'bookmark' : 'bookmarks'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className={`
                    flex items-center gap-1 
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    transition-opacity
                `}>
                    <button
                        onClick={handleEdit}
                        className={`p-1.5 rounded transition-colors ${
                            isSelected 
                                ? 'hover:bg-neutral-200 text-neutral-600 hover:text-black' 
                                : 'hover:bg-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                    >
                        <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                            isSelected 
                                ? 'hover:bg-red-100 text-neutral-600 hover:text-red-600' 
                                : 'hover:bg-red-950/50 text-neutral-500 hover:text-red-400'
                        }`}
                    >
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Description */}
            {collection.description && (
                <p className={`text-xs mt-2 line-clamp-2 ${
                    isSelected ? 'text-neutral-600' : 'text-neutral-500'
                }`}>
                    {collection.description}
                </p>
            )}

        </div>
    )
}