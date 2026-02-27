"use client"

import { useEffect, useState } from "react"
import { Collection, Bookmark } from "@/types"
import { collectionApi } from "@/lib/api"
import CollectionCard from "@/components/collections/CollectionCard"
import CollectionForm from "@/components/collections/CollectionForm"
import { getDomain, formatDate } from "@/lib/utils"

export default function CollectionsPage() {

    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
    const [collectionBookmarks, setCollectionBookmarks] = useState<Bookmark[]>([])
    const [loadingBookmarks, setLoadingBookmarks] = useState(false)

    useEffect(() => {
        fetchCollections()
    }, [])

    async function fetchCollections() {
        try {
            const res = await collectionApi.list()
            setCollections(res.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleCollectionClick(collection: Collection) {
        setSelectedCollection(collection)
        setLoadingBookmarks(true)
        try {
            const res = await collectionApi.get(collection.id)
            setCollectionBookmarks(res.data.bookmarks)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingBookmarks(false)
        }
    }

    function handleDelete(id: string) {
        setCollections((prev) => prev.filter((c) => c.id !== id))
        if (selectedCollection?.id === id) {
            setSelectedCollection(null)
            setCollectionBookmarks([])
        }
    }

    function handleEdit(collection: Collection) {
        setEditingCollection(collection)
        setShowForm(true)
    }

    function handleSuccess(collection: Collection) {
        if (editingCollection) {
            setCollections((prev) =>
                prev.map((c) => (c.id === collection.id ? collection : c))
            )
        } else {
            setCollections((prev) => [collection, ...prev])
        }
        setShowForm(false)
        setEditingCollection(null)
    }

    function handleCancel() {
        setShowForm(false)
        setEditingCollection(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
                    <p className="text-gray-500 mt-1">
                        {collections.length} collections total
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    + New Collection
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Collections Grid */}
                <div className="lg:col-span-1 space-y-3">
                    {collections.length > 0 ? (
                        collections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                onClick={handleCollectionClick}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-4">📁</p>
                            <p className="font-medium">No collections yet</p>
                            <p className="text-sm mt-1">
                                Click New Collection to get started
                            </p>
                        </div>
                    )}
                </div>

                {/* Collection Bookmarks */}
                <div className="lg:col-span-2">
                    {selectedCollection ? (
                        <div className="bg-white rounded-xl border border-gray-200">

                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">
                                    📁 {selectedCollection.name}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedCollection.bookmark_count} bookmarks
                                </p>
                            </div>

                            {/* Bookmarks */}
                            {loadingBookmarks ? (
                                <div className="p-8 text-center text-gray-400">
                                    Loading...
                                </div>
                            ) : collectionBookmarks.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {collectionBookmarks.map((bookmark) => (
                                        <div
                                            key={bookmark.id}
                                            className="p-4 flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                                                    🔖
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {bookmark.title}
                                                    </div>
                                                    <a
                                                        href={bookmark.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-500 hover:underline"
                                                    >
                                                        {getDomain(bookmark.url)}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 flex-shrink-0">
                                                {formatDate(bookmark.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">
                                    <p>No bookmarks in this collection</p>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                            <p className="text-4xl mb-4">👈</p>
                            <p className="font-medium">Select a collection</p>
                            <p className="text-sm mt-1">
                                Click a collection to view its bookmarks
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Form Modal */}
            {showForm && (
                <CollectionForm
                    collection={editingCollection || undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            )}

        </div>
    )
}