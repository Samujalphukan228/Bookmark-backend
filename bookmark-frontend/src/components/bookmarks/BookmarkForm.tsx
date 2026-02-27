"use client"

import { useState, useEffect } from "react"
import { Bookmark, Collection, CreateBookmarkInput } from "@/types"
import { bookmarkApi, collectionApi } from "@/lib/api"

interface BookmarkFormProps {
    bookmark?: Bookmark
    onSuccess: (bookmark: Bookmark) => void
    onCancel: () => void
}

export default function BookmarkForm({
    bookmark,
    onSuccess,
    onCancel,
}: BookmarkFormProps) {

    const [title, setTitle] = useState(bookmark?.title || "")
    const [url, setUrl] = useState(bookmark?.url || "")
    const [description, setDescription] = useState(bookmark?.description || "")
    const [tags, setTags] = useState(bookmark?.tags.join(", ") || "")
    const [collectionId, setCollectionId] = useState(bookmark?.collection_id || "")
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        collectionApi.list()
            .then((res) => setCollections(res.data))
            .catch(() => {})
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        const data: CreateBookmarkInput = {
            title,
            url,
            description: description || undefined,
            tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            collection_id: collectionId || undefined,
        }

        try {
            let response
            if (bookmark) {
                response = await bookmarkApi.update(bookmark.id, data)
            } else {
                response = await bookmarkApi.create(data)
            }
            onSuccess(response.data)
        } catch (err: any) {
            setError(err.response?.data || "Failed to save bookmark")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {bookmark ? "Edit Bookmark" : "Add Bookmark"}
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My bookmark"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL *
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="dev, rust, code (comma separated)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection
                        </label>
                        <select
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">No collection</option>
                            {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Saving..." : bookmark ? "Update" : "Add Bookmark"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}