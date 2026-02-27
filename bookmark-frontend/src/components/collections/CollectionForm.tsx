"use client"

import { useState } from "react"
import { Collection, CreateCollectionInput } from "@/types"
import { collectionApi } from "@/lib/api"

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {collection ? "Edit Collection" : "New Collection"}
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
                            Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Collection"
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
                            {loading ? "Saving..." : collection ? "Update" : "Create"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}