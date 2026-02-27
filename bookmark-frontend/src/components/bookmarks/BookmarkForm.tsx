"use client"

import { useState, useEffect } from "react"
import { Bookmark, Collection, CreateBookmarkInput } from "@/types"
import { bookmarkApi, collectionApi } from "@/lib/api"
import { HiOutlineX, HiOutlineExclamation } from "react-icons/hi"

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
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-black border border-neutral-800 w-full sm:max-w-md sm:rounded-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 flex-shrink-0">
                    <h2 className="text-base font-medium text-white">
                        {bookmark ? "Edit Bookmark" : "Add Bookmark"}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-1 text-neutral-500 hover:text-white transition-colors touch-manipulation"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-red-900/50 bg-red-950/20 rounded text-sm text-red-400">
                            <HiOutlineExclamation className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            autoFocus
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Page title"
                            required
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Description
                            <span className="text-neutral-600 ml-1">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this page about?"
                            rows={2}
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Tags
                            <span className="text-neutral-600 ml-1">(comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="dev, rust, tutorial"
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Collection
                            <span className="text-neutral-600 ml-1">(optional)</span>
                        </label>
                        <select
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-neutral-600 transition-colors appearance-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
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
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:flex-1 px-4 py-2.5 border border-neutral-800 rounded text-sm font-medium text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors touch-manipulation"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !url.trim() || !title.trim()}
                            className="w-full sm:flex-1 px-4 py-2.5 bg-white text-black rounded text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                bookmark ? "Save changes" : "Add bookmark"
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}