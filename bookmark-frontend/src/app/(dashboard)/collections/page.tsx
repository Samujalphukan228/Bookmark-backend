"use client"

import { useEffect, useState } from "react"
import { Collection, Bookmark } from "@/types"
import { collectionApi } from "@/lib/api"
import CollectionCard from "@/components/collections/CollectionCard"
import CollectionForm from "@/components/collections/CollectionForm"
import { getDomain, formatDate } from "@/lib/utils"
import { 
    HiOutlinePlus, 
    HiOutlineFolder, 
    HiOutlineBookmark,
    HiOutlineExternalLink,
    HiOutlineArrowLeft
} from "react-icons/hi"

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

    function handleBack() {
        setSelectedCollection(null)
        setCollectionBookmarks([])
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                        Collections
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">
                        {collections.length} {collections.length === 1 ? 'collection' : 'collections'} total
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors touch-manipulation"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>New Collection</span>
                </button>
            </div>

            {/* Mobile: Show either list or detail */}
            <div className="lg:hidden">
                {selectedCollection ? (
                    // Mobile Detail View
                    <div className="space-y-4">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors touch-manipulation"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to collections
                        </button>

                        <div className="border border-neutral-800 rounded">
                            <div className="p-4 border-b border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <HiOutlineFolder className="w-5 h-5 text-neutral-500" />
                                    <div>
                                        <h2 className="text-sm font-medium text-white">
                                            {selectedCollection.name}
                                        </h2>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {selectedCollection.bookmark_count} bookmarks
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loadingBookmarks ? (
                                <div className="p-8 flex justify-center">
                                    <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
                                </div>
                            ) : collectionBookmarks.length > 0 ? (
                                <div className="divide-y divide-neutral-800">
                                    {collectionBookmarks.map((bookmark) => (
                                        <a
                                            key={bookmark.id}
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 flex items-center gap-3 hover:bg-neutral-900 transition-colors touch-manipulation block"
                                        >
                                            <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                                                <HiOutlineBookmark className="w-4 h-4 text-neutral-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-white truncate">
                                                    {bookmark.title}
                                                </p>
                                                <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                    {getDomain(bookmark.url)}
                                                </p>
                                            </div>
                                            <HiOutlineExternalLink className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <HiOutlineBookmark className="w-6 h-6 text-neutral-700 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-500">No bookmarks in this collection</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Mobile List View
                    <div className="space-y-3">
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
                            <div className="py-16 text-center border border-dashed border-neutral-800 rounded">
                                <HiOutlineFolder className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                                <p className="text-sm text-white mb-1">No collections yet</p>
                                <p className="text-xs text-neutral-500 mb-4">
                                    Organize your bookmarks into collections
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition-colors touch-manipulation"
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                    New Collection
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">

                {/* Collections List */}
                <div className="space-y-3">
                    {collections.length > 0 ? (
                        collections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                onClick={handleCollectionClick}
                                isSelected={selectedCollection?.id === collection.id}
                            />
                        ))
                    ) : (
                        <div className="py-16 text-center border border-dashed border-neutral-800 rounded">
                            <HiOutlineFolder className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">No collections yet</p>
                            <p className="text-xs text-neutral-500">
                                Create one to get started
                            </p>
                        </div>
                    )}
                </div>

                {/* Collection Detail */}
                <div className="lg:col-span-2">
                    {selectedCollection ? (
                        <div className="border border-neutral-800 rounded">
                            <div className="p-5 border-b border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <HiOutlineFolder className="w-5 h-5 text-neutral-500" />
                                    <div>
                                        <h2 className="text-sm font-medium text-white">
                                            {selectedCollection.name}
                                        </h2>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {selectedCollection.bookmark_count} bookmarks
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loadingBookmarks ? (
                                <div className="p-12 flex justify-center">
                                    <div className="w-5 h-5 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
                                </div>
                            ) : collectionBookmarks.length > 0 ? (
                                <div className="divide-y divide-neutral-800">
                                    {collectionBookmarks.map((bookmark) => (
                                        <a
                                            key={bookmark.id}
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 flex items-center justify-between hover:bg-neutral-900 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center flex-shrink-0 group-hover:border-neutral-700">
                                                    <HiOutlineBookmark className="w-4 h-4 text-neutral-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white truncate">
                                                        {bookmark.title}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                        {getDomain(bookmark.url)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                                <span className="text-xs text-neutral-600">
                                                    {formatDate(bookmark.created_at)}
                                                </span>
                                                <HiOutlineExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <HiOutlineBookmark className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                                    <p className="text-sm text-white mb-1">No bookmarks yet</p>
                                    <p className="text-xs text-neutral-500">
                                        Add bookmarks to this collection
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border border-dashed border-neutral-800 rounded p-12 text-center">
                            <HiOutlineFolder className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-white mb-1">Select a collection</p>
                            <p className="text-xs text-neutral-500">
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