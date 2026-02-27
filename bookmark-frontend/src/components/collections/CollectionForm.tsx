"use client"

import { useState } from "react"
import { Collection, CreateCollectionInput } from "@/types"
import { collectionApi } from "@/lib/api"
import { HiOutlineX, HiOutlineExclamation } from "react-icons/hi"

interface CollectionFormProps {
    collection?: Collection
    onSuccess: (collection: Collection) => void
    onCancel: () => void
}

export default function CollectionForm({
    collection,
    onSuccess,
    onCancel,
}: CollectionFormProps) {

    const [name, setName] = useState(collection?.name || "")
    const [description, setDescription] = useState(collection?.description || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        const data: CreateCollectionInput = {
            name,
            description: description || undefined,
        }

        try {
            let response
            if (collection) {
                response = await collectionApi.update(collection.id, data)
            } else {
                response = await collectionApi.create(data)
            }
            onSuccess(response.data)
        } catch (err: any) {
            setError(err.response?.data || "Failed to save collection")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-black border border-neutral-800 w-full sm:max-w-md sm:rounded-lg">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                    <h2 className="text-base font-medium text-white">
                        {collection ? "Edit Collection" : "New Collection"}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-1 text-neutral-500 hover:text-white transition-colors touch-manipulation"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-red-900/50 bg-red-950/20 rounded text-sm text-red-400">
                            <HiOutlineExclamation className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Collection"
                            required
                            autoFocus
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
                            placeholder="What's this collection for?"
                            rows={3}
                            className="w-full px-3 py-2.5 bg-black border border-neutral-800 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
                        />
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
                            disabled={loading || !name.trim()}
                            className="w-full sm:flex-1 px-4 py-2.5 bg-white text-black rounded text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-neutral-400 border-t-black rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                collection ? "Save changes" : "Create collection"
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}